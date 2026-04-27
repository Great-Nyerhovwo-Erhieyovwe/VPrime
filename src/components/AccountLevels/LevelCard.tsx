import { motion } from "framer-motion";

type LevelCardProps = {
    tier: string;
    minDeposit: string;
    withdrawLimit: string;
    bonus: string;
    perks: string[];
};

export const LevelCard = ({
    tier,
    minDeposit,
    withdrawLimit,
    bonus,
    perks,
}: LevelCardProps) => (
    <motion.div
        className="flex w-full flex-col p-4 sm:p-5 border border-white/20 shadow-lg rounded-lg hover:bg-white/5 transition-colors"
        whileHover={{ y: -5, scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <h3 className="mb-2 sm:mb-3 text-center text-lg sm:text-xl font-bold text-accent">{tier}</h3>
        <ul className="mb-3 space-y-1 text-xs sm:text-sm text-white/80">
            <li>Min. Deposit: {minDeposit}</li>
            <li>Withdrawal Limit: {withdrawLimit}</li>
            <li>Bonus: {bonus}</li>
        </ul>
        <strong className="block mb-2 text-white text-sm sm:text-base">Perks:</strong>
        <ul className="list-disc pl-5 text-white/70 text-xs sm:text-sm space-y-0.5">
            {perks.map((p, i) => (
                <li key={i}>{p}</li>
            ))}
        </ul>
    </motion.div>
);