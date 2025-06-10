import { useEffect } from 'react';
import { Dialog } from '@headlessui/react'
import { motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import { Event } from "../Types/Event/Event"
import { useCreateEvent } from '../../hooks/Events/CreateEvent';
import { useUpdateEvent } from '../../hooks/Events/UseUpdateEvent';

interface EventFormModalProps {
  isOpen: boolean
  onClose: () => void
  event?: Event | null
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

type FormData = {
  Title: string;
  SessionDuration: number;
  Location: string;
  StartTime: string;
  EndTime: string;
  Pause: boolean;
  BreakStartInput?: string;
  BreakEndInput?: string;
};

export default function EventFormModal({ isOpen, onClose, event, onSuccess }: EventFormModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
    clearErrors,
    setError
  } = useForm<FormData>();

  const { createEvent, isLoading: isCreating, error: createError } = useCreateEvent("/event");
  const { updateEvent, isLoading: isUpdating, error: updateError } = useUpdateEvent("/event");

  const hasPause = watch('Pause');
  const startTime = watch('StartTime');
  const endTime = watch('EndTime');
  const breakStartInput = watch('BreakStartInput');
  const breakEndInput = watch('BreakEndInput');

  useEffect(() => {
    if (!hasPause) {
      clearErrors(['BreakStartInput', 'BreakEndInput']);
    }
  }, [hasPause, clearErrors]);

  useEffect(() => {
    if (isOpen && event) {
      reset({
        Title: event.title,
        SessionDuration: event.sessionDuration,
        Location: event.location,
        StartTime: toDateTimeLocalString(event.startTime),
        EndTime: toDateTimeLocalString(event.endTime),
        Pause: !!event.breakWindow,
        BreakStartInput: event.breakWindow ? formatTime(event.breakWindow.breakStart) : '',
        BreakEndInput: event.breakWindow ? formatTime(event.breakWindow.breakEnd) : ''
      });
    } else if (isOpen) {
      const now = new Date();
      const defaultStart = new Date(now.getTime() + 30 * 60000); // Now + 30min
      const defaultEnd = new Date(defaultStart.getTime() + 60 * 60000); // Start + 60min
      
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
  }, [isOpen, event, reset]);

  const handleClose = () => {
    onClose();
  };

  const validateBreakTimes = () => {
    if (!hasPause || !breakStartInput || !breakEndInput) return true;

    const eventStart = new Date(startTime);
    const eventEnd = new Date(endTime);
    
    // Create break times using event start date
    const breakStart = new Date(`${startTime.split('T')[0]}T${breakStartInput}`);
    const breakEnd = new Date(`${startTime.split('T')[0]}T${breakEndInput}`);

    if (breakStart < eventStart) {
      setError('BreakStartInput', {
        type: 'manual',
        message: 'Início da pausa deve ser após o início do evento'
      });
      return false;
    }

    if (breakEnd > eventEnd) {
      setError('BreakEndInput', {
        type: 'manual',
        message: 'Fim da pausa deve ser antes do fim do evento'
      });
      return false;
    }

    if (breakEnd <= breakStart) {
      setError('BreakEndInput', {
        type: 'manual',
        message: 'Fim da pausa deve ser após o início'
      });
      return false;
    }

    return true;
  };

  const onSubmit = async (data: FormData) => {
    if (!validateBreakTimes()) return;

    let breakWindow = null;

    if (data.Pause && data.BreakStartInput && data.BreakEndInput) {
      const breakStartDate = new Date(data.StartTime);
      const [hours, minutes] = data.BreakStartInput.split(':').map(Number);
      breakStartDate.setHours(hours, minutes);

      const breakEndDate = new Date(data.StartTime);
      const [endHours, endMinutes] = data.BreakEndInput.split(':').map(Number);
      breakEndDate.setHours(endHours, endMinutes);

      breakWindow = {
        breakStart: breakStartDate.toISOString(),
        breakEnd: breakEndDate.toISOString()
      };
    }

    const apiEvent = {
      title: data.Title,
      sessionDuration: Number(data.SessionDuration),
      location: data.Location,
      startTime: new Date(data.StartTime).toISOString(),
      endTime: new Date(data.EndTime).toISOString(),
      breakWindow,
      pause: data.Pause
    };
    let result = null;

    if (event) {
      result = await updateEvent(event.id, apiEvent);
    } else {
      // Additional validation for new events only
      const now = new Date();
      const start = new Date(data.StartTime);
      if (start < now) {
        setError('StartTime', {
          type: 'manual',
          message: 'O evento não pode começar no passado'
        });
        return;
      }
      result = await createEvent(apiEvent);
    }

    if (result) {
      handleClose();
      onSuccess();
    }
  };

    const isLoading = isCreating || isUpdating;
    const error = createError || updateError;

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
    >
      <motion.div
        layout
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: hasPause ? 0.80 : 0.85, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{
          type: 'spring',
          stiffness: 350,
          damping: 20,
          layout: {
            duration: 0.18,
            ease: 'easeInOut'
          }
        }}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all"
      >
        <div className="flex justify-between items-center mb-6">
          <motion.h2
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-3xl font-bold text-gray-800"
          >
            {event ? 'Editar Evento' : 'Novo Evento'}
          </motion.h2>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-7 w-7" />
          </motion.button>
        </div>

        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-600 mb-2">Nome do Evento *</label>
              <motion.input
                {...register('Title', { required: 'Campo obrigatório' })}
                className="w-full border-b-2 border-gray-200 focus:outline-none focus:border-[#FA7014] py-2"
                whileFocus={{ scale: 1.01 }}
              />
              {errors.Title && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-xs block mt-1"
                >
                  {errors.Title.message}
                </motion.span>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Duração (minutos) *</label>
              <motion.input
                type="number"
                {...register('SessionDuration', {
                  required: 'Campo obrigatório',
                  min: { value: 1, message: 'Mínimo 1 minuto' }
                })}
                className="w-full border-b-2 border-gray-200 focus:outline-none focus:border-[#FA7014] py-2"
                whileFocus={{ scale: 1.01 }}
              />
              {errors.SessionDuration && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-xs block mt-1"
                >
                  {errors.SessionDuration.message}
                </motion.span>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Local *</label>
              <motion.input
                {...register('Location', { required: 'Campo obrigatório' })}
                className="w-full border-b-2 border-gray-200 focus:outline-none focus:border-[#FA7014] py-2"
                whileFocus={{ scale: 1.01 }}
              />
              {errors.Location && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-xs block mt-1"
                >
                  {errors.Location.message}
                </motion.span>
              )}
            </div>

            <div className="col-span-2 flex items-center gap-3">
              <motion.input
                type="checkbox"
                {...register('Pause')}
                className="h-5 w-5 text-[#FA7014] rounded focus:ring-[#FA7014]"
                whileTap={{ scale: 0.9 }}
              />
              <label className="text-sm text-gray-600">Incluir pausa programada</label>
            </div>

            {hasPause && (
              <div className="col-span-2 grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Início da Pausa *</label>
                  <motion.input
                    type="time"
                    {...register('BreakStartInput', {
                      required: 'Campo obrigatório'
                    })}
                    className="w-full border-b-2 border-gray-200 focus:outline-none focus:border-[#FA7014] py-2"
                    whileFocus={{ scale: 1.01 }}
                  />
                  {errors.BreakStartInput && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-500 text-xs block mt-1"
                    >
                      {errors.BreakStartInput.message}
                    </motion.span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Fim da Pausa *</label>
                  <motion.input
                    type="time"
                    {...register('BreakEndInput', {
                      required: 'Campo obrigatório'
                    })}
                    className="w-full border-b-2 border-gray-200 focus:outline-none focus:border-[#FA7014] py-2"
                    whileFocus={{ scale: 1.01 }}
                  />
                  {errors.BreakEndInput && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-500 text-xs block mt-1"
                    >
                      {errors.BreakEndInput.message}
                    </motion.span>
                  )}
                </div>
              </div>
            )}

            <div className="col-span-2 grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Início *</label>
                <motion.input
                  type="datetime-local"
                  {...register('StartTime', {
                    required: 'Campo obrigatório',
                    validate: (value) => {
                      const start = new Date(value);
                      const end = new Date(watch('EndTime'));
                      return start < end || 'Início deve ser antes do fim';
                    }
                  })}
                  min={event ? undefined : toDateTimeLocalString(new Date())}
                  className="w-full border-b-2 border-gray-200 focus:outline-none focus:border-[#FA7014] py-2"
                  whileFocus={{ scale: 1.01 }}
                />
                {errors.StartTime && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-xs block mt-1"
                  >
                    {errors.StartTime.message}
                  </motion.span>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Fim *</label>
                <motion.input
                  type="datetime-local"
                  {...register('EndTime', {
                    required: 'Campo obrigatório',
                    validate: (value) => {
                      const start = new Date(watch('StartTime'));
                      const end = new Date(value);
                      return end > start || 'Fim deve ser após início';
                    }
                  })}
                  className="w-full border-b-2 border-gray-200 focus:outline-none focus:border-[#FA7014] py-2"
                  whileFocus={{ scale: 1.01 }}
                />
                {errors.EndTime && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-xs block mt-1"
                  >
                    {errors.EndTime.message}
                  </motion.span>
                )}
              </div>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-red-500 p-3 bg-red-50 rounded-lg text-center mb-4"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={!isLoading ? { scale: 0.95 } : {}}
            whileTap={!isLoading ? { scale: 0.92 } : {}}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 shadow-md ${isLoading
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-[#FA7014] text-white hover:bg-[#E55F00]'
              }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-current" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processando...
              </div>
            ) : event ? (
              'Salvar Alterações'
            ) : (
              'Criar Evento'
            )}
          </motion.button>
        </motion.form>
      </motion.div>
    </Dialog>
  )
}