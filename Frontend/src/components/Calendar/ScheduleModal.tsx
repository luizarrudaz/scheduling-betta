import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ExclamationTriangleIcon, CalendarDaysIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ScheduleModalProps {
    isOpen: boolean;
    selectedTime: string;
    isCancelling: boolean;
    onClose: () => void;
    onSchedule: () => void;
    onCancel: () => void;
    isLoading: boolean;
    error: string | null;
}

const modalVariants: Variants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 400, damping: 30 }
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export default function ScheduleModal({
    isOpen,
    selectedTime,
    isCancelling,
    onClose,
    onSchedule,
    onCancel,
    isLoading,
    error,
}: ScheduleModalProps) {
    const title = isCancelling ? "Confirmar Cancelamento" : "Confirmar Agendamento";
    const message = isCancelling
        ? `Tem certeza que deseja cancelar seu agendamento para ${selectedTime}?`
        : `Você confirma o agendamento para o horário das ${selectedTime}?`;
    const confirmText = isCancelling ? 'Sim, Cancelar' : 'Confirmar';
    const Icon = isCancelling ? ExclamationTriangleIcon : CalendarDaysIcon;
    const iconBgColor = isCancelling ? 'bg-red-100' : 'bg-blue-100';
    const iconTextColor = isCancelling ? 'text-red-600' : 'text-blue-600';
    const confirmButtonBgColor = isCancelling ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-400';
    const confirmAction = isCancelling ? onCancel : onSchedule;

    return (
        <AnimatePresence>
            {isOpen && (
                <Dialog
                    static
                    open={isOpen}
                    onClose={isLoading ? () => {} : onClose}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                >
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col"
                    >
                        <div className="p-6 flex items-start space-x-4">
                            <div className={`flex-shrink-0 mx-auto flex items-center justify-center h-12 w-12 rounded-full ${iconBgColor} sm:mx-0`}>
                                <Icon className={`h-6 w-6 ${iconTextColor}`} aria-hidden="true" />
                            </div>
                            <div className="flex-grow">
                                <Dialog.Title as="h3" className="text-lg font-bold text-gray-900">
                                    {title}
                                </Dialog.Title>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-600">{message}</p>
                                </div>
                                {error && (
                                    <div className="mt-3 bg-red-50 text-red-700 p-3 rounded-lg text-sm text-center">
                                        {error}
                                    </div>
                                )}
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                disabled={isLoading}
                                className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                aria-label="Fechar modal"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </motion.button>
                        </div>
                        
                        <div className="bg-gray-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 rounded-b-2xl">
                            <button type="button" disabled={isLoading} className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50" onClick={onClose}>
                                Voltar
                            </button>
                            <button type="button" disabled={isLoading} className={`w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white ${confirmButtonBgColor}`} onClick={confirmAction}>
                                {isLoading ? 'Processando...' : confirmText}
                            </button>
                        </div>
                    </motion.div>
                </Dialog>
            )}
        </AnimatePresence>
    );
}