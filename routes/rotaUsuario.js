const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.get("/", (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        conn.query("SELECT * FROM Usuarios", (error, rows) => {
            conn.release();
            if (error) {
                console.log(error.message)
                return res.status(500).send({
                    error: error.message
                });
            }
            res.status(200).send({
                mensagem: "Aqui está a lista de usuários",
                usuarios: rows
            });
        });
    });
});

router.get("/:id", (req, res, next) => {
    const { id } = req.params;
    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        conn.query("SELECT * FROM Usuarios WHERE id = ?", [id], (error, rows) => {
            conn.release();
            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }
            res.status(200).send({
                mensagem: "Aqui está o usuário com ID " + id,
                usuario: rows[0]
            });
        });
    });
});

// Chave secreta para assinar o token (mantenha-a segura)
const chaveSecreta = 'w*2kxTmqvbg^4mKtb9Fk4LdX%Rp#X6!F';

router.post('/login', (req, res, next) => {
    const { email, senha } = req.body;

    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        conn.query("SELECT * FROM Usuarios WHERE Email = ?", [email], (error, rows) => {
            conn.release();
            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }

            if (rows.length < 1) {
                return res.status(401).send({
                    mensagem: "Usuário não encontrado."
                });
            }

            const usuario = rows[0];

            bcrypt.compare(senha, usuario.Senha, (bcryptError, result) => {
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

                // Criação do token com o ID do usuário
                //const token = jwt.sign({ id: usuario.id }, chaveSecreta, { expiresIn: '1h' });
                const usuario = {
                    id: rows[0].ID,
                    nome: rows[0].Nome,
                    email:rows[0].Email
                }

                res.status(200).send({
                    mensagem: "Login bem sucedido.",
                    usuario
                  
                });
            });
        });
    });
});


router.post('/', (req, res, next) => {
    const { nome, email, senha, tipo, cep, logradouro, complemento, bairro, localidade, uf, cpf } = req.body;
    mysql.getConnection((error, conn) => {

        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }



        bcrypt.hash(senha, 8, (hashError, hashedPassword) => {

            if (hashError) {
                return res.status(500).send({
                    error: hashError.message
                });
            }
            conn.query(
                `INSERT INTO Usuarios (Nome, Email, Senha, Tipo, cep,  logradouro, complemento, bairro, localidade, uf, CPF) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [nome, email, hashedPassword, tipo, cep, logradouro, complemento, bairro, localidade, uf, cpf],
                (insertError, result) => {

                    conn.release();
                    if (insertError) {
                        return res.status(500).send({
                            error: insertError.message
                        });
                    }
                    res.status(201).send({
                        mensagem: "Cadastro criado com sucesso!",
                        usuario: {
                            id: result.insertId,
                            nome: nome,
                            email: email
                        }
                    });
                }
            );
        });
    });
});

router.put("/", (req, res, next) => {
    const { id, nome, email, senha, tipo, endereco, cep, logradouro, complemento, bairro, localidade, uf, cpf } = req.body;
    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        conn.query(
            "UPDATE Usuarios SET nome = ?, email = ?, senha = ?, tipo = ?, endereco = ?, cep = ?, logradouro = ?, complemento = ?, bairro = ?, localidade = ?, uf = ?, cpf = ? WHERE id = ?",
            [nome, email, senha, tipo, endereco, cep, logradouro, complemento, bairro, localidade, uf, cpf, id],
            (updateError, result) => {
                conn.release();
                if (updateError) {
                    return res.status(500).send({
                        error: updateError.message
                    });
                }
                res.status(200).send({
                    mensagem: "Cadastro alterado com sucesso"
                });
            }
        );
    });
});

router.delete("/:id", (req, res, next) => {
    const { id } = req.params;
    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        conn.query("DELETE FROM Usuarios WHERE id = ?", [id], (deleteError, result) => {
            conn.release();
            if (deleteError) {
                return res.status(500).send({
                    error: deleteError.message
                });
            }
            res.status(200).send({
                mensagem: "Cadastro deletado com sucesso"
            });
        });
    });
});

module.exports = router;
