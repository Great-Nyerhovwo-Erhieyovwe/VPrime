import { motion } from "framer-motion";
import { Hero } from "../../components/Hero/Hero";
import { Navbar } from "../../components/Navbar/Navbar";
import { TrustStrip } from "../../components/TrustStrip/TrustStrip";
import { MarketPreview } from "../../components/MarketPreview/MarketPreview";
import { WhyChoose } from "../../components/WhyChoose/WhyChoose";
import { HowItWorks } from "../../components/HowItWorks/HowItWorks";
import { AccountLevels } from "../../components/AccountLevels/AccountLevels";
import { DashboardMock } from "../../components/PlatformPreview/DashboardMock";
import { Testimonials } from "../../components/Testimonials/Testimonials";
import { FinalCTA } from "../../components/FinalCTA/FinalCTA";
import { Footer } from "../../components/Footer/Footer";
import LiveActivityPopup from "../../components/LiveActivityPopup/LiveActivityPopup";
import TopScroller from "../../components/TopScroller/TopScroller";

export const Home = () => {
    return (
        <motion.div
            className="min-h-screen relative overflow-hidden bg-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
        >
            {/* Floating background elements - hidden on small screens */}
            <motion.div
                className="absolute top-20 left-10 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-accent/5 rounded-full blur-3xl"
                animate={{
                    y: [0, -20, 0],
                    x: [0, 10, 0]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute bottom-32 right-16 w-32 h-32 sm:w-48 sm:h-48 md:w-96 md:h-96 bg-blue-500/5 rounded-full blur-3xl"
                animate={{
                    y: [0, 30, 0],
                    x: [0, -15, 0]
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
            />
            <motion.div
                className="absolute top-1/2 left-1/3 w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 bg-purple-500/5 rounded-full blur-2xl"
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />
            <TopScroller />
            <Navbar />
            <Hero />
            <TrustStrip />
            <MarketPreview />
            <WhyChoose />
            <HowItWorks />
            <AccountLevels />
            <DashboardMock />
            <Testimonials />
            <FinalCTA />
            <Footer />

            {/* Popup (Global overlay) */}
            <LiveActivityPopup />
            {/* Block popup elsewhere */}
            {/* {location.pathname === '/' && <LiveActivityPopup />} */}
        </motion.div>
    );
};

export default Home;