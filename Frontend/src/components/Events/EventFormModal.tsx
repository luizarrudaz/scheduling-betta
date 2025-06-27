import { useEffect, useMemo } from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { Event, EventFormData } from "../../types/Event/Event";
import { useCreateEvent } from '../../hooks/Events/CreateEvent';
import { useUpdateEvent } from '../../hooks/Events/UseUpdateEvent';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event | null;
  onSuccess: () => void;
}

const toDateTimeLocalString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const formatTime = (date: Date) => {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const modalVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } },
  exit: { scale: 0.95, opacity: 0, transition: { duration: 0.2 } }
};

const errorShakeVariants = {
  shake: {
    x: [0, -8, 8, -4, 4, 0],
    transition: { duration: 0.4 }
  },
  initial: {
    x: 0
  }
};

export default function EventFormModal({ isOpen, onClose, event, onSuccess }: EventFormModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
    clearErrors,
    setError
  } = useForm<EventFormData>();

  const { createEvent, isLoading: isCreating, error: createError } = useCreateEvent("/event");
  const { updateEvent, isLoading: isUpdating, error: updateError } = useUpdateEvent("/event");

  const hasPause = watch('Pause');
  const apiError = useMemo(() => createError || updateError, [createError, updateError]);
  const hasValidationErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    if (isOpen) {
      if (event) {
        // Editando evento existente
        reset({
          Title: event.title,
          SessionDuration: event.sessionDuration,
          Location: event.location,
          StartTime: toDateTimeLocalString(new Date(event.startTime)),
          EndTime: toDateTimeLocalString(new Date(event.endTime)),
          Pause: !!event.breakWindow,
          BreakStartInput: event.breakWindow ? formatTime(new Date(event.breakWindow.breakStart)) : '',
          BreakEndInput: event.breakWindow ? formatTime(new Date(event.breakWindow.breakEnd)) : ''
        });
      } else {
        // Criando novo evento
        const now = new Date();
        const defaultStart = new Date(now.getTime() + 30 * 60000); 
        const defaultEnd = new Date(defaultStart.getTime() + 60 * 60000);
        reset({
          Title: '',
          SessionDuration: 30,
          Location: '',
          StartTime: toDateTimeLocalString(defaultStart),
          EndTime: toDateTimeLocalString(defaultEnd),
          Pause: false,
          BreakStartInput: '',
          BreakEndInput: '' 
        });
      }
      clearErrors();
    }
  }, [isOpen, event, reset, clearErrors]);

  const onSubmit = async (data: EventFormData) => {
    // Validações Manuais Adicionais
    if (data.Pause) {
        if (!data.BreakStartInput || !data.BreakEndInput) {
            if (!data.BreakStartInput) setError('BreakStartInput', { type: 'manual', message: 'Início é obrigatório.' });
            if (!data.BreakEndInput) setError('BreakEndInput', { type: 'manual', message: 'Fim é obrigatório.' });
            return;
        }

        const breakStart = new Date(`1970-01-01T${data.BreakStartInput}`);
        const breakEnd = new Date(`1970-01-01T${data.BreakEndInput}`);

        if (breakEnd <= breakStart) {
            setError('BreakEndInput', { type: 'manual', message: 'Fim da pausa deve ser após o início.' });
            return;
        }
    }

    const apiPayload = {
      title: data.Title,
      sessionDuration: Number(data.SessionDuration),
      location: data.Location,
      startTime: new Date(data.StartTime).toISOString(),
      endTime: new Date(data.EndTime).toISOString(),
      breakWindow: data.Pause && data.BreakStartInput && data.BreakEndInput ? {
        breakStart: new Date(new Date(data.StartTime).toDateString() + ' ' + data.BreakStartInput).toISOString(),
        breakEnd: new Date(new Date(data.StartTime).toDateString() + ' ' + data.BreakEndInput).toISOString()
      } : null,
      pause: data.Pause,
    };

    const result = event 
      ? await updateEvent(event.id, apiPayload)
      : await createEvent(apiPayload);

    if (result) {
      onSuccess();
      onClose();
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          static
          open={isOpen}
          onClose={isLoading ? () => {} : onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
            className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                {event ? 'Editar Evento' : 'Novo Evento'}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                disabled={isLoading}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                aria-label="Fechar modal"
              >
                <XMarkIcon className="h-7 w-7" />
              </motion.button>
            </div>
            
            <motion.form
              variants={errorShakeVariants}
              animate={isSubmitting && hasValidationErrors ? "shake" : "initial"}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Nome do Evento *</label>
                  <input
                    {...register('Title', { required: 'Campo obrigatório' })}
                    className={`w-full border-b-2 py-2 focus:outline-none focus:border-[#FA7014] transition-colors ${errors.Title ? 'border-red-500' : 'border-gray-200'}`}
                  />
                  {errors.Title && <span className="text-red-500 text-xs block mt-1">{errors.Title.message}</span>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Duração (minutos) *</label>
                  <input
                    type="number"
                    {...register('SessionDuration', { required: 'Campo obrigatório', min: { value: 1, message: 'Mínimo 1 minuto' } })}
                    className={`w-full border-b-2 py-2 focus:outline-none focus:border-[#FA7014] transition-colors ${errors.SessionDuration ? 'border-red-500' : 'border-gray-200'}`}
                  />
                  {errors.SessionDuration && <span className="text-red-500 text-xs block mt-1">{errors.SessionDuration.message}</span>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Local *</label>
                  <input
                    {...register('Location', { required: 'Campo obrigatório' })}
                    className={`w-full border-b-2 py-2 focus:outline-none focus:border-[#FA7014] transition-colors ${errors.Location ? 'border-red-500' : 'border-gray-200'}`}
                  />
                  {errors.Location && <span className="text-red-500 text-xs block mt-1">{errors.Location.message}</span>}
                </div>

                <div className="md:col-span-2 flex items-center gap-3">
                  <input type="checkbox" {...register('Pause')} className="h-5 w-5 text-[#FA7014] rounded focus:ring-[#FA7014]" />
                  <label className="text-sm text-gray-600">Incluir pausa programada</label>
                </div>
                
                <AnimatePresence>
                {hasPause && (
                  <motion.div 
                    className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"
                    initial={{ opacity: 0, height: 0, marginTop: -24 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                    exit={{ opacity: 0, height: 0, marginTop: -24 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Início da Pausa *</label>
                      <input
                        type="time"
                        {...register('BreakStartInput', { required: hasPause })}
                        className={`w-full border-b-2 py-2 focus:outline-none focus:border-[#FA7014] transition-colors ${errors.BreakStartInput ? 'border-red-500' : 'border-gray-200'}`}
                      />
                      {errors.BreakStartInput && <span className="text-red-500 text-xs block mt-1">{errors.BreakStartInput.message}</span>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Fim da Pausa *</label>
                      <input
                        type="time"
                        {...register('BreakEndInput', { required: hasPause })}
                        className={`w-full border-b-2 py-2 focus:outline-none focus:border-[#FA7014] transition-colors ${errors.BreakEndInput ? 'border-red-500' : 'border-gray-200'}`}
                      />
                      {errors.BreakEndInput && <span className="text-red-500 text-xs block mt-1">{errors.BreakEndInput.message}</span>}
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Início *</label>
                    <input
                      type="datetime-local"
                      {...register('StartTime', { 
                        required: 'Campo obrigatório',
                        validate: (value) => !watch('EndTime') || new Date(value) < new Date(watch('EndTime')) || 'Início deve ser antes do fim'
                      })}
                      className={`w-full border-b-2 py-2 focus:outline-none focus:border-[#FA7014] transition-colors ${errors.StartTime ? 'border-red-500' : 'border-gray-200'}`}
                    />
                    {errors.StartTime && <span className="text-red-500 text-xs block mt-1">{errors.StartTime.message}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Fim *</label>
                    <input
                      type="datetime-local"
                      {...register('EndTime', { 
                        required: 'Campo obrigatório',
                        validate: (value) => !watch('StartTime') || new Date(value) > new Date(watch('StartTime')) || 'Fim deve ser após o início'
                      })}
                      className={`w-full border-b-2 py-2 focus:outline-none focus:border-[#FA7014] transition-colors ${errors.EndTime ? 'border-red-500' : 'border-gray-200'}`}
                    />
                    {errors.EndTime && <span className="text-red-500 text-xs block mt-1">{errors.EndTime.message}</span>}
                  </div>
                </div>
              </div>

              {apiError && (
                <div className="text-red-600 p-3 bg-red-50 rounded-lg text-center font-medium">
                  {apiError}
                </div>
              )}
              
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.03 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                className={`w-full py-3 mt-4 rounded-xl font-semibold transition-all duration-300 shadow-md ${isLoading
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-[#FA7014] text-white hover:bg-[#E55F00]'
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
                ) : (event ? 'Salvar Alterações' : 'Criar Evento')}
              </motion.button>
            </motion.form>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}