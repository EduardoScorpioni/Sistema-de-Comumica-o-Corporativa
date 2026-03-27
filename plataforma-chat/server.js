const express = require("express");
const app = express();

const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: "*" }
});

const db = require("./db");

app.use(express.static(__dirname));

io.on("connection", (socket) => {
  console.log("Usuário conectado");

  socket.on("mensagem", (data) => {
  console.log("Mensagem recebida:", data);

  db.query(
    "INSERT INTO mensagens (conteudo) VALUES (?)",
    [`${data.usuario}: ${data.texto}`],
    (err) => {
      if (err) {
        console.error("Erro ao salvar:", err);
      } else {
        console.log("Salvou no banco");
      }
    }
  );

  io.emit("mensagem", `${data.usuario}: ${data.texto}`);
});
});

server.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
app.use(express.json());

const authRoutes = require("./auth");
app.use("/auth", authRoutes);