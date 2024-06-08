const mysql =require("mysql");

var pool =mysql.createPool({
    "user": "355852",
    "password": "Deus8119@", // Insira a senha correta aqui
    "database": "iansilvamarinho_loja_roupas",
    "host": "mysql-iansilvamarinho.alwaysdata.net",
    "port": 3306

});

exports.pool=pool;


