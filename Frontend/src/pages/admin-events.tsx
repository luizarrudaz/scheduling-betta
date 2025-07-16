import { useState } from "react";
import { motion } from "framer-motion";
import useEvents from "../hooks/Events/UseEvents";
import EventsTable from "../components/Events/EventsTable";
import EventFormModal from "../components/Events/EventFormModal";
import { Event } from "../types/Event/Event.tsx";
import { useDeleteEvent } from "../hooks/Events/UseDeleteEvent.tsx";
import LogoutButton from "../components/LogoutButton/LogoutButton.tsx";
import AdminNav from "../components/Nav/AppNav.tsx";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { usePagination } from "../hooks/usePagination.tsx";
import Pagination from "../components/Pagination/Pagination.tsx";

type SortKey = 'title' | 'location' | 'startTime' | 'sessionDuration';

export default function AdminEventsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'startTime', direction: 'ascending' });

  const { events, loading, refetch } = useEvents({ filter: 'upcoming', searchTerm, sortConfig });
  const { deleteEvent } = useDeleteEvent("/event");

  const {
    currentPage,
    totalPages,
    paginatedData,
    setCurrentPage,
  } = usePagination(events, 8);

  const handleDelete = async (eventToDelete: Event) => {
    if (window.confirm(`Tem certeza que deseja excluir o evento "${eventToDelete.title}"?`)) {
      const success = await deleteEvent(eventToDelete.id);
      if (success) {
        refetch();
      }
    }
  };

  const handleOpenModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
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

        <div className="flex items-center justify-center mb-8 w-full max-w-5xl mx-auto px-4">
          <div className="relative flex-grow max-w-xl">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Buscar por nome ou local do evento..."
              className="w-full border-b-2 border-gray-200 focus:outline-none focus:border-[#FA7014] py-2 pl-10 pr-4 bg-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <motion.button
            onClick={handleOpenModal}
            className="ml-4 bg-[#FA7014] text-white p-3 rounded-full font-bold shadow-lg hover:bg-[#E55F00] transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Criar Novo Evento"
          >
            <PlusIcon className="w-6 h-6" />
          </motion.button>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {events.length === 0 ? (
              <NoEvents
                message="Nenhum evento futuro encontrado."
                buttonText="Criar um Evento"
                onButtonClick={handleOpenModal}
              />
            ) : (
              <>
                <EventsTable
                  events={paginatedData}
                  onEdit={(event) => {
                    setSelectedEvent(event);
                    setIsModalOpen(true);
                  }}
                  onDelete={handleDelete}
                  onSort={requestSort}
                  sortConfig={sortConfig}
                />
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
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