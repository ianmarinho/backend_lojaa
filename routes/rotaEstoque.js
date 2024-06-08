const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;

router.get("/", (req, res, next) => {
    console.log("Entrando na rota GET /estoque");
    mysql.getConnection((error, connection) => {
        if (error) {
            console.error("Erro ao obter conexão com o banco de dados:", error);
            return res.status(500).send({
                error: "Erro ao conectar ao banco de dados"
            });
        }
            
        connection.query("SELECT * FROM estoque INNER JOIN produto ON estoque.id_produto = produto.id_", (error, rows) => {
            connection.release();

            if (error) {
                console.error("Erro ao executar a consulta SQL:", error);
                return res.status(500).send({
                    error: "Erro ao executar a consulta SQL"
                });
            }
            
            console.log("Consulta SQL executada com sucesso");
            res.status(200).send({
                mensagem: "Lista estoque",
                estoque: rows
            });
        });
    });
});

router.post('/', (req, res) => {
    const { id_produto, quantidade, valor_unitario } = req.body;

    // Validar os dados recebidos

    if (!id_produto || !quantidade || !valor_unitario) {
        return res.status(400).send({
            error: "Dados incompletos. Certifique-se de enviar id_produto, quantidade e valor_unitario."
        });
    }

    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: "Erro ao conectar ao banco de dados"
            });
        }

        connection.query(`INSERT INTO estoque (id_produto, quantidade, valor_unitario) VALUES (?, ?, ?)`, [id_produto, quantidade, valor_unitario], (error, result) => {
            connection.release();

            if (error) {
                console.error("Erro ao executar a consulta SQL:", error);
                return res.status(500).send({
                    error: "Erro ao executar a consulta SQL"
                });
            }

            res.status(201).send({
                mensagem: "Estoque Registrado!",
                estoqueProduto: {
                    id_produto: id_produto,
                    quantidade: quantidade,
                    valor_unitario: valor_unitario
                }
            });
        });
    });
});

router.delete("/:id", (req, res, next) => {
    const { id } = req.params;

    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: "Erro ao conectar ao banco de dados"
            });
        }

        connection.query("DELETE FROM estoque WHERE id = ?", id, (error) => {
            connection.release();

            if (error) {
                console.error("Erro ao executar a consulta SQL:", error);
                return res.status(500).send({
                    error: "Erro ao executar a consulta SQL"
                });
            }

            res.status(200).send({
                mensagem: "Estoque deletado com sucesso"
            });
        });
    });
});

module.exports = router;
