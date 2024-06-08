const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool; // Supondo que "mysql" é o pool de conexão

router.get("/", (req, res, next) => {
    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("SELECT * FROM Produtos", (error, rows) => {
            connection.release(); // Liberar a conexão após a consulta
            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }

            res.status(200).send({
                mensagem: "Aqui está a lista de produtos",
                produtos: rows
            });
        });
    });
});

router.get("/:id", (req, res, next) => {
    const id = req.params.id

    console.log(req.body);

    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("SELECT * FROM produto where id_ =?", [id], (error, rows) => {
            connection.release(); // Liberar a conexão após a consulta
            if (error) {
                console.log("passando na linha 80")
                console.log(msg)
                return res.status(500).send({
                    error: error.message
                });
            }
            res.status(200).send({
                mensagem: "Aqui está a lista de produtos",
                produto: rows
            });
        });
    });
});

router.post('/', (req, res, next) => {
    const { status, descricao, estoque_minimo, estoque_maximo } = req.body;
    console.log(req.body);
    // Verifica se todas as variáveis estão definidas
    if (!status || !descricao || !estoque_minimo || !estoque_maximo) {

        return res.status(400).send({
            mensagem: "Falha ao cadastrar produto. Certifique-se de fornecer todos os campos necessários."
        });
    }

    // Validação dos campos
    let msg = [];
    if (status.length < 3) {
        msg.push({ mensagem: "Status inválido! Deve ter pelo menos 3 caracteres." });
    }

    if (!descricao.trim()) {
        msg.push({ mensagem: "Coloque a procedência do produto." });
    }

    // Validação para verificar se estoque_minimo e estoque_maximo são números
    if (isNaN(estoque_minimo) || isNaN(estoque_maximo)) {
        msg.push({ mensagem: "Estoque mínimo e máximo devem ser números válidos." });
    }

    if (msg.length > 0) {

        console.log("passando na linha 80")
        console.log(msg)
        return res.status(400).send({
            mensagem: "Falha ao cadastrar produto.",
            erros: msg
        });
    }

    // Verifica se o produto já está cadastrado
    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message,
                response: null
            });
        }

        connection.query(`SELECT * FROM produto WHERE status = ? AND descricao = ?`, [status, descricao], (error, results) => {
            if (error) {
                connection.release();
                return res.status(500).send({
                    error: error.message,
                    response: null
                });
            }

            if (results.length > 0) {
                connection.release();
                return res.status(400).send({
                    mensagem: "Produto já cadastrado."
                });
            }

            // Insere o novo produto no banco de dados
            connection.query(`INSERT INTO produto (status, descricao, estoque_minimo, estoque_maximo) VALUES (?, ?, ?, ?)`,
                [status, descricao, estoque_minimo, estoque_maximo], (error, result) => {
                    connection.release();
                    if (error) {
                        return res.status(500).send({
                            error: error.message,
                            response: null
                        });
                    }

                    res.status(201).send({
                        mensagem: "Produto cadastrado com sucesso!",
                        produto: {
                            id: result.insertId,
                            status,
                            descricao,
                            estoque_minimo,
                            estoque_maximo
                        }
                    });
                });
        });
    });
});

router.put("/", (req, res, next) => {
    const { id, status, descricao, estoque_minimo, estoque_maximo } = req.body;

    console.log(req.body);

    if (!id || !status || !descricao || !estoque_minimo || !estoque_maximo) {
        return res.status(400).send({
            mensagem: "Falha ao atualizar produto. Certifique-se de fornecer todos os campos necessários."
        });
    }

    mysql.getConnection((error, connection) => {
        if (error) {
            console.log("passando na linha 80")
            console.log(msg)
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("UPDATE produto SET status = ?, descricao = ?, estoque_minimo = ?, estoque_maximo = ? WHERE id_ = ?",
            [status, descricao, estoque_minimo, estoque_maximo, id], (error, result) => {
                connection.release();
                if (error) {
                    return res.status(500).send({
                        error: error.message
                    });
                }
                res.status(200).send({
                    mensagem: "Cadastro alterado com sucesso"
                });
            });
    });
});
router.delete("/:id", (req, res, next) => {
    const { id } = req.params;

    if (!id || id === "") {
        return res.status(400).send({
            mensagem: "ID do produto não fornecido."
        });
    }

    mysql.getConnection((error, connection) => {
        if (error) {
            console.log("Erro ao conectar no banco MySQL: " + error.message);
            return res.status(500).send({
                error: error.message
            });
        }
        
        connection.query("DELETE FROM produto WHERE id_ = ?", [id], (error, result) => {
            connection.release();
            if (error) {
                console.log("Erro ao deletar: " + error.message);
                return res.status(500).send({
                    error: error.message
                });
            }
            res.status(200).send({
                mensagem: "Cadastro deletado com sucesso"
            });
        });
    });
});


module.exports = router;
