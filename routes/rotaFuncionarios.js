const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Rota para listar todos os funcionários
router.get("/", (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }
        
        conn.query("SELECT * FROM Funcionario", (error, rows) => {
            conn.release();
            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }
            res.status(200).send({
                mensagem: "Aqui está a lista de funcionários",
                funcionarios: rows
            });
        });
    });
});

// Rota para obter um funcionário específico por ID
router.get("/:id", (req, res, next) => {
    const { id } = req.params;
    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }
        
        conn.query("SELECT * FROM Funcionario WHERE ID = ?", [id], (error, rows) => {
            conn.release();
            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }
            res.status(200).send({
                mensagem: "Aqui está o funcionário com ID " + id,
                funcionario: rows[0]
            });
        });
    });
});

// Rota para fazer login de funcionário
router.post('/login', (req, res, next) => {
    const { email, senha } = req.body;
    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }
        
        conn.query("SELECT * FROM Funcionario WHERE Email = ?", [email], (error, rows) => {
            conn.release();
            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }

            if (rows.length < 1) {
                return res.status(401).send({
                    mensagem: "Funcionário não encontrado."
                });
            }
            
            const funcionario = rows[0];
            bcrypt.compare(senha, funcionario.Senha, (bcryptError, result) => {
                if (bcryptError) {
                    return res.status(500).send({
                        error: bcryptError.message
                    });
                }
                if (!result) {
                    return res.status(401).send({
                        mensagem: "Senha incorreta."
                    });
                }
                const token = jwt.sign({ id: funcionario.ID, email: funcionario.Email }, 'secreto', { expiresIn: '1h' });
                res.status(200).send({
                    mensagem: "Login bem sucedido.",
                    token: token
                });
            });
        });
    });
});

module.exports = router;
