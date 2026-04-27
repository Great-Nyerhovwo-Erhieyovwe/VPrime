import { useEffect, useState } from "react";

// ==================================
// CONFIG 
// ==================================
const actions = ["deposited", "withdrew", "earned"];

// Currency rates (base: USD)
const rates: Record<string, number> = {
    USD: 1,
    NGN: 1500,
    PHP: 56,
    EUR: 0.92,
};

// ===================================
// helpers
// ====================================

// Convert USD -> user  currency
const convertFromUSD = (amount: number, currency: string) => {
    return amount * (rates[currency] || 1);
};

// Format Currency
const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
    }).format(amount);
};


// Generate realistic amount based on action
const generateAmount = (action: string) => {
    switch (action) {
        case "deposited":
            return Math.floor(Math.random() * (15000 - 1000) + 1000);
        
        case "withdrew":
            return Math.floor(Math.random() * (100000 - 2000) + 2000);
        
        case "earned":
            return Math.floor(Math.random() * (50000 - 1000) + 1000);
    
        default:
            return 1000;
    }
};

// generate realistic time text
const generateTimeAgo = () => {
    const minutes = Math.floor(Math.random() * 5); // 0-4 mins

    if (minutes === 0) return "Just now";
    if (minutes === 1) return "1 min ago"

    return `${minutes} mins ago`;
};

// Prevent repeating same action
const generateNextAction = (current: string) => {
    let next = current;

    while (next === current) {
        next = actions[Math.floor(Math.random() * actions.length)];
    }

    return next;
};

// ==========================================
// COMPONENT
// ==========================================

const LiveActivityPopup = () => {
    const [action, setAction] = useState("deposited");
    const [amount, setAmount] = useState(0);
    const [timeAgo, setTimeAgo] = useState("Just now");
    const [visible, setVisible] = useState(false);
    const [currency, setCurrency] = useState("USD");

    useEffect(() => {
        // get user's selected currency
        const savedCurrency = localStorage.getItem("currency") || "USD";
        setCurrency(savedCurrency);


        // Initial values
        const initialAction = "deposited";
        setAmount(generateAmount(initialAction));
        setTimeAgo(generateTimeAgo());

        // show first popup
        setTimeout(() => {
            setVisible(true)
        }, 1000);

        // Rotate popup every 7 secs
        const interval = setInterval(() => {
            setVisible(false);

            setTimeout(() => {
                const nextAction = generateNextAction(action);
                
                setAction(nextAction);
                setAmount(generateAmount(nextAction));
                setTimeAgo(generateTimeAgo());

                setVisible(true);
            }, 500); // small transition delay
        }, 7000);

        return () => clearInterval(interval);
    }, [action]);

    return (
        <>
            <div className="fixed bottom-6 left-6 z-50">
                <div className={`transition-all duration-500 ${visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-5"
                    }`}>
                    <div className="bg-white shadow-lg rounded-lg p-4 w-[280px] border border-gray-200">
                        {/* message */}
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-900">
                                Someone
                            </span>{" "}
                            just{" "}
                            <span className="capitalize font-medium">
                                {action}
                            </span>
                        </p>

                        {/* amount */}
                        <p className="text-lg font-bold text-green-600 mt-1">
                            {formatCurrency(
                                convertFromUSD(amount, currency),
                                currency
                            )}
                        </p>

                        {/* time */}
                        <p className="text-xs text-gray-400 mt-1">
                            {timeAgo}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LiveActivityPopup;