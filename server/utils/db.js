import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

let connection = null;
let currentSession = null;

function normalizeDoc(doc) {
    if (!doc || typeof doc !== 'object') return doc;
    const normalized = { ...doc };
    if (normalized._id !== undefined) {
        normalized._id = String(normalized._id);
    }
    if (normalized.id === undefined && normalized._id !== undefined) {
        normalized.id = String(normalized._id);
    }
    return normalized;
}

function parseQuotedValue(value) {
    const trimmed = value.trim();
    const quoteMatch = trimmed.match(/^(['"])(.*)\1$/);
    if (quoteMatch) return quoteMatch[2];
    if (/^\d+$/.test(trimmed)) return Number.parseInt(trimmed, 10);
    if (/^\d+\.\d+$/.test(trimmed)) return Number.parseFloat(trimmed);
    if (/^TRUE$/i.test(trimmed)) return true;
    if (/^FALSE$/i.test(trimmed)) return false;
    return trimmed;
}

function parseWhere(whereClause, params = []) {
    const filter = {};
    let paramIndex = 0;
    if (!whereClause) return { filter, used: 0 };

    const conditions = whereClause.split(/\s+AND\s+/i);
    for (let condition of conditions) {
        condition = condition.trim();
        condition = condition.replace(/^\(|\)$/g, '').trim();
        const match = condition.match(/^([`"]?)([\w]+)\1\s*(=|!=|<>|>=|<=|>|<)\s*(\?|(['"]).*?\5)$/i);
        if (!match) {
            continue;
        }

        const [, , field, operator, valueToken] = match;
        let value;
        if (valueToken === '?') {
            value = params[paramIndex++];
        } else {
            value = parseQuotedValue(valueToken);
        }

        switch (operator) {
            case '=':
                filter[field] = value;
                break;
            case '!=':
            case '<>':
                filter[field] = { $ne: value };
                break;
            case '>':
                filter[field] = { $gt: value };
                break;
            case '<':
                filter[field] = { $lt: value };
                break;
            case '>=':
                filter[field] = { $gte: value };
                break;
            case '<=':
                filter[field] = { $lte: value };
                break;
            default:
                filter[field] = value;
        }
    }

    return { filter, used: paramIndex };
}

function parseOrderBy(orderByClause) {
    if (!orderByClause) return null;
    const sort = {};
    const fields = orderByClause.split(',').map((part) => part.trim()).filter(Boolean);
    for (const field of fields) {
        const parts = field.split(/\s+/);
        const key = parts[0].replace(/[`"]+/g, '');
        const direction = parts[1] ? parts[1].toUpperCase() : 'ASC';
        sort[key] = direction === 'DESC' ? -1 : 1;
    }
    return sort;
}

function parseLimitOffset(limitClause, offsetClause, params = [], startIndex = 0) {
    let index = startIndex;
    let limit = null;
    let offset = null;

    if (limitClause != null) {
        const token = limitClause.trim();
        limit = token === '?' ? params[index++] : Number.parseInt(token, 10);
        if (Number.isNaN(limit)) limit = null;
    }

    if (offsetClause != null) {
        const token = offsetClause.trim();
        offset = token === '?' ? params[index++] : Number.parseInt(token, 10);
        if (Number.isNaN(offset)) offset = null;
    }

    return { limit, offset, used: index - startIndex };
}

function stripQuotes(str) {
    return str.replace(/^[`'"]|[`'"]$/g, '');
}

function buildProjection(selectClause) {
    if (!selectClause) return null;
    const trimmed = selectClause.trim();
    if (trimmed === '*' || trimmed === ' *') return null;
    const fields = trimmed.split(',').map((field) => field.trim().replace(/[`"]+/g, ''));
    const projection = {};
    for (const field of fields) {
        if (!field) continue;
        // Ignore aggregate expressions such as COUNT(*) or SUM(...)
        if (/COUNT\(|SUM\(|COALESCE\(/i.test(field)) continue;
        const clean = field.replace(/.*\./, '');
        projection[clean] = 1;
    }
    return Object.keys(projection).length ? projection : null;
}

function getSessionOptions() {
    return currentSession ? { session: currentSession } : {};
}

function getCollection(name) {
    if (!connection || !connection.db) {
        throw new Error('MongoDB not connected');
    }
    return connection.db.collection(stripQuotes(name));
}

function extractClause(sql, clause, nextClauses = []) {
    const upper = sql.toUpperCase();
    const keyword = ` ${clause.toUpperCase()} `;
    const start = upper.indexOf(keyword);
    if (start === -1) return null;
    let end = sql.length;
    for (const next of nextClauses) {
        const nextPos = upper.indexOf(` ${next.toUpperCase()} `, start + keyword.length);
        if (nextPos !== -1 && nextPos < end) {
            end = nextPos;
        }
    }
    return sql.slice(start + keyword.length, end).trim();
}

async function executeSelect(sql, params = []) {
    const selectClause = extractClause(sql, 'SELECT', ['FROM']);
    const fromClause = extractClause(sql, 'FROM', ['WHERE', 'ORDER BY', 'LIMIT', 'OFFSET']);
    const whereClause = extractClause(sql, 'WHERE', ['ORDER BY', 'LIMIT', 'OFFSET']);
    const orderByClause = extractClause(sql, 'ORDER BY', ['LIMIT', 'OFFSET']);
    const limitClause = extractClause(sql, 'LIMIT', ['OFFSET']);
    const offsetClause = extractClause(sql, 'OFFSET', []);

    const collection = getCollection(fromClause);
    const { filter, used } = parseWhere(whereClause, params);
    const sessionOpts = getSessionOptions();
    const orderBy = parseOrderBy(orderByClause);
    const { limit, offset } = parseLimitOffset(limitClause, offsetClause, params, used);

    // Handle COUNT(*) and SUM expressions
    const countMatch = selectClause?.match(/COUNT\(\s*\*\s*\)(?:\s+AS\s+(\w+))?/i);
    if (countMatch) {
        const alias = countMatch[1] || 'count';
        const count = await collection.countDocuments(filter, sessionOpts);
        return [{ [alias]: count }];
    }

    const sumMatch = selectClause?.match(/(?:COALESCE\()??SUM\(\s*([`"\w]+)\s*\)(?:,\s*0\))?(?:\s+AS\s+(\w+))?/i);
    if (sumMatch) {
        const field = stripQuotes(sumMatch[1]);
        const alias = sumMatch[2] || 'total';
        const pipeline = [
            { $match: filter },
            { $group: { _id: null, value: { $sum: `$${field}` } } },
            { $project: { _id: 0, [alias]: { $ifNull: ['$value', 0] } } }
        ];
        const results = await collection.aggregate(pipeline, sessionOpts).toArray();
        return results.length ? results : [{ [alias]: 0 }];
    }

    const projection = buildProjection(selectClause);
    if (limit === 1) {
        const doc = await collection.findOne(filter, { projection, ...sessionOpts });
        return doc ? [normalizeDoc(doc)] : [];
    }

    let cursor = collection.find(filter, { projection, ...sessionOpts });
    if (orderBy) cursor = cursor.sort(orderBy);
    if (offset != null) cursor = cursor.skip(offset);
    if (limit != null) cursor = cursor.limit(limit);

    const docs = await cursor.toArray();
    return docs.map(normalizeDoc);
}

function parseInsert(sql) {
    const match = sql.match(/^INSERT\s+INTO\s+([`"]?)([\w]+)\1\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
    if (!match) throw new Error('Unsupported INSERT statement');
    const table = match[2];
    const columns = match[3].split(',').map((c) => stripQuotes(c.trim()));
    const values = match[4].split(',').map((v) => v.trim());
    return { table, columns, valueTokens: values };
}

function parseUpdate(sql) {
    const match = sql.match(/^UPDATE\s+([`"]?)([\w]+)\1\s+SET\s+(.+?)\s+WHERE\s+(.+)$/i);
    if (!match) throw new Error('Unsupported UPDATE statement');
    const table = match[2];
    const setClause = match[3].trim();
    const whereClause = match[4].trim();
    return { table, setClause, whereClause };
}

function parseDelete(sql) {
    const match = sql.match(/^DELETE\s+FROM\s+([`"]?)([\w]+)\1\s+(WHERE\s+.+)$/i);
    if (!match) throw new Error('Unsupported DELETE statement');
    const table = match[2];
    const whereClause = match[3].replace(/^WHERE\s+/i, '').trim();
    return { table, whereClause };
}

function buildUpdate(setClause, params = []) {
    const update = {};
    const inc = {};
    let paramIndex = 0;

    const assignments = setClause.split(/\s*,\s*/);
    for (const assignment of assignments) {
        const trimmed = assignment.trim();
        let match = trimmed.match(/^([`"]?)([\w]+)\1\s*=\s*\?$/i);
        if (match) {
            const key = match[2];
            update[key] = params[paramIndex++];
            continue;
        }

        match = trimmed.match(/^([`"]?)([\w]+)\1\s*=\s*\1?\2\1?\s*([+\-])\s*\?$/i);
        if (match) {
            const key = match[2];
            const op = match[3];
            const value = params[paramIndex++];
            inc[key] = op === '-' ? -value : value;
            continue;
        }

        match = trimmed.match(/^([`"]?)([\w]+)\1\s*=\s*(TRUE|FALSE|NULL|\d+\.?\d*|['"][^'"]*['"]?)$/i);
        if (match) {
            const key = match[2];
            update[key] = parseQuotedValue(match[3]);
            continue;
        }

        throw new Error(`Unsupported update assignment: ${trimmed}`);
    }

    const final = {};
    if (Object.keys(update).length) final.$set = update;
    if (Object.keys(inc).length) final.$inc = inc;
    return final;
}

export async function query(sql, params = []) {
    if (!connection) {
        console.error('❌ MongoDB connection not initialized');
        throw new Error('Database not connected');
    }

    const normalizedSql = sql.trim().replace(/\s+/g, ' ');
    const sessionOpts = getSessionOptions();

    try {
        console.log('🔍 Executing SQL on MongoDB:', normalizedSql, params);

        if (/^START TRANSACTION/i.test(normalizedSql)) {
            if (currentSession) return [];
            currentSession = await connection.startSession();
            currentSession.startTransaction();
            console.log('🔐 MongoDB transaction started');
            return [];
        }

        if (/^COMMIT/i.test(normalizedSql)) {
            if (currentSession) {
                await currentSession.commitTransaction();
                currentSession.endSession();
                currentSession = null;
                console.log('✅ MongoDB transaction committed');
            }
            return [];
        }

        if (/^ROLLBACK/i.test(normalizedSql)) {
            if (currentSession) {
                await currentSession.abortTransaction();
                currentSession.endSession();
                currentSession = null;
                console.log('↩️ MongoDB transaction rolled back');
            }
            return [];
        }

        if (/^SELECT/i.test(normalizedSql)) {
            return await executeSelect(normalizedSql, params);
        }

        if (/^INSERT/i.test(normalizedSql)) {
            const { table, columns } = parseInsert(normalizedSql);
            const doc = {};
            for (let i = 0; i < columns.length; i += 1) {
                doc[columns[i]] = params[i];
            }
            if (!doc.id) {
                doc.id = randomUUID();
            }
            if (!doc.createdAt) {
                doc.createdAt = new Date();
            }
            const result = await getCollection(table).insertOne(doc, sessionOpts);
            return { insertedId: doc.id, _id: result.insertedId ? String(result.insertedId) : doc.id };
        }

        if (/^UPDATE/i.test(normalizedSql)) {
            const { table, setClause, whereClause } = parseUpdate(normalizedSql);
            const { filter, used } = parseWhere(whereClause, params);
            const update = buildUpdate(setClause, params.slice(used));
            if (!update.$set && !update.$inc) {
                throw new Error('No valid update operation could be built');
            }
            const result = await getCollection(table).updateMany(filter, update, sessionOpts);
            return { affectedRows: result.matchedCount, changedRows: result.modifiedCount };
        }

        if (/^DELETE/i.test(normalizedSql)) {
            const { table, whereClause } = parseDelete(normalizedSql);
            const { filter } = parseWhere(whereClause, params);
            const result = await getCollection(table).deleteOne(filter, sessionOpts);
            return { deletedCount: result.deletedCount };
        }

        throw new Error(`Unsupported SQL statement: ${normalizedSql}`);
    } catch (err) {
        console.error('❌ Query execution error:', err.message || err);
        console.error('❌ SQL:', normalizedSql);
        console.error('❌ Params:', params);
        throw err;
    }
}

export async function closeDB() {
    if (connection) {
        await mongoose.disconnect();
        console.log('MongoDB connection closed');
    }
    connection = null;
    if (currentSession) {
        try {
            await currentSession.endSession();
        } catch {
            // ignore
        }
        currentSession = null;
    }
}

export function getDb() {
    return {
        query,
        connection,
        startTransaction: async () => {
            if (!connection) throw new Error('MongoDB not connected');
            if (currentSession) return currentSession;
            currentSession = await connection.startSession();
            currentSession.startTransaction();
            return currentSession;
        },
        commitTransaction: async () => {
            if (!currentSession) return;
            await currentSession.commitTransaction();
            currentSession.endSession();
            currentSession = null;
        },
        rollbackTransaction: async () => {
            if (!currentSession) return;
            await currentSession.abortTransaction();
            currentSession.endSession();
            currentSession = null;
        }
    };
}

export default connection;

export async function connectDB() {
    if (connection) {
        return connection;
    }

    try {
        const DATABASE_URL = process.env.DATABASE_URL;
        if (!DATABASE_URL) {
            throw new Error('DATABASE_URL not found in environment variables');
        }

        console.log('🔌 Connecting to MongoDB Atlas...');
        await mongoose.connect(DATABASE_URL, {
            // Modern Mongoose doesn't need these options, but keeping for compatibility
        });

        connection = mongoose.connection;
        console.log('✅ Connected to MongoDB Atlas');

        // Handle connection events
        connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        connection.on('disconnected', () => {
            console.log('📡 MongoDB disconnected');
            connection = null;
        });

        return connection;
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error.message);
        throw error;
    }
}