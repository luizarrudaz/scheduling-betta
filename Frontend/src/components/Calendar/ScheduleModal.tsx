import { AnimatePresence, motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";

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
    const title = isCancelling ? `Cancelar: ${selectedTime}` : `Confirmar: ${selectedTime}`

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white rounded-xl p-6 w-full max-w-sm relative"
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {title}
                            </h3>
                            <motion.button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                whileHover={{ scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </motion.button>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            {isCancelling ? (
                                <motion.button
                                    onClick={onCancel}
                                    disabled={isLoading}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium disabled:bg-gray-400"
                                    whileHover={{ scale: isLoading ? 1 : 1.03 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    {isLoading ? 'Cancelando...' : 'Confirmar Cancelamento'}
                                </motion.button>
                            ) : (
                                <motion.button
                                    onClick={onSchedule}
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium disabled:bg-gray-400"
                                    whileHover={{ scale: isLoading ? 1 : 1.03 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    {isLoading ? 'Agendando...' : 'Confirmar Agendamento'}
                                </motion.button>
                            )}
                            
                            <motion.button
                                onClick={onClose}
                                disabled={isLoading}
                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium disabled:opacity-50"
                                whileHover={{ scale: isLoading ? 1 : 1.03 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                Voltar
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}