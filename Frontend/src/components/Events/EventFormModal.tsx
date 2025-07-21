import { useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Event } from '../../types/Event/Event';
import { useEventForm, getInitialValues } from '../../hooks/Events/UseEventForm';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event | null;
  onSuccess: () => void;
}

const modalVariants: Variants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } },
  exit: { scale: 0.95, opacity: 0, transition: { duration: 0.2 } }
};

const errorShakeVariants: Variants = {
  shake: { x: [0, -8, 8, -4, 4, 0], transition: { duration: 0.4 } },
  initial: { x: 0 }
};

export default function EventFormModal({ isOpen, onClose, event, onSuccess }: EventFormModalProps) {
  const {
    formMethods,
    isLoading,
    apiError,
    hasPause,
    onSubmit
  } = useEventForm(event ?? null, onSuccess);

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting }, clearErrors } = formMethods;
  const hasValidationErrors = Object.keys(errors).length > 0;
  const buttonText = event ? 'Salvar Alterações' : 'Criar Evento';

  useEffect(() => {
    if (isOpen) {
      reset(getInitialValues(event ?? null));
      clearErrors();
    }
  }, [isOpen, event, reset, clearErrors]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          static
          open={isOpen}
          onClose={isLoading ? () => {} : onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white dark:bg-neutral-800 rounded-2xl shadow-strong w-full max-w-2xl flex flex-col h-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-shrink-0 flex justify-between items-center p-6">
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                {event ? 'Editar Evento' : 'Novo Evento'}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                disabled={isLoading}
                className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 disabled:opacity-50"
                aria-label="Fechar modal"
              >
                <XMarkIcon className="h-7 w-7" />
              </motion.button>
            </div>
            
            <motion.form
              layout
              variants={errorShakeVariants}
              animate={isSubmitting && hasValidationErrors ? "shake" : "initial"}
              onSubmit={handleSubmit(onSubmit)}
              className="flex-grow overflow-y-auto p-6"
              id="eventForm"
              noValidate
            >
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <div className="md:col-span-2">
                    <label htmlFor="Title" className="block text-sm font-semibold text-neutral-600 dark:text-neutral-300 mb-2">Nome do Evento *</label>
                    <input
                      id="Title"
                      {...register('Title', { required: 'Campo obrigatório' })}
                      className={`w-full border-b-2 py-2 focus:outline-none focus:border-primary transition-colors bg-transparent text-neutral-800 dark:text-neutral-100 ${errors.Title ? 'border-red-500' : 'border-neutral-200 dark:border-neutral-600'}`}
                    />
                    {errors.Title && <span className="text-red-500 text-xs block mt-1">{errors.Title.message}</span>}
                  </div>

                  <div>
                    <label htmlFor="SessionDuration" className="block text-sm font-semibold text-neutral-600 dark:text-neutral-300 mb-2">Duração (minutos) *</label>
                    <input
                      id="SessionDuration"
                      type="number"
                      {...register('SessionDuration', { required: 'Campo obrigatório', min: { value: 1, message: 'Mínimo 1 minuto' } })}
                      className={`w-full border-b-2 py-2 focus:outline-none focus:border-primary transition-colors bg-transparent text-neutral-800 dark:text-neutral-100 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${errors.SessionDuration ? 'border-red-500' : 'border-neutral-200 dark:border-neutral-600'}`}
                    />
                    {errors.SessionDuration && <span className="text-red-500 text-xs block mt-1">{errors.SessionDuration.message}</span>}
                  </div>

                  <div>
                    <label htmlFor="Location" className="block text-sm font-semibold text-neutral-600 dark:text-neutral-300 mb-2">Local *</label>
                    <input
                      id="Location"
                      {...register('Location', { required: 'Campo obrigatório' })}
                      className={`w-full border-b-2 py-2 focus:outline-none focus:border-primary transition-colors bg-transparent text-neutral-800 dark:text-neutral-100 ${errors.Location ? 'border-red-500' : 'border-neutral-200 dark:border-neutral-600'}`}
                    />
                    {errors.Location && <span className="text-red-500 text-xs block mt-1">{errors.Location.message}</span>}
                  </div>

                  <div className="md:col-span-2 flex items-center gap-3">
                    <input id="Pause" type="checkbox" {...register('Pause')} className="h-5 w-5 text-primary rounded focus:ring-primary" />
                    <label htmlFor="Pause" className="text-sm text-neutral-600 dark:text-neutral-300">Incluir pausa programada</label>
                  </div>
                </div>

                <AnimatePresence>
                  {hasPause && (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto', transition: { duration: 0.3 } }}
                      exit={{ opacity: 0, y: -10, height: 0, transition: { duration: 0.2 } }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5"
                    >
                      <div>
                        <label htmlFor="BreakStartInput" className="block text-sm font-semibold text-neutral-600 dark:text-neutral-300 mb-2">Início da Pausa *</label>
                        <input
                          id="BreakStartInput"
                          type="time"
                          {...register('BreakStartInput', { required: hasPause })}
                          className={`w-full border-b-2 py-2 focus:outline-none focus:border-primary transition-colors bg-transparent text-neutral-800 dark:text-white dark:[color-scheme:dark] ${errors.BreakStartInput ? 'border-red-500' : 'border-neutral-200 dark:border-neutral-600'}`}
                        />
                        {errors.BreakStartInput && <span className="text-red-500 text-xs block mt-1">{errors.BreakStartInput.message}</span>}
                      </div>
                      <div>
                        <label htmlFor="BreakEndInput" className="block text-sm font-semibold text-neutral-600 dark:text-neutral-300 mb-2">Fim da Pausa *</label>
                        <input
                          id="BreakEndInput"
                          type="time"
                          {...register('BreakEndInput', { required: hasPause })}
                          className={`w-full border-b-2 py-2 focus:outline-none focus:border-primary transition-colors bg-transparent text-neutral-800 dark:text-white dark:[color-scheme:dark] ${errors.BreakEndInput ? 'border-red-500' : 'border-neutral-200 dark:border-neutral-600'}`}
                        />
                        {errors.BreakEndInput && <span className="text-red-500 text-xs block mt-1">{errors.BreakEndInput.message}</span>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <div>
                    <label htmlFor="StartTime" className="block text-sm font-semibold text-neutral-600 dark:text-neutral-300 mb-2">Início *</label>
                    <input
                      id="StartTime"
                      type="datetime-local"
                      {...register('StartTime', {
                        required: 'Campo obrigatório',
                        validate: (value) => !watch('EndTime') || new Date(value) < new Date(watch('EndTime')) || 'Início deve ser antes do fim'
                      })}
                      className={`w-full border-b-2 py-2 focus:outline-none focus:border-primary transition-colors bg-transparent text-neutral-800 dark:text-white dark:[color-scheme:dark] ${errors.StartTime ? 'border-red-500' : 'border-neutral-200 dark:border-neutral-600'}`}
                    />
                    {errors.StartTime && <span className="text-red-500 text-xs block mt-1">{errors.StartTime.message}</span>}
                  </div>
                  <div>
                    <label htmlFor="EndTime" className="block text-sm font-semibold text-neutral-600 dark:text-neutral-300 mb-2">Fim *</label>
                    <input
                      id="EndTime"
                      type="datetime-local"
                      {...register('EndTime', {
                        required: 'Campo obrigatório',
                        validate: (value) => !watch('StartTime') || new Date(value) > new Date(watch('StartTime')) || 'Fim deve ser após o início'
                      })}
                      className={`w-full border-b-2 py-2 focus:outline-none focus:border-primary transition-colors bg-transparent text-neutral-800 dark:text-white dark:[color-scheme:dark] ${errors.EndTime ? 'border-red-500' : 'border-neutral-200 dark:border-neutral-600'}`}
                    />
                    {errors.EndTime && <span className="text-red-500 text-xs block mt-1">{errors.EndTime.message}</span>}
                  </div>
                </div>

                {apiError && (
                  <div className="text-red-600 p-3 bg-red-50 rounded-lg text-center font-medium">
                    {apiError}
                  </div>
                )}
              </div>
            </motion.form>
            
            <div className="flex-shrink-0 p-6 border-t border-neutral-200 dark:border-neutral-700">
              <motion.button
                type="submit"
                form="eventForm"
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.03 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 shadow-soft ${isLoading
                  ? 'bg-neutral-400 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-current" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processando...
                  </div>
                ) : (
                  buttonText
                )}
              </motion.button>
            </div>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
