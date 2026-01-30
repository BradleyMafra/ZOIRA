import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import db from "./db.js";

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const ADMIN_USER = process.env.ADMIN_USER || "Luiz";
const ADMIN_PASS = process.env.ADMIN_PASS || "MeninoDoTi";

app.use(helmet());
app.use(morgan("combined"));
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

const ticketLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

const sanitizeText = (value) =>
  String(value || "")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .trim();

const getNow = () => new Date().toISOString();
const ALLOWED_STATUS = new Set(["OPEN", "IN_PROGRESS", "CLOSED"]);
const ALLOWED_PRIORITY = new Set(["LOW", "MEDIUM", "HIGH"]);

const requireAdmin = (req, res, next) => {
  return next();
};

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/auth/login", loginLimiter, (req, res) => {
  const username = sanitizeText(req.body?.username);
  const password = sanitizeText(req.body?.password);

  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  return res.json({ ok: true });
});

app.post("/api/auth/logout", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/tickets", ticketLimiter, (req, res) => {
  const nome = sanitizeText(req.body?.nome);
  const maquina = sanitizeText(req.body?.maquina);
  const setor = sanitizeText(req.body?.setor);
  const descricao = sanitizeText(req.body?.descricao);
  const contato = sanitizeText(req.body?.contato);

  if (!nome || !maquina || !setor || !descricao) {
    return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
  }

  const now = getNow();
  const accessKey = Math.random().toString(36).slice(2, 10).toUpperCase();

  const stmt = db.prepare(
    `INSERT INTO tickets (nome, maquina, setor, descricao, contato, status, priority, access_key, created_at, updated_at)
     VALUES (@nome, @maquina, @setor, @descricao, @contato, 'OPEN', 'MEDIUM', @access_key, @created_at, @updated_at)`
  );
  const result = stmt.run({
    nome,
    maquina,
    setor,
    descricao,
    contato: contato || null,
    access_key: accessKey,
    created_at: now,
    updated_at: now,
  });

  return res.status(201).json({
    id: result.lastInsertRowid,
    status: "OPEN",
    accessKey,
  });
});

app.get("/api/tickets/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID inválido." });
  }

  const ticket = db
    .prepare(
      `SELECT id, nome, maquina, setor, descricao, contato, status, priority, created_at, updated_at, closed_at
       FROM tickets WHERE id = ?`
    )
    .get(id);

  if (!ticket) {
    return res.status(404).json({ error: "Ticket não encontrado." });
  }

  const messages = db
    .prepare(
      `SELECT id, author_type, message, created_at
       FROM messages WHERE ticket_id = ? ORDER BY created_at ASC`
    )
    .all(id);

  return res.json({ ticket, messages });
});

app.post("/api/tickets/:id/messages", ticketLimiter, (req, res) => {
  const id = Number(req.params.id);
  const message = sanitizeText(req.body?.message);
  const accessKey = sanitizeText(req.body?.accessKey);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID inválido." });
  }

  if (!message) {
    return res.status(400).json({ error: "Mensagem é obrigatória." });
  }

  const ticket = db
    .prepare("SELECT access_key FROM tickets WHERE id = ?")
    .get(id);

  if (!ticket) {
    return res.status(404).json({ error: "Ticket não encontrado." });
  }

  if (!ticket.access_key || accessKey !== ticket.access_key) {
    return res.status(401).json({ error: "Chave de acesso inválida." });
  }

  const now = getNow();
  db.prepare(
    `INSERT INTO messages (ticket_id, author_type, message, created_at)
     VALUES (?, 'USER', ?, ?)`
  ).run(id, message, now);

  db.prepare("UPDATE tickets SET updated_at = ? WHERE id = ?").run(now, id);

  return res.status(201).json({ ok: true });
});

app.get("/api/admin/tickets", requireAdmin, (req, res) => {
  const status = sanitizeText(req.query?.status);
  const setor = sanitizeText(req.query?.setor);
  const search = sanitizeText(req.query?.search);

  const filters = [];
  const params = {};

  if (status && ALLOWED_STATUS.has(status)) {
    filters.push("status = @status");
    params.status = status;
  }
  if (setor) {
    filters.push("setor = @setor");
    params.setor = setor;
  }
  if (search) {
    filters.push("(nome LIKE @search OR maquina LIKE @search)");
    params.search = `%${search}%`;
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const tickets = db
    .prepare(
      `SELECT id, nome, maquina, setor, descricao, contato, status, priority, created_at, updated_at, closed_at
       FROM tickets ${where} ORDER BY datetime(created_at) DESC`
    )
    .all(params);

  return res.json({ tickets });
});

app.get("/api/admin/tickets/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID inválido." });
  }

  const ticket = db
    .prepare(
      `SELECT id, nome, maquina, setor, descricao, contato, status, priority, created_at, updated_at, closed_at
       FROM tickets WHERE id = ?`
    )
    .get(id);

  if (!ticket) {
    return res.status(404).json({ error: "Ticket não encontrado." });
  }

  const messages = db
    .prepare(
      `SELECT id, author_type, message, created_at
       FROM messages WHERE ticket_id = ? ORDER BY created_at ASC`
    )
    .all(id);

  return res.json({ ticket, messages });
});

app.post("/api/admin/tickets/:id/messages", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const message = sanitizeText(req.body?.message);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID inválido." });
  }

  if (!message) {
    return res.status(400).json({ error: "Mensagem é obrigatória." });
  }

  const ticket = db
    .prepare("SELECT id FROM tickets WHERE id = ?")
    .get(id);

  if (!ticket) {
    return res.status(404).json({ error: "Ticket não encontrado." });
  }

  const now = getNow();
  db.prepare(
    `INSERT INTO messages (ticket_id, author_type, message, created_at)
     VALUES (?, 'ADMIN', ?, ?)`
  ).run(id, message, now);

  db.prepare("UPDATE tickets SET updated_at = ? WHERE id = ?").run(now, id);

  return res.status(201).json({ ok: true });
});

app.patch("/api/admin/tickets/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID inválido." });
  }

  const status = sanitizeText(req.body?.status);
  const priority = sanitizeText(req.body?.priority);

  const ticket = db
    .prepare("SELECT id FROM tickets WHERE id = ?")
    .get(id);

  if (!ticket) {
    return res.status(404).json({ error: "Ticket não encontrado." });
  }

  const updates = [];
  const params = { id };
  const now = getNow();

  if (status && ALLOWED_STATUS.has(status)) {
    updates.push("status = @status");
    params.status = status;
    if (status === "CLOSED") {
      updates.push("closed_at = @closed_at");
      params.closed_at = now;
    }
    if (status !== "CLOSED") {
      updates.push("closed_at = NULL");
    }
  }

  if (priority && ALLOWED_PRIORITY.has(priority)) {
    updates.push("priority = @priority");
    params.priority = priority;
  }

  if (!updates.length) {
    return res.status(400).json({ error: "Nada para atualizar." });
  }

  updates.push("updated_at = @updated_at");
  params.updated_at = now;

  db.prepare(`UPDATE tickets SET ${updates.join(", ")} WHERE id = @id`).run(
    params
  );

  return res.json({ ok: true });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor." });
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
