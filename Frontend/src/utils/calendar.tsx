import { addMinutes, format, isWithinInterval, startOfDay, endOfDay, max, min } from 'date-fns';
import { Event } from '../types/Event/Event';

export function classNames(...classes: (string | boolean)[]) {
    return classes.filter(Boolean).join(' ');
}

export function generateSlotsForEvent(event: Event, day: Date): { startTime: string; endTime: string; isBreak: boolean }[] {
    const slots: { startTime: string; endTime: string; isBreak: boolean }[] = [];
    if (!event) return slots;

    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);

    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);

    const effectiveStart = max([eventStart, dayStart]);
    const effectiveEnd = min([eventEnd, dayEnd]);

    if (effectiveStart >= effectiveEnd) return slots;

    let currentSlotStart = new Date(day);
    currentSlotStart.setHours(effectiveStart.getHours(), effectiveStart.getMinutes(), 0, 0);

    const sessionDuration = event.sessionDuration;

    while (addMinutes(currentSlotStart, sessionDuration) <= effectiveEnd) {
        const currentSlotEnd = addMinutes(currentSlotStart, sessionDuration);
        const breakStart = event.breakWindow?.breakStart ? new Date(event.breakWindow.breakStart) : null;
        const breakEnd = event.breakWindow?.breakEnd ? new Date(event.breakWindow.breakEnd) : null;
        let overlapsWithBreak = false;

        if (breakStart && breakEnd && isWithinInterval(day, { start: startOfDay(breakStart), end: endOfDay(breakEnd) })) {
            const breakTimeForDay = {
                start: new Date(day.getFullYear(), day.getMonth(), day.getDate(), breakStart.getHours(), breakStart.getMinutes()),
                end: new Date(day.getFullYear(), day.getMonth(), day.getDate(), breakEnd.getHours(), breakEnd.getMinutes())
            }
            overlapsWithBreak =
                (currentSlotStart >= breakTimeForDay.start && currentSlotStart < breakTimeForDay.end) ||
                (currentSlotEnd > breakTimeForDay.start && currentSlotEnd <= breakTimeForDay.end) ||
                (currentSlotStart < breakTimeForDay.start && currentSlotEnd > breakTimeForDay.end);
        }

        slots.push({
            startTime: format(currentSlotStart, 'HH:mm'),
            endTime: format(currentSlotEnd, 'HH:mm'),
            isBreak: overlapsWithBreak
        });

        currentSlotStart = addMinutes(currentSlotStart, sessionDuration);
    }

    return slots;
}