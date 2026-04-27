import { User, Transaction, Deposit, Withdraw, Trade, Verification, Plan, Ticket, Message, AdminLog } from '../models/index.js';
import * as localDb from "../utils/localDb.js";

// DataProvider fetches from MongoDB models and local db.json as fallback
function normalizeRecord(record) {
    if (!record || typeof record !== 'object') return record;
    const normalized = { ...record };
    if (normalized.id !== undefined && normalized._id === undefined) {
        normalized._id = String(normalized.id);
    }
    if (normalized._id !== undefined && normalized.id === undefined) {
        normalized.id = normalized._id;
    }
    return normalized;
}

const modelMap = {
    users: User,
    transactions: Transaction,
    deposits: Deposit,
    withdrawals: Withdraw,
    trades: Trade,
    verifications: Verification,
    upgrade_plans: Plan,
    upgrades: Plan, // Assuming upgrades use Plan model
    support_tickets: Ticket,
    messages: Message,
    broadcasts: Message, // Assuming broadcasts use Message model
    wallets: User, // Assuming wallets are part of User model
    admin_logs: AdminLog,
};

export const provider = {
    async find(collection, filter = {}) {
        const results = [];

        // Try MongoDB model first
        const Model = modelMap[collection];
        if (Model) {
            try {
                const mongoResults = await Model.find(filter);
                results.push(...mongoResults.map(doc => normalizeRecord(doc.toObject())));
            } catch (e) {
                console.warn(`MongoDB find error for ${collection}:`, e.message);
            }
        }

        // Also fetch from local db.json as fallback
        try {
            const localResults = await localDb.find(collection, filter);
            const existingIds = new Set(results.map(r => (r._id || r.id)?.toString()));
            for (const item of localResults) {
                const itemId = (item._id || item.id)?.toString();
                if (!existingIds.has(itemId)) {
                    results.push(normalizeRecord(item));
                }
            }
        } catch (e) {
            console.warn(`Local db find error for ${collection}:`, e.message);
        }

        return results;
    },

    async findOne(collection, filter = {}) {
        // Try MongoDB model first
        const Model = modelMap[collection];
        if (Model) {
            try {
                const result = await Model.findOne(filter);
                if (result) return normalizeRecord(result.toObject());
            } catch (e) {
                console.warn(`MongoDB findOne error for ${collection}:`, e.message);
            }
        }

        // Fall back to local db.json
        try {
            const result = await localDb.findOne(collection, filter);
            return normalizeRecord(result);
        } catch (e) {
            console.warn(`Local db findOne error for ${collection}:`, e.message);
            return null;
        }
    },

    async insertOne(collection, doc) {
        let mongoResult = null;
        let localResult = null;

        // Insert to MongoDB model
        const Model = modelMap[collection];
        if (Model) {
            try {
                const document = new Model(doc);
                const saved = await document.save();
                mongoResult = { insertedId: saved._id, _id: saved._id };
            } catch (e) {
                console.warn(`MongoDB insertOne error for ${collection}:`, e.message);
            }
        }

        // Also insert to local db.json (as backup/fallback)
        try {
            localResult = await localDb.insertOne(collection, doc);
        } catch (e) {
            console.warn(`Local db insertOne error for ${collection}:`, e.message);
        }

        // Return MongoDB result if available, otherwise local result
        if (mongoResult) return mongoResult;

        if (localResult) {
            localResult = {
                ...localResult,
                _id: localResult.insertedId,
                id: localResult.insertedId,
            };
            return localResult;
        }

        return { insertedId: doc._id || doc.id, _id: doc._id || doc.id };
    },

    async updateOne(collection, filter = {}, updates = {}) {
        let mongoResult = null;
        let localResult = null;

        // Update in MongoDB model
        const Model = modelMap[collection];
        if (Model) {
            try {
                const result = await Model.updateOne(filter, updates);
                mongoResult = {
                    matchedCount: result.matchedCount,
                    modifiedCount: result.modifiedCount
                };
            } catch (e) {
                console.warn(`MongoDB updateOne error for ${collection}:`, e.message);
            }
        }

        // Also update in local db.json
        try {
            localResult = await localDb.updateOne(collection, filter, updates);
        } catch (e) {
            console.warn(`Local db updateOne error for ${collection}:`, e.message);
        }

        // Return MongoDB result if available, otherwise local result
        return mongoResult || localResult || { matchedCount: 0, modifiedCount: 0 };
    },

    async deleteOne(collection, filter = {}) {
        let mongoResult = null;
        let localResult = null;

        // Delete from MongoDB model
        const Model = modelMap[collection];
        if (Model) {
            try {
                const result = await Model.deleteOne(filter);
                mongoResult = { deletedCount: result.deletedCount };
            } catch (e) {
                console.warn(`MongoDB deleteOne error for ${collection}:`, e.message);
            }
        }

        // Also delete from local db.json
        try {
            localResult = await localDb.deleteOne(collection, filter);
        } catch (e) {
            console.warn(`Local db deleteOne error for ${collection}:`, e.message);
        }

        // Return MongoDB result if available, otherwise local result
        return mongoResult || localResult || { deletedCount: 0 };
    }
};
