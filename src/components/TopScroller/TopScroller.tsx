const messages = [
    "Welcome to VPrime Capital |",
    "Earn up to $5000 daily profits |",
    "Instant deposits & fast withdrawals |",
    "Your funds are 100% secured |",
    "Trade Forex, Crypto, Indices & Stocks seamlessly |",
    "Trusted by traders worldwide |",
]

export default function TopScroller() {
    return (
        <div className="w-full bg-accent text-primary overflow-hidden whitespace-nowrap py-2 z-40 relative">
            <div className="flex w-max animate-scroll gap-10">
                {/* Duplicate for smooth loop */}
                {[...messages, ...messages, ...messages, ...messages].map((msg, i) => (
                    <span key={i} className="text-sm sm:text-base font-medium">
                        {msg}
                    </span>
                ))}
            </div>
        </div>
    );
}