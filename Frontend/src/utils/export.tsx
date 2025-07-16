import * as XLSX from 'xlsx';
import { ScheduledEvent } from '../types/Schedule/Schedule';
import { format } from 'date-fns';

const triggerDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const exportToCsv = (data: ScheduledEvent[], fileName: string = 'export.csv') => {
    const headers = [
        "Evento",
        "Nome",
        "Email",
        "Duração (min)",
        "Data Agendada"
    ];

    const formatCsvCell = (value: any): string => {
        let output = value === null || value === undefined ? '' : String(value);
        if (output.includes('"') || output.includes('|')) {
            output = `"${output.replace(/"/g, '""')}"`;
        }
        return output;
    };

    const csvRows = [headers.join('|')];

    data.forEach(item => {
        const row = [
            item.event?.title || 'N/A',
            item.displayName || 'N/A',
            item.email || 'N/A',
            item.event?.sessionDuration || 'N/A',
            format(new Date(item.selectedSlot), 'dd/MM/yyyy HH:mm')
        ].map(formatCsvCell);
        csvRows.push(row.join('|'));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });

    triggerDownload(blob, fileName);
};

export const exportToExcel = (data: ScheduledEvent[], fileName: string = 'export.xlsx') => {
    const jsonData = data.map(item => ({
        "Evento": item.event?.title || 'N/A',
        "Nome": item.displayName || 'N/A',
        "Email": item.email || 'N/A',
        "Duração (min)": item.event?.sessionDuration,
        "Data Agendada": format(new Date(item.selectedSlot), 'dd/MM/yyyy HH:mm')
    }));

    const ws = XLSX.utils.json_to_sheet(jsonData);

    ws['!cols'] = [
        { wch: 40 }, // Evento
        { wch: 30 }, // Nome
        { wch: 30 }, // Email
        { wch: 15 }, // Duração (min)
        { wch: 20 }, // Data Agendada
    ];

    ws['!view'] = { freezePanes: { y: 1 } };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Agendamentos');
    XLSX.writeFile(wb, fileName);
};