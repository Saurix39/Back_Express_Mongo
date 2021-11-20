'use strict'
var jwt = require('jwt-simple');
var secret = 'clave-secreta-para-generar-el-token-9999';
var moment = require('moment');
exports.authenticated = function(req,res,next){
    console.log('Estan pasando por el middleware');
    //Comprobar si llega la cabecera de auth
    if(!req.headers.authorization){
        return res.status(400).send({
            status:"error",
            message:"No se obtuvo un token de autorización"
        });
    }
    //Limpiar el token
    var token = req.headers.authorization.replace(/['"]+/g,'');
    //Decodificar el token
    try{
        var payload = jwt.decode(token,secret);
        //Verificar la expiracion del token
        if(payload.exp<=moment().unix()){
            return res.status(400).send({
                status:"error",
                message:"El token ha expirado"
            });
        }
    }catch(ex){
        return res.status(400).send({
            status:"error",
            message:"El token no es valido"
        });
    }
    //Adjuntar usaurio identificado a la request
    req.user=payload;
    //Pasar a la accion
    next();
}