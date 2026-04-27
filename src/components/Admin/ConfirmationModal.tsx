// src/components/Admin/ConfirmationModal.tsx
import { motion, AnimatePresence } from "framer-motion";

type Props = {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export const ConfirmationModal = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
}: Props) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-40 flex items-center justify-center bg-black/60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="glass w-full max-w-md rounded-lg p-6"
                        initial={{ scale: 0.9, y: -20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: -20 }}
                    >
                        <h3 className="mb-3 text-xl font-bold text-white">{title}</h3>
                        <p className="mb-6 text-white/80">{message}</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={onCancel}
                                className="rounded bg-primary px-4 py-2 text-white hover:bg-primary/80"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-500"
                            >
                                Confirm
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};