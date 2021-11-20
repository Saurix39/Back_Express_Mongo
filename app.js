'use strict';

//Requires
var express = require('express');
          //var bodyParser = require('body-parser');
//Ejecutar express
var app = express();
//cargar archivos de rutas
var user_routes = require('./Routes/User');
var topic_routes = require('./Routes/Topic');
var comment_routes = require('./Routes/Comment');
//Middlewares
app.use(express.urlencoded({extended:false}));
app.use(express.json());
//CORS
// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});
//Reescribir rutas
app.use('/api',user_routes);
app.use('/api',topic_routes);
app.use('/api',comment_routes);
//Exportar modulo
module.exports = app;