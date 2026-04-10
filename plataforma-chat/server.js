const express = require("express");
const app = express();

// ✅ express.json() deve vir antes de qualquer rota
app.use(express.json());

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

  // ✅ Busca histórico fazendo JOIN com usuarios para pegar o nome
  db.query(
    `SELECT u.nome, m.texto, m.enviado_em, m.canal_id
     FROM mensagens m
     JOIN usuarios u ON u.id = m.usuario_id
     ORDER BY m.enviado_em ASC
     LIMIT 100`,
    (err, results) => {
      if (err) {
        console.error("Erro ao buscar histórico:", err);
      } else {
        const historico = results.map((row) => ({
          usuario: row.nome,
          texto: row.texto,
          canal_id: row.canal_id,
          enviado_em: row.enviado_em
        }));
        socket.emit("historico", historico);
      }
    }
  );

  socket.on("mensagem", (data) => {
    console.log("Mensagem recebida:", data);

    // ✅ Salva nas colunas corretas do banco
    db.query(
      "INSERT INTO mensagens (usuario_id, canal_id, texto) VALUES (?, ?, ?)",
      [data.usuarioId, data.canalId, data.texto],
      (err) => {
        if (err) {
          console.error("Erro ao salvar:", err);
        } else {
          console.log("Salvou no banco");
        }
      }
    );

    io.emit("mensagem", {
      usuario: data.usuario,
      texto: data.texto,
      canal_id: data.canalId
    });
  });
});

const authRoutes = require("./auth");
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.redirect("/login.html");
});

server.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});