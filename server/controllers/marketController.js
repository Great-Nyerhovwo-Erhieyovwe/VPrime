/**
 * Market Controller
 * Simple endpoint returning market pairs/data for the frontend
 */

export function getMarkets(_req, res) {
    // Static market data for now (can be replaced with real market feed)
    const markets = [
        { id: 1, symbol: 'BTC/USD', name: 'Bitcoin / US Dollar', price: 42500.5, change: 2.5, volume: '$28.5B', icon: '₿', category: 'crypto' },
        { id: 2, symbol: 'ETH/USD', name: 'Ethereum / US Dollar', price: 2450.25, change: 1.8, volume: '$15.2B', icon: 'Ξ', category: 'crypto' },
        { id: 3, symbol: 'ADA/USD', name: 'Cardano / US Dollar', price: 0.95, change: -0.5, volume: '$2.1B', icon: '₳', category: 'crypto' },
        { id: 4, symbol: 'SOL/USD', name: 'Solana / US Dollar', price: 95.2, change: 3.2, volume: '$1.8B', icon: '◎', category: 'crypto' },
        { id: 5, symbol: 'XRP/USD', name: 'Ripple / US Dollar', price: 2.45, change: 0.8, volume: '$1.5B', icon: '✕', category: 'crypto' },
        { id: 6, symbol: 'DOT/USD', name: 'Polkadot / US Dollar', price: 7.85, change: 1.2, volume: '$0.9B', icon: '●', category: 'crypto' }
    ];

    return res.json({ markets });
}

export default { getMarkets };
