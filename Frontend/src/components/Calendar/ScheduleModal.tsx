import { AnimatePresence, motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ScheduleModalProps {
    isOpen: boolean;
    selectedTime: string;
    onClose: () => void;
    onSchedule: () => void;
}

export default function ScheduleModal({
    isOpen,
    selectedTime,
    onClose,
    onSchedule,
}: ScheduleModalProps) {
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
                                Agendamento - {selectedTime}
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

                        <div className="space-y-3">
                            <motion.button
                                onClick={onSchedule}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium"
                                whileHover={{ scale: 1.03 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                Confirmar Agendamento
                            </motion.button>

                            <motion.button
                                onClick={onClose}
                                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium"
                                whileHover={{ scale: 1.03 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                Cancelar
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}