import { Event } from "../Event/Event";

export interface ScheduledEvent {
    id: number;
    userId: string;
    displayName: string;
    email: string;
    selectedSlot: string;
    event: Event;
    status: number;
    createdAt: string;
}