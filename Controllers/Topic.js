'use strict';
var validator = require('validator');
var Topic = require('../Models/Topic');
var controller = {
    saveTopic:function(req,res){
        var params = req.body;
        try{    
            var validate_title= !validator.isEmpty(params.title);
            var validate_content= !validator.isEmpty(params.content);
            var validate_lang= !validator.isEmpty(params.lang);
        }catch(ex){
            return res.status(400).send({
                status:"error",
                code:400,
                message:"No se han obtenido los parametros necesarios"
            });
        }
        if(validate_title && validate_content && validate_lang){
            var topic = new Topic();
            topic.title=params.title;
            topic.content=params.content;
            topic.lang=params.lang;
            topic.code=params.code;
            topic.user=req.user.sub;
            topic.save((err,topicStored)=>{
                if(err || !topicStored){
                    return res.status(400).send({
                        status:"error",
                        code:400,
                        message:"No Se ha podido almacenar el topic"
                    });
                }
                return res.status(200).send({
                    status:"success",
                    code:200,
                    message:"Se ha podido almacenar el topic",
                    topic:topicStored
                });
            });
        }else{
            return res.status(400).send({
                status:"error",
                code:400,
                message:"Los datos no son validos"
            });
        }


    },
    getTopics:function(req,res){
        //Cargar la libreria de paginacion en el modelo topic
        //Obtener la pagina
        if(!req.params.page || req.params.page==null || req.params.page==undefined){
            var page = 1;
        }else{
            var page = parseInt(req.params.page);
        }
        //Indicar las opciones de paginacion
        var options={
            sort:{date:-1},
            populate:'user',
            limit:5,
            page:page
        };
        //Hacer el find paginado
        Topic.paginate({},options,(err,topics)=>{
            if(err){
                return res.status(400).send({
                    status:"error",
                    code:400,
                    message:"No se han podido encontrar los documentos"
                });  
            }
            return res.status(200).send({
                status:"success",
                code:200,
                message:"Se han encontrado documentos",
                topics:topics.docs,
                totalDocs:topics.totalDocs,
                totalPages:topics.totalPages
            });
        });
        //Devolver el resultado (topics, total de documentos, total de paginas)
    },
    getUserTopics:function(req,res){
        //Obtener la pagina
        if(!req.params.page || req.params.page==null || req.params.page==undefined){
            var page = 1;
        }else{
            var page = parseInt(req.params.page);
        }
        //Obtener el usuario
        if(!req.params.userId || req.params.userId==null || req.params.userId == undefined){
            return res.status(400).send({
                status:"error",
                code:400,
                message:"No se ha recibido el parametro del usuario"
            });
        }
        var user_id = req.params.userId;
        //Configurar las opciones de paginacion
            var options = {
                sort:{date:-1},
                populate:'User',
                limit:5,
                page:page
            };
        //Hacer el find paginado
        Topic.paginate({user:user_id},options, (err,topics)=>{
            if(err){
                return res.status(400).send({
                    status:"error",
                    code:400,
                    message:"No se han podido encontrar los documentos"
                });  
            }
            //Devolver una respuesta
            return res.status(200).send({
                status:"success",
                code:200,
                message:"Se han encontrado documentos",
                topics:topics.docs,
                totalDocs:topics.totalDocs,
                totalPages:topics.totalPages
            });
        });
        
    },
    getTopic:function(req,res){
        //Recibir el id
        var id = req.params.id;
        //Hacer el find del topic
        Topic.findById(id)
        .populate('user')
	.populate('comments.user')
        .exec((err,topic)=>{
            if(err){
                return res.status(400).send({
                    status:"error",
                    code:400,
                    message:"No se pudo obtener el documento"
                });
            }
            //Devolver la respuesta
            return res.status(200).send({
                status:"success",
                code:200,
                message:"Se obtuvo el documento con exito",
                topic:topic
            });
        });
    },
    update:function(req, res){
        //Recibir el id del topic a actualizar
        if(!req.params.id || req.params.id==undefined || req.params.id ==null){
            return res.status(400).send({
                status:"error",
                code:400,
                message:"No se ha obtenido el id del topic a actualizar"
            });
        }
        var id_topic = req.params.id;
        //Recibir la informacion a actualizar
        var params = req.body;
        //Validar la informacion
        try{
            var validate_tittle = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);
        }catch(ex){
            return res.status(400).send({
                status:"error",
                code:400,
                message:"No se han recibido los parametros necesarios"
            });
        }
        if(validate_tittle && validate_content && validate_lang){
            //Montar un json con los datos modificables
            var actualizar = {
                title:params.title,
                content:params.content,
                code:params.code,
                lang:params.lang
            }
            //Comprobar que el usuario es propietario del topic
            var user = req.user;
            Topic.findById(id_topic,{user:1},{},(err,topic)=>{
                if(err || !topic){
                    return res.status(400).send({
                        status:"error",
                        code:400,
                        message:"Ocurrio un error al buscar el topic"
                    });
                }
                if(user.sub != topic.user){
                    return res.status(400).send({
                        status:"error",
                        code:400,
                        message:"Este usuario no es propietario del topic"
                    });
                }
                //Ejecutar el find and update
                Topic.findOneAndUpdate({_id:id_topic},actualizar,{new:true},(err,topicUpdated)=>{
                    if(err || !topicUpdated){
                        return res.status(400).send({
                            status:"error",
                            code:400,
                            message:"Error al intentar actualizar el topic"
                        });
                    }
                    //Devolver la respuesta
                    res.status(200).send({
                        status:"success",
                        code:200,
                        message:"Se ha actualizado el topic",
                        topic:topicUpdated
                    });
                });
            });  
        }

    },
    delete:function(req,res){
        //Recibir el id del topic a eliminar
        var id_topic = req.params.id;
        //Comprobar que el usuario es propietario del topic
        var user = req.user;
        //Eliminar el topic
        Topic.findOneAndDelete({_id:id_topic, user:user.sub},{},(err,topicDeleted)=>{
            if(err){
                return res.status(400).send({
                    status:"success",
                    code:400,
                    message:"Ocurrio un error al intentar eliminar el topic"
                });
            }
            if(!topicDeleted){
                return res.status(400).send({
                    status:"success",
                    code:400,
                    message:"El topic no existe o el usuario no es propietario del mismo"
                });
            }
            //Devolver respuesta
            return res.status(200).send({
                status:"success",
                code:200,
                message:"El topic fue eliminado de la base de datos",
                topicDeleted:topicDeleted
            });
        });
        
    },
    search:function(req,res){
        //Sacar el string a buscar de la url
        var search=req.params.search;
        //Hacer un find con un operador or
            Topic.find({$or:[
                {"title":{$regex:search,$options:"i"}},
                {"content":{$regex:search,$options:"i"}},
                {"lang":{$regex:search,$options:"i"}},
                {"code":{$regex:search,$options:"i"}}
            ]})
            .sort([['date','descending']])
            .exec((err,topics)=>{
                if(err){
                    return res.status(400).send({
                        status:"error",
                        code:400,
                        message:"Error al hacer la busqueda"
                    });
                }
                if(!topics){
                    return res.status(400).send({
                        status:"error",
                        code:400,
                        message:"No hay topics disponibles"
                    });
                }
                //Devolver el resultado
                return res.status(200).send({
                    status:"success",
                    code:200,
                    message:"Se han encontrado los topics",
                    topics:topics
                });
            });
    }
}

module.exports = controller;