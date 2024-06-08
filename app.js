const express = require('express');
const app = express();
const cors = require("cors");
const bodyParser = require('body-parser');
const morgan = require("morgan");


app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));

const rotaUsuario = require("./routes/rotaUsuario");
const rotaProduto = require("./routes/rotaProduto");
const rotaEntrada = require("./routes/rotaEntrada");
const rotaSaida = require("./routes/rotaSaida");
const rotaEstoque = require("./routes/rotaEstoque");
const rotaFuncionarios = require("./routes/rotaFuncionarios");


app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");

    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );

    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, PATCH, DELETE, GET");
        return res.status(200).send({});
    }
    next();
});

app.use("/usuario", rotaUsuario);
app.use("/produto", rotaProduto);
app.use("/entrada", rotaEntrada);
app.use("/saida", rotaSaida);
app.use("/estoque", rotaEstoque);
app.use("/funcionario", rotaFuncionarios);




app.use((req, res, next) => {
    const erro = new Error("Não encontrado");
    erro.status = 404;
    next(erro);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    return res.json({
        erro: {
            mensagem: error.message
        }
    });
});

module.exports = app;
