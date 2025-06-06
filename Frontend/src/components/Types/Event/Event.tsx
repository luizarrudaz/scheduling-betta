export interface BreakWindowDto {
  breakStart: Date;
  breakEnd: Date;
}

export interface Event {
  title: string;
  sessionDuration: number;
  location: string;
  startTime: Date;
  endTime: Date;
  breakWindow: BreakWindowDto | null;
  pause: boolean;
}

interface EventFormData {
  Title: string;
  SessionDuration: number;
  Location: string;
  StartTime: string; // '2025-06-03T12:00'
  EndTime: string;   // '2025-06-03T13:00'
  Pause: boolean;
  BreakStart?: string; // '12:30'
  BreakEnd?: string;   // '12:45'
}
