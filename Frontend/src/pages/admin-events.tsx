import { useState } from 'react';
// import { PlusIcon } from '@heroicons/react/24/outline';
import useEvents from '../hooks/Events/UseEvents';
import EventsTable from '../components/Events/EventsTable';
import EventFormModal from '../components/Events/EventFormModal';

export default function AdminEventsPage() {
    const { events, loading } = useEvents();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Gerenciar Eventos</h1>
          </div>
  
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <p className="text-gray-500 mb-4">Nenhum evento cadastrado</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-[#FA7014] text-white px-6 py-2 rounded-lg hover:bg-[#E55F00] transition-colors"
              >
                Criar Primeiro Evento
              </button>
            </div>
          ) : (
            <EventsTable 
              events={events} 
              onEdit={(event) => {
                setSelectedEvent(event);
                setIsModalOpen(true);
              }}
            />
          )}
  
          <EventFormModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedEvent(null);
            }}
            event={selectedEvent}
          />
        </div>
      </div>
    );
  }
  

export interface Event {
  id: number;
  nome: string;
  tamanhoSessao: number;
  pausa: boolean;
  pausaInicio?: string;
  pausaVolta?: string;
  localidade: string;
  dataInicio: string;
  dataFim: string;
  vagasDisponiveis: number;
}