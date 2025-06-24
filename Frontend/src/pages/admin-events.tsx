import { useState } from "react";
import { motion } from "framer-motion";
import useEvents from "../hooks/Events/UseEvents";
import EventsTable from "../components/Events/EventsTable";
import EventFormModal from "../components/Events/EventFormModal";
import { Event } from "../components/Types/Event/Event.tsx";
import { useDeleteEvent } from "../hooks/Events/UseDeleteEvent.tsx";
import LogoutButton from "../components/LogoutButton/LogoutButton.tsx";
import { isAfter } from 'date-fns';
import AdminNav from "../components/Admin/AppNav.tsx";
import { PlusIcon } from "@heroicons/react/24/solid"; // 1. Importar o ícone

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

  const currentTime = new Date();
  const upcomingEvents = events.filter(event =>
    isAfter(new Date(event.endTime), currentTime)
  );

  const handleOpenModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col px-6 py-10 relative">
      <AdminNav />
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
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <motion.button
                onClick={handleOpenModal}
                className="bg-[#FA7014] text-white p-3 rounded-full font-bold shadow-lg hover:bg-[#E55F00] transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Criar Novo Evento"
              >
                <PlusIcon className="w-6 h-6" />
              </motion.button>
            </div>

            {upcomingEvents.length === 0 ? (
              <NoEvents
                message="Nenhum evento cadastrado."
                buttonText="Criar Primeiro Evento"
                onButtonClick={handleOpenModal}
              />
            ) : (
              <EventsTable
                events={upcomingEvents}
                onEdit={(event) => {
                  setSelectedEvent(event);
                  setIsModalOpen(true);
                }}
                onDelete={handleDelete}
              />
            )}
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

const NoEvents = ({
  message,
  buttonText,
  onButtonClick
}: {
  message: string;
  buttonText: string;
  onButtonClick: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col items-center justify-center h-[50vh]"
  >
    <div className="text-center py-6 px-6 bg-white rounded-2xl shadow-2xl w-80">
      <p className="text-gray-600 mb-4 text-lg">{message}</p>
      <motion.button
        onClick={onButtonClick}
        className="w-full bg-[#FA7014] text-white py-3 rounded-xl font-semibold hover:bg-[#E55F00] transition-all duration-300"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
      >
        {buttonText}
      </motion.button>
    </div>
  </motion.div>
);