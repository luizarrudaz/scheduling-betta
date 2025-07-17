import { useForm } from 'react-hook-form';
import { useMemo } from 'react';
import { Event, EventFormData } from '../../types/Event/Event';
import { useCreateEvent } from './CreateEvent';
import { useUpdateEvent } from './UseUpdateEvent';

const getInitialValues = (event: Event | null): EventFormData => {
  if (event) {
    return {
      Title: event.title,
      SessionDuration: event.sessionDuration,
      Location: event.location,
      StartTime: toDateTimeLocalString(new Date(event.startTime)),
      EndTime: toDateTimeLocalString(new Date(event.endTime)),
      Pause: !!event.breakWindow,
      BreakStartInput: event.breakWindow ? formatTime(new Date(event.breakWindow.breakStart)) : '',
      BreakEndInput: event.breakWindow ? formatTime(new Date(event.breakWindow.breakEnd)) : '',
    };
  }
  const now = new Date();
  const defaultStart = new Date(now.getTime() + 30 * 60000);
  const defaultEnd = new Date(defaultStart.getTime() + 60 * 60000);
  return {
    Title: '',
    SessionDuration: 30,
    Location: '',
    StartTime: toDateTimeLocalString(defaultStart),
    EndTime: toDateTimeLocalString(defaultEnd),
    Pause: false,
    BreakStartInput: '',
    BreakEndInput: '',
  };
};

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

export const useEventForm = (event: Event | null, onSuccess: () => void) => {
  const formMethods = useForm<EventFormData>();
  const { setError } = formMethods;

  const { createEvent, isLoading: isCreating, error: createError } = useCreateEvent('/event');
  const { updateEvent, isLoading: isUpdating, error: updateError } = useUpdateEvent('/event');

  const isLoading = isCreating || isUpdating;
  const apiError = useMemo(() => createError || updateError, [createError, updateError]);

  const validatePause = (data: EventFormData): boolean => {
    if (!data.Pause) return true;

    if (!data.BreakStartInput || !data.BreakEndInput) {
      if (!data.BreakStartInput) setError('BreakStartInput', { type: 'manual', message: 'Início é obrigatório.' });
      if (!data.BreakEndInput) setError('BreakEndInput', { type: 'manual', message: 'Fim é obrigatório.' });
      return false;
    }

    const eventStart = new Date(data.StartTime);
    const eventEnd = new Date(data.EndTime);
    const breakStart = new Date(`${eventStart.toISOString().split('T')[0]}T${data.BreakStartInput}`);
    const breakEnd = new Date(`${eventStart.toISOString().split('T')[0]}T${data.BreakEndInput}`);

    if (breakStart <= eventStart) {
      setError('BreakStartInput', { type: 'manual', message: 'Deve ser após o início do evento.' });
      return false;
    }
    if (breakEnd >= eventEnd) {
      setError('BreakEndInput', { type: 'manual', message: 'Deve ser antes do fim do evento.' });
      return false;
    }
    if (breakEnd <= breakStart) {
      setError('BreakEndInput', { type: 'manual', message: 'Fim da pausa deve ser após o início.' });
      return false;
    }
    return true;
  };
  
  const createApiPayload = (data: EventFormData) => ({
    title: data.Title,
    sessionDuration: Number(data.SessionDuration),
    location: data.Location,
    startTime: new Date(data.StartTime).toISOString(),
    endTime: new Date(data.EndTime).toISOString(),
    breakWindow: data.Pause && data.BreakStartInput && data.BreakEndInput ? {
      breakStart: new Date(`${new Date(data.StartTime).toISOString().split('T')[0]} ${data.BreakStartInput}`).toISOString(),
      breakEnd: new Date(`${new Date(data.StartTime).toISOString().split('T')[0]} ${data.BreakEndInput}`).toISOString()
    } : null,
  });

  const onSubmit = async (data: EventFormData) => {
    if (!event && new Date(data.StartTime) < new Date()) {
      setError('StartTime', { type: 'manual', message: 'O evento não pode começar no passado.' });
      return;
    }
    if (!validatePause(data)) return;

    const payload = createApiPayload(data);
    
    const result = event 
      ? await updateEvent(event.id, payload) 
      : await createEvent(payload);

    if (result) {
      onSuccess();
    }
  };

  return {
    formMethods,
    isLoading,
    apiError,
    hasPause: formMethods.watch('Pause'),
    onSubmit
  };
};

export { getInitialValues };