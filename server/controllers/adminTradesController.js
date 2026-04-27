/**
 * Admin Trades Controller
 *
 * Handles admin operations for managing user trades:
 * - List all active and closed trades
 * - Close/modify trades manually
 * - View trade performance
 * - Add admin notes to trades
 */

import { getDb } from "../utils/db.js";

/**
 * List all trades
 * Returns: Array of trade objects with entry price, exit price, status, result
 */
export async function listTrades(req, res) {
    try {
        const db = getDb();
        if (!db) {
            console.error('ListTrades: Database not connected');
            return res.status(500).json({ message: 'Database not connected' });
        }

        const [rows] = await db.query(`
            SELECT t.*, u.currency 
            FROM trades t 
            LEFT JOIN users u ON t.userId = u.id 
            ORDER BY t.requestedAt DESC
        `);
        console.log(`ListTrades: Found ${rows.length} trades from database`);

        // Transform database rows to match Trade interface
        const transformedTrades = rows.map(row => {
            // For CFD trading, amount represents the leveraged position value
            // entryPrice = amount / leverage (assuming quantity = 1 for simplicity)
            const entryPrice = row.leverage > 0 ? parseFloat(row.amount) / row.leverage : parseFloat(row.amount);

            // For closed trades, try to derive exit price from resultAmount
            let exitPrice = undefined;
            if (row.status === 'closed' && row.resultAmount !== undefined && row.resultAmount !== null) {
                const resultAmount = parseFloat(row.resultAmount);
                if (row.type === 'buy') {
                    // For buy: resultAmount = (exit - entry) * leverage, so exit = entry + (resultAmount / leverage)
                    exitPrice = entryPrice + (resultAmount / row.leverage);
                } else if (row.type === 'sell') {
                    // For sell: resultAmount = (entry - exit) * leverage, so exit = entry - (resultAmount / leverage)
                    exitPrice = entryPrice - (resultAmount / row.leverage);
                }
            }

            // Calculate profit/loss percentage
            const profitLossPercent = entryPrice > 0 && row.resultAmount ?
                (parseFloat(row.resultAmount) / (entryPrice * row.leverage)) * 100 : 0;

            return {
                id: String(row.id),
                userId: String(row.userId),
                symbol: row.asset, // Map 'asset' to 'symbol'
                type: row.type,
                status: row.status,
                entryPrice: entryPrice,
                exitPrice: exitPrice,
                quantity: 1, // Default quantity (could be derived from amount/leverage/entryPrice)
                leverage: row.leverage || 1,
                profitLoss: parseFloat(row.resultAmount) || 0,
                profitLossPercent: profitLossPercent,
                result: row.result === 'gain' ? 'win' : row.result === 'loss' ? 'loss' : row.result,
                openedAt: row.requestedAt,
                closedAt: row.closedAt,
                adminNotes: row.adminNotes,
                closedBy: row.closedBy,
                currency: row.currency || 'USD'
            };
        });

        return res.json(transformedTrades);
    } catch (e) {
        console.error('List trades error:', e);
        return res.status(500).json({ message: 'Server error', error: e.message });
    }
}

/**
 * Update trade status (close/modify manually)
 *
 * Request body:
 * {
 *   status: 'active' | 'closed',
 *   result: 'win' | 'loss' | 'cancelled',
 *   exitPrice: 1234.56,  // actual exit price if manually closed
 *   adminNotes: 'reason for manual intervention'
 * }
 *
 * When admin closes a trade:
 * - Calculates profit/loss based on entry and exit prices
 * - Records the result
 * - Updates user ROI if needed
 */
export async function updateTrade(req, res) {
    try {
        const db = getDb();
        if (!db) {
            console.error('UpdateTrade: Database not connected');
            return res.status(500).json({ message: 'Database not connected' });
        }

        const { id } = req.params;
        const { status, result, exitPrice, adminNotes, closedAt } = req.body;

        console.log('UpdateTrade request:', { id, status, result, exitPrice, adminNotes, closedAt });

        // Validate status
        if (!['active', 'closed'].includes(status)) {
            console.error('UpdateTrade: Invalid status:', status);
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Validate result for closed trades
        if (status === 'closed' && !['win', 'loss', 'cancelled'].includes(result)) {
            console.error('UpdateTrade: Invalid result:', result);
            return res.status(400).json({ message: 'Invalid result' });
        }

        // Fetch trade to get current data
        const [tradeRows] = await db.query('SELECT * FROM trades WHERE id = ? LIMIT 1', [id]);
        const trade = tradeRows[0];
        if (!trade) {
            console.log(`UpdateTrade: Trade not found for id=${id}`);
            return res.status(404).json({ message: 'Trade not found' });
        }

        console.log('UpdateTrade found trade:', trade);

        // Map frontend result to database result
        let dbResult = trade.result;
        if (status === 'closed') {
            if (result === 'win') dbResult = 'gain';
            else if (result === 'loss') dbResult = 'loss';
            else if (result === 'cancelled') dbResult = null; // cancelled trades have no result
        }

        // Calculate resultAmount (profit/loss) if closing the trade
        let resultAmount = 0;
        if (status === 'closed') {
            if (result === 'cancelled') {
                resultAmount = 0;
            } else if (exitPrice && !isNaN(exitPrice)) {
                // Validate and parse exitPrice
                const exit = parseFloat(exitPrice);
                if (isNaN(exit) || exit <= 0) {
                    console.error('UpdateTrade: Invalid exit price:', exitPrice, 'parsed:', exit);
                    return res.status(400).json({ message: 'Invalid exit price' });
                }

                // Use entryPrice from database if available, otherwise use amount
                const entry = parseFloat(trade.entryPrice) || (parseFloat(trade.amount) / parseFloat(trade.leverage)) || 0;
                const qty = parseFloat(trade.quantity) || 1;

                console.log('UpdateTrade calc:', { entry, exit, qty, leverage: trade.leverage, type: trade.type });

                if (trade.type === 'buy') {
                    resultAmount = (exit - entry) * qty;
                } else if (trade.type === 'sell') {
                    resultAmount = (entry - exit) * qty;
                }

                // Validate result is not NaN
                if (isNaN(resultAmount)) {
                    console.error('UpdateTrade: NaN result amount calculated:', { entry, exit, qty });
                    resultAmount = 0;
                }
            } else {
                // For closed trades without exit price, result becomes 0
                console.log('UpdateTrade: No exit price provided, setting resultAmount to 0');
                resultAmount = 0;
            }
        }

        // Update trade record - map frontend fields to database fields
        // Convert ISO datetime to MySQL format (YYYY-MM-DD HH:MM:SS)
        let closedAtValue = trade.closedAt;
        if (closedAt) {
            // If closedAt is provided from frontend, convert it to MySQL format
            closedAtValue = closedAt.slice(0, 19).replace('T', ' ');
        } else if (status === 'closed') {
            // If closing now, create new timestamp in MySQL format
            closedAtValue = new Date().toISOString().slice(0, 19).replace('T', ' ');
        }

        const updates = {
            status,
            result: dbResult,
            resultAmount: parseFloat(resultAmount) || 0,
            adminNotes: adminNotes || '',
            closedAt: closedAtValue,
        };

        console.log('UpdateTrade updates:', updates);

        // Validate all numeric fields are not NaN before updating
        if (isNaN(updates.resultAmount)) {
            console.error('UpdateTrade: Final resultAmount is NaN, rejecting update');
            return res.status(400).json({ message: 'Invalid trade data - profit/loss calculation failed' });
        }

        const updateKeys = Object.keys(updates);
        const updateValues = Object.values(updates);
        const setClause = updateKeys.map(k => `${k} = ?`).join(", ");

        const [updateResult] = await db.query(
            `UPDATE trades SET ${setClause} WHERE id = ?`,
            [...updateValues, id]
        );

        console.log('UpdateTrade SQL result:', updateResult);

        return res.json({ success: true });
    } catch (e) {
        console.error('Update trade error:', e);
        console.error('Stack trace:', e.stack);
        return res.status(500).json({ message: 'Server error', error: e.message });
    }
}
