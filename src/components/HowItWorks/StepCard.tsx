import { motion } from "framer-motion";

type StepCardProps = {
    number: number;
    title: string;
    description: string;
};

export const StepCard = ({ number, title, description }: StepCardProps) => (
    <motion.div
        className="flex w-full flex-col items-center p-4 sm:p-5 text-center border border-white/20 shadow-lg rounded-lg hover:bg-white/5 transition-colors"
        whileHover={{ scale: 1.03, y: -5 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <div className="mb-3 sm:mb-4 flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-full bg-accent text-primary font-bold text-sm sm:text-base">
            {number}
        </div>
        <h4 className="mb-2 text-sm sm:text-lg font-medium text-white">{title}</h4>
        <p className="text-xs sm:text-sm text-white/80 leading-relaxed">{description}</p>
    </motion.div>
);