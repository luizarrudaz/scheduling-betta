import { useState } from "react";
import { motion } from "framer-motion";
import useEvents from "../hooks/Events/UseEvents";
import EventsTable from "../components/Events/EventsTable";
import EventFormModal from "../components/Events/EventFormModal";
import { Event } from "../components/Types/Event/Event.tsx";
import LogoutButton from "../components/LogoutButton/LogoutButton.tsx";

export default function AdminEventsPage() {
  const { events, loading } = useEvents();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center">
      <div className="flex justify-end">
        <LogoutButton />
      </div>

      <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
        Gerenciar Eventos
      </h1>

      <div className="flex flex-col items-center justify-center w-full">
        {loading ? (
          <LoadingSkeleton />
        ) : events.length === 0 ? (
          <NoEvents onCreate={() => setIsModalOpen(true)} />
        ) : (
          <EventsTable
            events={events}
            onEdit={(event) => {
              setSelectedEvent(event);
              setIsModalOpen(true);
            }}
          />
        )}
      </div>

      <EventFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
      />
    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="h-6 bg-gray-100 rounded-lg animate-pulse" />
    ))}
  </div>
);

const NoEvents = ({ onCreate }: { onCreate: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col items-center justify-center h-[50vh]"
  >
    <div className="text-center py-6 px-6 bg-white rounded-2xl shadow-2xl w-80">
      <p className="text-gray-600 mb-4 text-lg">Nenhum evento cadastrado</p>
      <motion.button
        onClick={onCreate}
        className="w-full bg-[#FA7014] text-white py-3 rounded-xl font-semibold hover:bg-[#E55F00] transition-all duration-300"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
      >
        Criar Primeiro Evento
      </motion.button>
    </div>
  </motion.div>
);
