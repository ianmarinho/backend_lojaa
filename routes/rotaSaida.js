const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;

router.get("/", (req, res, next) => {
    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query(`
            SELECT 
                saida.id_ as id_, 
                saida.id_produto as id_produto,
                saida.quantidade as quantidade,
                saida.data_saida as data_saida,
                produto.descricao as descricao,
                saida.valor_unitario as valor_unitario
            FROM saida 
            INNER JOIN produto 
            ON saida.id_produto = produto.id_
        `, (error, rows) => {
            connection.release(); // Release the connection after query execution
            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }
            res.status(200).send({
                mensagem: "Aqui está a lista de saida",
                saida: rows
            });
        });
    });
});

router.post('/', (req, res) => {

    const { idproduto, quantidade, valorunitario, datasaida } = req.body;

    mysql.getConnection((error, connection) => {
        if (error) {
            console.error("Erro ao obter conexão:", error.message);
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query(
            'INSERT INTO `saida` ( `id_produto`, `quantidade`, `valor_unitario`, `data_saida`) VALUES ( ?, ?, ?, ?)'
            , [idproduto, quantidade, valorunitario, datasaida], (error, result) => {


                connection.release(); // Release the connection after query execution
                if (error) {
                    return res.status(500).send({
                        error: error.message,
                        response: null
                    });
                }

                // atualizarEstoque(idproduto, quantidade, valorunitario, dataentrada);

                res.status(201).send({
                    mensagem: "Saida Registrada!",
                    saidaProduto: {
                        id_: result.insertId,
                        id_produto: idproduto,
                        quantidade: quantidade,
                        valor_unitario: valorunitario,
                        data_saida: datasaida
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
                error: error.message
            });
        }

        connection.query("DELETE FROM saida WHERE id_ = ?", id, (error, result) => {
            connection.release(); // Release the connection after query execution
            if (error) {
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

// function atualizarEstoque(idproduto, quantidade, valorunitario) {
//     mysql.getConnection((error, connection) => {
//         if (error) {
//             console.error("Erro ao obter conexão:", error.message);
//             return;
//         }

//         connection.query('SELECT * FROM estoque WHERE id_produto=?', [idproduto], (error, rows) => {
//             connection.release(); // Release the connection after query execution
//             if (error) {
//                 console.error("Erro ao executar consulta:", error.message);
//                 return;
//             }

//             if (rows.length > 0) {
//                 let qtde = parseFloat(rows[0].quantidade) + parseFloat(quantidade);

//                 connection.query(`
//                     UPDATE estoque 
//                     SET quantidade=?, valor_unitario=? 
//                     WHERE id_produto=?
//                 `, [qtde, valorunitario, idproduto], (error, result) => {
//                     if (error) {
//                         console.error("Erro ao atualizar estoque:", error.message);
//                     }
//                 });
//             } else {
//                 connection.query(`
//                     INSERT INTO estoque(id_produto, quantidade, valor_unitario) 
//                     VALUES (?, ?, ?)
//                 `, [idproduto, quantidade, valor_unitario], (error, result) => {
//                     if (error) {
//                         console.error("Erro ao inserir estoque:", error.message);
//                     }
//                 });
//             }
//         });
//     });
// }

module.exports = router;
