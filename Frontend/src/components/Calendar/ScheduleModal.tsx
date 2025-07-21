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
    const confirmText = isCancelling ? 'Sim, cancelar' : 'Confirmar';
    const Icon = isCancelling ? ExclamationTriangleIcon : CalendarDaysIcon;
    const iconBgColor = isCancelling ? 'bg-red-100' : 'bg-primary-light/10';
    const iconTextColor = isCancelling ? 'text-red-600' : 'text-primary';
    const confirmButtonBgColor = isCancelling ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400' : 'bg-primary hover:bg-primary-dark focus:ring-primary disabled:bg-primary-light';
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
                        className="bg-white dark:bg-neutral-800 rounded-2xl shadow-strong w-full max-w-md flex flex-col"
                    >
                        <div className="p-6 flex items-start space-x-4">
                            <div className={`flex-shrink-0 mx-auto flex items-center justify-center h-12 w-12 rounded-full ${iconBgColor} sm:mx-0`}>
                                <Icon className={`h-6 w-6 ${iconTextColor}`} aria-hidden="true" />
                            </div>
                            <div className="flex-grow">
                                <Dialog.Title as="h3" className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                                    {title}
                                </Dialog.Title>
                                <div className="mt-2">
                                    <p className="text-sm text-neutral-600 dark:text-neutral-300">{message}</p>
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
                                className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 disabled:opacity-50"
                                aria-label="Fechar modal"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </motion.button>
                        </div>
                        
                        <div className="bg-neutral-50 dark:bg-neutral-900/50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 rounded-b-2xl">
                            <button type="button" disabled={isLoading} className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-lg border border-neutral-300 dark:border-neutral-600 shadow-sm px-4 py-2 bg-white dark:bg-neutral-700 text-base font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-600 disabled:opacity-50" onClick={onClose}>
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