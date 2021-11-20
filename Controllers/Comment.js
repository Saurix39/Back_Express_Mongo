'use strict';
var Topic = require('../Models/Topic');
var validator = require('validator');
var controller = {
    add:function(req,res){
        //Recibir el id del topic al que queremos comentar
        var topicId = req.params.id;
        //Buscar el topic
        Topic.findById(topicId).exec((err,topic)=>{
            if(err){
                return res.status(400).send({
                    status:"error",
                    code:400,
                    message:"Error al buscar el topic"
                });   
            }
            if(!topic){
                return res.status(400).send({
                    status:"error",
                    code:400,
                    message:"El topic no existe"
                });   
            }
            //Comprobar objeto usuario y validar datos
            if(req.body.content){
                try{
                    var validate_content=!validator.isEmpty(req.body.content);
                }catch(ex){
                    return res.status(400).send({
                        status:"error",
                        code:400,
                        message:"No se han recibido los datos completos"
                    });
                }
                if(!validate_content){
                    return res.status(400).send({
                        status:"error",
                        code:400,
                        message:"Error en la validación de los datos"
                    });
                }
                //Hacer un push en la propiedad comments del topic
                var comment = {
                    user: req.user.sub,
                    content: req.body.content
                }
                topic.comments.push(comment);
                //Guardar el topic
                topic.save((err)=>{
                    if(err){
                        return res.status(400).send({
                            status:"error",
                            code:400,
                            message:"No se pudo amacenar el comentario"
                        });
                    }
		Topic.findById(topic._id)
        	.populate('user')
		.populate('comments.user')
        	.exec((err,topicComm)=>{
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
                		message:"Se almaceno el comentario con exito",
                		topic:topicComm
            		});
        	});
                });
            }
            
        });
    },
    update:function(req,res){
        //Encontrar el comentario con el id
        var commentId = req.params.id;
        //Recibir y validar los parametros
        if(req.body.content){
            try{
                var validate_content = !validator.isEmpty(req.body.content);
                if(validate_content){
                    //Encontrar el topic, verificar que es el usuario propietario del comentario y actualizarlo 
                    Topic.findOneAndUpdate({"comments._id":commentId,"comments.user":req.user.sub},
                    {"$set": 
                    {"comments.$.content":req.body.content}},{new:true},(err,topicUpdated)=>{
                        if(err){
                            return res.status(400).send({
                                status:"error",
                                code:400,
                                message:"Ocurrio un error al intentar actualizar el comentario"
                            });
                        }
                        if(!topicUpdated){
                            return res.status(400).send({
                                status:"error",
                                code:400,
                                message:"No se ha actualizado el comentario o no es propietario del mismo"
                            });
                        }
                        //Devolver una respuesta
                        return res.status(200).send({
                            status:"success",
                            code:200,
                            message:"Se ha actualizado el comentario",
                            topic:topicUpdated
                        });

                    });
                }
            }catch(ex){
                return res.status(400).send({
                    status:"error",
                    code:400,
                    message:"No se han obtenido todos los parametros necesarios"
                });
            }
        }
    },
    delete:function(req,res){
        //Sacar el id del topic y del comentario a borrar
        var topicId = req.params.topicId;
        var commentId = req.params.commentId;
        //Buscar el topic
        Topic.findById(topicId).exec((err,topic)=>{
            if(err){
                return res.status(400).send({
                    status:"error",
                    code:400,
                    message:"Error al encontrar topic"
                });
            }
            if(!topic){
                return res.status(400).send({
                    status:"error",
                    code:400,
                    message:"No existe el topic"
                });
            }
            //Seleccionar el comentario
            var comment = topic.comments.id(commentId);
            if(!comment){
                return res.status(400).send({
                    status:"error",
                    code:400,
                    message:"No existe el comentario"
                });
            }
            if(comment.user == req.user.sub){
                //Eliminar el comentario
                comment.remove();
                //Guardar el topic
                topic.save((err)=>{
                    if(err){
                        return res.status(400).send({
                            status:"error",
                            code:400,
                            message:"No se ha podido guardar el topic"
                        });
                    }
		Topic.findById(topic._id)
        		.populate('user')
			.populate('comments.user')
        		.exec((err,topicComment)=>{
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
                		message:"Se elimino el comentario con exito",
                		topic:topicComment
            		});
        	});
                });
            }else{
                return res.status(400).send({
                    status:"error",
                    code:400,
                    message:"Este usuario no es propietario del comentario"
                });
            }
        });
    }
}
module.exports = controller;