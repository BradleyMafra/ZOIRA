import "dotenv/config";
import db from "./db.js";

const now = new Date().toISOString();

const insertTicket = db.prepare(
  `INSERT INTO tickets (nome, maquina, setor, descricao, contato, status, priority, access_key, created_at, updated_at)
   VALUES (@nome, @maquina, @setor, @descricao, @contato, @status, @priority, @access_key, @created_at, @updated_at)`
);

const tickets = [
  {
    nome: "Ana Souza",
    maquina: "PC-102",
    setor: "Financeiro",
    descricao: "Impressora não conecta ao Wi-Fi.",
    contato: "11 99999-1111",
    status: "OPEN",
    priority: "HIGH",
  },
  {
    nome: "Carlos Lima",
    maquina: "NB-77",
    setor: "RH",
    descricao: "Erro ao abrir o sistema interno.",
    contato: "11 98888-2222",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
  },
  {
    nome: "Julia Freitas",
    maquina: "PC-310",
    setor: "Operações",
    descricao: "Teclado com teclas travando.",
    contato: null,
    status: "CLOSED",
    priority: "LOW",
  },
];

for (const ticket of tickets) {
  insertTicket.run({
    ...ticket,
    access_key: Math.random().toString(36).slice(2, 10).toUpperCase(),
    created_at: now,
    updated_at: now,
  });
}

console.log("Seed data inserted.");
