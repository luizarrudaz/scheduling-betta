export interface BreakWindowDto {
  breakStart: Date;
  breakEnd: Date;
}

export interface Event {
  id: number;
  title: string;
  sessionDuration: number;
  location: string;
  startTime: Date;
  endTime: Date;
  breakWindow: BreakWindowDto | null;
  pause: boolean;
}

export interface EventFormData {
  Title: string;
  SessionDuration: number;
  Location: string;
  StartTime: string;
  EndTime: string;
  Pause: boolean;
  BreakStartInput?: string;
  BreakEndInput?: string;
}