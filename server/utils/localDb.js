import fs from "fs/promises";
import path from "path";

const DB_PATH = path.join(process.cwd(), "db.json");

async function readDb() {
    try {
        const txt = await fs.readFile(DB_PATH, "utf-8");
        return JSON.parse(txt || "{}");
    } catch (e) {
        // If file missing, initialize.
        return {};
    }
}

async function writeDb(obj) {
    await fs.writeFile(DB_PATH, JSON.stringify(obj, null, 2), "utf-8");
}

function matchFilter(item, filter = {}) {
    return Object.keys(filter).every((k) => {
        // handle simple equality filters
        return String(item[k]) === String(filter[k]);
    });
}

export async function find(collection, filter = {}) {
    const db = await readDb();
    const list = db[collection] || [];
    if (Object.keys(filter).length === 0) return list;
    return list.filter((item) => matchFilter(item, filter));
}

export async function findOne(collection, filter = {}) {
    const all = await find(collection, filter);
    return all.length ? all[0] : null;
}

export async function insertOne(collection, doc) {
    const db = await readDb();
    db[collection] = db[collection] || [];
    const _id = doc._id || doc.id || (Date.now() + "") ;
    const newDoc = { ...doc, _id: String(_id) };
    db[collection].push(newDoc);
    await writeDb(db);
    return { insertedId: newDoc._id, ops: [newDoc] };
}

export async function updateOne(collection, filter = {}, updates = {}) {
    const db = await readDb();
    db[collection] = db[collection] || [];
    let updated = false;
    db[collection] = db[collection].map((item) => {
        if (matchFilter(item, filter)) {
            updated = true;
            return { ...item, ...updates };
        }
        return item;
    });
    await writeDb(db);
    return { matchedCount: updated ? 1 : 0, modifiedCount: updated ? 1 : 0 };
}

export async function deleteOne(collection, filter = {}) {
    const db = await readDb();
    const list = db[collection] || [];
    const newList = list.filter((item) => !matchFilter(item, filter));
    const deleted = newList.length !== list.length;
    db[collection] = newList;
    await writeDb(db);
    return { deletedCount: deleted ? 1 : 0 };
}
