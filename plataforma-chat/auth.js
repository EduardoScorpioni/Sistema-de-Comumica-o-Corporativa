const express = require("express");
const router = express.Router();
const db = require("./db");
const bcrypt = require("bcrypt");

// cadastro
router.post("/register", async (req, res) => {
  const { nome, email, senha } = req.body;

  const hash = await bcrypt.hash(senha, 10);

  db.query(
    "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
    [nome, email, hash],
    (err) => {
      if (err) {
        return res.status(500).json({ erro: err });
      }
      res.json({ mensagem: "Usuário criado" });
    }
  );
});

// login
router.post("/login", (req, res) => {
  const { email, senha } = req.body;

  db.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json(err);

      if (results.length === 0) {
        return res.status(400).json({ erro: "Usuário não encontrado" });
      }

      const user = results[0];

      const senhaValida = await bcrypt.compare(senha, user.senha);

      if (!senhaValida) {
        return res.status(401).json({ erro: "Senha incorreta" });
      }

      res.json({
        mensagem: "Login OK",
        usuario: {
          id: user.id,
          nome: user.nome
        }
      });
    }
  );
});

module.exports = router;