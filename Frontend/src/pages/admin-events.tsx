import { useState } from "react";
import { motion } from "framer-motion";
import useEvents from "../hooks/Events/UseEvents";
import EventsTable from "../components/Events/EventsTable";
import EventFormModal from "../components/Events/EventFormModal";
import { Event } from "../components/Types/Event/Event.tsx";
import { useDeleteEvent } from "../hooks/Events/UseDeleteEvent.tsx";
import LogoutButton from "../components/LogoutButton/LogoutButton.tsx";

export default function AdminEventsPage() {
  const { events, loading, refetch } = useEvents();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { deleteEvent } = useDeleteEvent("/event");

  const handleDelete = async (eventToDelete: Event) => {
    if (window.confirm(`Tem certeza que deseja excluir o evento "${eventToDelete.title}"?`)) {
      const success = await deleteEvent(eventToDelete.id);
      if (success) {
        refetch();
      }
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col px-6 py-10">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex justify-end mb-4">
          <LogoutButton />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-gray-800 text-center mb-10"
        >
          Gerenciar Eventos
        </motion.h1>

        {loading ? (
          <LoadingSkeleton />
        ) : events.length === 0 ? (
          <NoEvents onCreate={() => setIsModalOpen(true)} />
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <motion.button
                onClick={() => {
                  setSelectedEvent(null);
                  setIsModalOpen(true);
                }}
                className="bg-[#FA7014] text-white px-4 py-2 rounded-xl font-bold shadow-md hover:bg-[#E55F00] transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                +
              </motion.button>
            </div>

            <EventsTable
              events={events}
              onEdit={(event) => {
                setSelectedEvent(event);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          </>
        )}
      </div>

      <EventFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onSuccess={() => {
          refetch();
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
      />
    </div>
  );
}

const LoadingSkeleton = () => (
  <motion.div
    className="space-y-4 w-full max-w-4xl mx-auto"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex space-x-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4" />
        <div className="h-6 bg-gray-200 rounded w-1/4" />
        <div className="h-6 bg-gray-200 rounded w-1/6" />
        <div className="h-6 bg-gray-200 rounded w-1/6" />
        <div className="h-6 bg-gray-200 rounded w-1/6" />
      </div>
    ))}
  </motion.div>
);

const NoEvents = ({ onCreate }: { onCreate: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="flex flex-col items-center justify-center h-[50vh] space-y-6"
  >
    <motion.div
      className="bg-white shadow-xl rounded-2xl p-8 w-80 text-center border border-gray-100"
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 120 }}
    >
      <p className="text-gray-700 text-lg mb-6">Nenhum evento cadastrado</p>
      <motion.button
        onClick={onCreate}
        className="w-full bg-[#FA7014] text-white py-3 rounded-xl font-semibold hover:bg-[#E55F00] transition-all duration-300 shadow-md"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        Criar Primeiro Evento
      </motion.button>
    </motion.div>
  </motion.div>
);