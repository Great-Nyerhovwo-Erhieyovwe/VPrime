import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Testimonial = {
    author: string;
    rating: number; // 1‑5
    comment: string;
    role?: string;
};

const testimonials: Testimonial[] = [
    {
        author: "Alex M.",
        rating: 5,
        comment:
            "CFD’s execution speed is unmatched. I’ve never seen slippage this low. The platform handles high-volume trading effortlessly.",
        role: "Professional Trader",
    },
    {
        author: "Sofia R.",
        rating: 4,
        comment:
            "The AI‑signals helped me catch trends early. The UI feels premium and fast. Customer support is always available when needed.",
        role: "Day Trader",
    },
    {
        author: "Liam K.",
        rating: 5,
        comment:
            "Customer support resolved my KYC issue within minutes. Highly recommended! The mobile app is just as powerful as the desktop version.",
        role: "Crypto Investor",
    },
    {
        author: "Maria G.",
        rating: 5,
        comment:
            "I've been trading for 10 years, and VPrime Capital offers the best combination of tools and reliability. Their educational resources are excellent.",
        role: "Experienced Trader",
    },
    {
        author: "David L.",
        rating: 4,
        comment:
            "The zero-commission pairs on Gold tier saved me thousands. The platform is intuitive and the charts are top-notch.",
        role: "Forex Trader",
    },
];

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
        x: direction < 0 ? 300 : -300,
        opacity: 0,
    }),
};

export const Testimonials = () => {
    const [[page, direction], setPage] = useState<[number, number]>([0, 0]);

    // Auto‑advance every 5 seconds
    useEffect(() => {
        const timer = setInterval(() => paginate(1), 5000);
        return () => clearInterval(timer);
    }, []);

    const paginate = (newDirection: number) => {
        setPage(([prevPage]) => {
            const nextPage = (prevPage + newDirection + testimonials.length) % testimonials.length;
            return [nextPage, newDirection];
        });
    };

    const testimonial = testimonials[page];

    const stars = Array.from({ length: 5 }, (_, i) => (
        <svg
            key={i}
            className={`h-4 w-4 ${i < testimonial.rating ? "text-accent fill-current" : "text-gray-600"
                }`}
            viewBox="0 0 20 20"
        >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.562-.954L10 0l2.948 5.956 6.562.954-4.755 4.635 1.123 6.545z" />
        </svg>
    ));

    return (
        <section className="py-16">
            <div className="mx-auto max-w-7xl px-4">
                <h2 className="mb-4 text-center text-3xl font-semibold text-white">
                    What Our Traders Say
                </h2>
                <p className="mb-12 text-center text-white/70 max-w-2xl mx-auto">
                    Don't just take our word for it. Hear from traders who have experienced success with VPrime Capital.
                </p>

            <div className="relative mx-auto flex max-w-xl items-center justify-center">
                <button
                    onClick={() => paginate(-1)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-primary p-2 text-white hover:bg-accent"
                >
                    ‹
                </button>

                <AnimatePresence custom={direction}>
                    <motion.div
                        key={page}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="w-full p-6 text-center border border-white/20 shadow-lg"
                    >
                        <div className="mb-4 flex justify-center">{stars}</div>
                        <p className="mb-4 text-lg italic text-white/90">
                            “{testimonial.comment}”
                        </p>
                        <p className="font-medium text-white">{testimonial.author}</p>
                    </motion.div>
                </AnimatePresence>

                <button
                    onClick={() => paginate(1)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-primary p-2 text-white hover:bg-accent"
                >
                    ›
                </button>
                </div>
            </div>
        </section>
    );
};