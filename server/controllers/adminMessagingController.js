/**
 * Admin Support/Messaging Controller
 *
 * Handles:
 * 1. Support Tickets - Users submit issues, admin responds and resolves
 * 2. Direct Messages - Admin sends messages to users (warnings, notices, etc.)
 * 3. Email - Admin sends emails to individual or bulk users
 */

import { getDb } from "../utils/db.js";
import { randomUUID } from "crypto";

/**
 * ===== SUPPORT TICKETS =====
 */

/**
 * List all support tickets
 * Returns: Array of tickets with status filters (open, in-progress, resolved, closed)
 */
export async function listTickets(req, res) {
    try {
        const db = getDb();
        if (!db) {
            console.error('ListTickets: Database not connected');
            return res.status(500).json({ message: 'Database not connected' });
        }

        const [ticketRows] = await db.query('SELECT * FROM support_tickets ORDER BY createdAt DESC');
        return res.json(ticketRows);
    } catch (e) {
        console.error('List tickets error:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function listMessages(req, res) {
    try {
        const db = getDb();
        if (!db) {
            console.error('ListMessages: Database not connected');
            return res.status(500).json({ message: 'Database not connected' });
        }

        const [messageRows] = await db.query('SELECT * FROM messages ORDER BY createdAt DESC');
        const transformed = messageRows.map((row) => ({
            ...row,
            message: row.content,
        }));

        return res.json(transformed);
    } catch (e) {
        console.error('List messages error:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

/**
 * Update ticket (add reply, change status)
 * 
 * Request body:
 * {
 *   status: 'open' | 'in-progress' | 'resolved' | 'closed',
 *   reply: 'admin response message'
 * }
 * 
 * When admin replies:
 * - Adds reply to ticket replies array
 * - Includes admin email and timestamp
 * - User gets notification (optional)
 */
export async function updateTicket(req, res) {
    try {
        const db = getDb();
        if (!db) {
            console.error('UpdateTicket: Database not connected');
            return res.status(500).json({ message: 'Database not connected' });
        }

        const { id } = req.params;
        const { status, reply } = req.body;

        if (!['open', 'in-progress', 'resolved', 'closed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Fetch ticket
        const [ticketRows] = await db.query('SELECT * FROM support_tickets WHERE id = ? LIMIT 1', [id]);
        const ticket = ticketRows[0];
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        // Build new replies array if adding a reply
        let replies = ticket.replies ? JSON.parse(ticket.replies) : [];
        if (reply) {
            replies.push({
                from: 'admin',
                message: reply,
                adminEmail: req.user?.email || 'admin',
                timestamp: new Date().toISOString(),
            });
        }

        const updates = {
            status,
            replies: JSON.stringify(replies),
            updatedAt: new Date().toISOString(),
        };

        if (status === 'resolved' || status === 'closed') {
            updates.resolvedAt = new Date().toISOString();
        }

        const updateKeys = Object.keys(updates);
        const updateValues = Object.values(updates);
        const setClause = updateKeys.map(k => `${k} = ?`).join(", ");

        await db.query(
            `UPDATE support_tickets SET ${setClause} WHERE id = ?`,
            [...updateValues, id]
        );

        return res.json({ success: true });
    } catch (e) {
        console.error('Update ticket error:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

/**
 * ===== DIRECT MESSAGES =====
 */

/**
 * Send message to user
 * 
 * Request body:
 * {
 *   userId: 'user_id',
 *   message: 'message content',
 *   type: 'direct' | 'warning' | 'notice'
 * }
 * 
 * Types:
 * - 'direct': Regular message from admin
 * - 'warning': Alert about account issue (e.g., suspicious activity)
 * - 'notice': Important announcement (e.g., maintenance, updates)
 */
export async function sendMessage(req, res) {
    try {
        const db = getDb();
        if (!db) {
            console.error('SendMessage: Database not connected');
            return res.status(500).json({ message: 'Database not connected' });
        }

        const { userId, message, type = 'direct', subject = '' } = req.body;

        if (!userId || !message) {
            return res.status(400).json({ message: 'Missing userId or message' });
        }

        if (!['direct', 'warning', 'notice'].includes(type)) {
            return res.status(400).json({ message: 'Invalid message type' });
        }

        const senderId = req.user?.id;
        if (!senderId) {
            console.error('SendMessage: No senderId - admin not authenticated');
            return res.status(401).json({ message: 'Admin authentication required' });
        }

        const recipientId = String(userId);
        const messageId = randomUUID();

        const messageDoc = {
            id: messageId,
            senderId,
            recipientId,
            content: message,
            type,
            subject,
            status: 'pending',
            isRead: false,
            createdAt: new Date().toISOString(),
        };

        const keys = Object.keys(messageDoc);
        const values = Object.values(messageDoc);
        const placeholders = keys.map(() => "?").join(", ");

        const query = `INSERT INTO messages (${keys.join(", ")}) VALUES (${placeholders})`;
        
        try {
            await db.query(query, values);
            console.log('✅ Message inserted successfully:', { id: messageId, recipientId, type });
        } catch (insertError) {
            console.error('SQL Insert Error:', insertError.message);
            console.error('Query:', query);
            console.error('Values:', values);
            throw insertError;
        }

        return res.json({ success: true, id: messageId });
    } catch (e) {
        console.error('Send message error:', e.message);
        return res.status(500).json({ message: 'Server error', error: e.message });
    }
}

export async function updateMessage(req, res) {
    try {
        const db = getDb();
        if (!db) {
            console.error('UpdateMessage: Database not connected');
            return res.status(500).json({ message: 'Database not connected' });
        }

        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const [messageRows] = await db.query('SELECT * FROM messages WHERE id = ? LIMIT 1', [id]);
        const existingMessage = messageRows[0];
        if (!existingMessage) {
            return res.status(404).json({ message: 'Message not found' });
        }

        await db.query(
            'UPDATE messages SET status = ?, completedAt = ? WHERE id = ?',
            [status, status === 'completed' ? new Date().toISOString() : null, id]
        );

        return res.json({ success: true });
    } catch (e) {
        console.error('Update message error:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

/**
 * ===== EMAIL =====
 */

/**
 * Send email to user(s)
 * 
 * Request body:
 * {
 *   to: 'email@example.com' | ['email1@example.com', 'email2@example.com'],
 *   subject: 'Email subject',
 *   body: 'Email body (HTML supported)',
 *   userId: 'optional user ID for log tracking'
 * }
 * 
 * Stores email log for audit trail
 * In production, integrate with nodemailer to actually send emails
 */
export async function sendEmail(req, res) {
    try {
        const db = getDb();
        if (!db) {
            console.error('SendEmail: Database not connected');
            return res.status(500).json({ message: 'Database not connected' });
        }

        const { to, subject, body, userId } = req.body;

        if (!to || !subject || !body) {
            return res.status(400).json({ message: 'Missing to, subject, or body' });
        }

        const recipients = Array.isArray(to) ? to : [to];
        const emailId = randomUUID();

        const emailLog = {
            id: emailId,
            recipients: JSON.stringify(recipients),
            subject,
            body,
            userId: userId || null,
            sentBy: req.user?.email || 'admin',
            sentAt: new Date().toISOString(),
            status: 'sent',
        };

        // Try to insert into email_logs table, but don't fail if it doesn't exist
        try {
            const keys = Object.keys(emailLog);
            const values = Object.values(emailLog);
            const placeholders = keys.map(() => "?").join(", ");

            await db.query(
                `INSERT INTO email_logs (${keys.join(", ")}) VALUES (${placeholders})`,
                values
            );
        } catch (e) {
            // Table might not exist, log but don't fail
            console.warn('Email logging not available:', e.message);
        }

        // TODO: In production, integrate with nodemailer here to actually send emails
        // const transporter = nodemailer.createTransport({...});
        // await transporter.sendMail({ to: recipients, subject, html: body });

        return res.json({ success: true, id: emailId });
    } catch (e) {
        console.error('Send email error:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}
