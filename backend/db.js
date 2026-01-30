import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dbPath = process.env.DB_PATH || path.join(process.cwd(), "data", "tickets.db");
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

const createTicketsTable = `
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    maquina TEXT NOT NULL,
    setor TEXT NOT NULL,
    descricao TEXT NOT NULL,
    contato TEXT,
    status TEXT NOT NULL DEFAULT 'OPEN',
    priority TEXT NOT NULL DEFAULT 'MEDIUM',
    access_key TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    closed_at TEXT
  );
`;

const createMessagesTable = `
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    author_type TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(ticket_id) REFERENCES tickets(id)
  );
`;

db.exec(createTicketsTable);
db.exec(createMessagesTable);

db.prepare(
  "CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)"
).run();
db.prepare(
  "CREATE INDEX IF NOT EXISTS idx_tickets_setor ON tickets(setor)"
).run();

db.prepare(
  "CREATE INDEX IF NOT EXISTS idx_messages_ticket_id ON messages(ticket_id)"
).run();

export default db;
