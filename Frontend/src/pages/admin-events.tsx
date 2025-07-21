import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from '@headlessui/react';
import useEvents from "../hooks/Events/UseEvents";
import EventsTable from "../components/Events/EventsTable";
import EventFormModal from "../components/Events/EventFormModal";
import { Event } from "../types/Event/Event.tsx";
import { useDeleteEvent } from "../hooks/Events/UseDeleteEvent.tsx";
import LogoutButton from "../components/LogoutButton/LogoutButton.tsx";
import AdminNav from "../components/Nav/AppNav.tsx";
import { PlusIcon, MagnifyingGlassIcon, ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { usePagination } from "../hooks/usePagination.tsx";
import Pagination from "../components/Pagination/Pagination.tsx";

type SortKey = 'title' | 'location' | 'startTime' | 'sessionDuration';

export default function AdminEventsPage() {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'startTime', direction: 'ascending' });

  const { events, loading, refetch } = useEvents({ filter: 'upcoming', searchTerm, sortConfig });
  const { deleteEvent, isDeleting } = useDeleteEvent("/event");

  const {
    currentPage,
    totalPages,
    paginatedData,
    setCurrentPage,
  } = usePagination(events, 8);

  const handleOpenDeleteModal = (event: Event) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    const success = await deleteEvent(eventToDelete.id);
    if (success) {
      refetch();
      setIsDeleteModalOpen(false);
      setEventToDelete(null);
    }
  };

  const handleOpenFormModal = (event: Event | null = null) => {
    setSelectedEvent(event);
    setIsFormModalOpen(true);
  };

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="min-h-screen w-screen flex flex-col px-6 py-10 relative">
      <AdminNav />
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex justify-end mb-4">
          <LogoutButton />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-neutral-800 dark:text-neutral-100 text-center mb-10"
        >
          Gerenciar Eventos
        </motion.h1>

        <div className="flex items-center justify-center mb-8 w-full max-w-5xl mx-auto px-4">
          <div className="relative flex-grow max-w-xl">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="w-5 h-5 text-neutral-400" />
            </span>
            <input
              type="text"
              placeholder="Buscar por nome ou local do evento..."
              className="w-full border-b-2 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-primary py-2 pl-10 pr-4 bg-transparent text-neutral-800 dark:text-neutral-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <motion.button
            onClick={() => handleOpenFormModal()}
            className="ml-4 bg-primary text-white p-3 rounded-full font-bold shadow-lg hover:bg-primary-dark transition-all"
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
                onButtonClick={() => handleOpenFormModal()}
              />
            ) : (
              <>
                <EventsTable
                  events={paginatedData}
                  onEdit={(event) => handleOpenFormModal(event)}
                  onDelete={handleOpenDeleteModal}
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
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        event={selectedEvent}
        onSuccess={() => {
          refetch();
          setIsFormModalOpen(false);
        }}
      />

      <AnimatePresence>
        {isDeleteModalOpen && eventToDelete && (
            <Dialog
                static
                open={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white dark:bg-neutral-800 rounded-2xl shadow-strong w-full max-w-md flex flex-col"
                >
                    <div className="p-6 flex items-start space-x-4">
                        <div className="flex-shrink-0 mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0">
                            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                        </div>
                        <div className="flex-grow">
                            <Dialog.Title as="h3" className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                                Confirmar Exclusão
                            </Dialog.Title>
                            <div className="mt-2">
                                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                                    Tem certeza que deseja excluir o evento "{eventToDelete.title}"? Todos os agendamentos associados também serão removidos.
                                </p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={isDeleting}
                            className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 disabled:opacity-50"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </motion.button>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-900/50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 rounded-b-2xl">
                        <button type="button" disabled={isDeleting} className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-lg border border-neutral-300 dark:border-neutral-600 shadow-sm px-4 py-2 bg-white dark:bg-neutral-700 text-base font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-600 disabled:opacity-50" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancelar
                        </button>
                        <button type="button" disabled={isDeleting} className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 disabled:bg-red-400" onClick={handleConfirmDelete}>
                            {isDeleting ? 'Excluindo...' : 'Excluir'}
                        </button>
                    </div>
                </motion.div>
            </Dialog>
        )}
      </AnimatePresence>
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
            <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4" />
            <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4" />
            <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/6" />
            <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/6" />
            <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/6" />
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
    <div className="text-center py-6 px-6 bg-white dark:bg-neutral-800 rounded-2xl shadow-medium w-80">
      <p className="text-neutral-600 dark:text-neutral-300 mb-4 text-lg">{message}</p>
      <motion.button
        onClick={onButtonClick}
        className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-all duration-300"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
      >
        {buttonText}
      </motion.button>
    </div>
  </motion.div>
);