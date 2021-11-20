'use strict';
var validator = require('validator');
var User = require('../Models/User');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../Services/jwt');
var fs = require('fs');
var path = require('path');

var controller = {
    probando: function(req,res){
        return res.status(200).send({
            message:"Soy el metodo probando"
        });
    },

    testeando: function(req,res){
        return res.status(200).send({
            message:"Soy el metodo testeando"
        });
    },

    save:function(req, res){
        //Recoger los parametros de la petición
        var params = req.body;
        //Validar la información
        try{
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.email);
        }catch(ex){
            return res.status(400).send({
                status:"error",
                message:"No se han enviado los datos completos"
            });
        }
        //console.log(validate_name,validate_surname,validate_email,validate_password);
        if(validate_name && validate_surname && validate_email && validate_password){
            //Crear el objeto de usuario
            var user = new User();
            //Asignar valores al objetos
            user.name=params.name;
            user.surname=params.surname;
            user.email=params.email.toLowerCase();
            user.role="ROLE_USER";
            user.image=null;

            //Comprobar si el usuario existe
            User.findOne({email:user.email},(err,issetUser)=>{
                if(err){
                    return res.status(500).send({
                        message:"Error al comprobar duplicidad del usuario"
                    });
                }
                if(!issetUser){
                    //Si no existe cifrar la contraseña y guardarlo
                    bcrypt.hash(params.password,null,null,(err,hash)=>{
                        user.password=hash;
                        user.save((err,userSaved)=>{
                            if(err){
                                return res.status(400).send({
                                    status:"error",
                                    message:"Ha ocurrido un error al intentar almacenar el usuario"
                                });
                            }
                            if(!userSaved){
                                return res.status(400).send({
                                    status:"error",
                                    message:"El usuario no se ha podido almacenar"
                                });
                            }
                            //Devolver una respuesta
                            return res.status(200).send({
                                status:"success",
                                message:"El usuario ha sido almacenado correctamente",
                                user:userSaved
                            });
                        });
                    });
                }else{
                    return res.status(400).send({
                        status:"error",
                        message:"El usuario esta duplicado"
                    });
                }
            });
            
        }else{
            return res.status(400).send({
                status:"error",
                message:"Validacion de los datos incorrecta"
            });
        }
    },
    login:function(req,res){
        //Recoger los parametros
        var params = req.body;
        //Validar la informacion
        try{
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        }catch(ex){
            return res.status(400).send({
                status:"error",
                message:"No se han enviado los datos completos"
            });
        }
        if(validate_email && validate_password){
            //Buscar usuario que coincida con los datos
            User.findOne({email:params.email},(err,userfind)=>{
                if(err){
                    return res.status(400).send({
                        status:"error",
                        code:400,
                        message:"Ocurrio un error con la busqueda del usuario"
                    });
                }
                if(userfind){
                    //Si lo encuentra comprobar la contraseña
                    bcrypt.compare(params.password,userfind.password,(err,check)=>{
                        if(err){
                            return res.status(400).send({
                                status:"error",
                                code:400,
                                message:"Ocurrio un error con la comparación de la contraseña"
                            });
                        }
                        if(check){
                            //Si las credenciales coinciden
                            //Limpiar el usuario
                            userfind.password=undefined;
                            //Crear el token de autenticación
                            if(params.getToken){
                                return res.status(200).send({
                                    status:"success",
                                    code:200,
                                    message:"Se ha generado el token correctamente",
                                    token:jwt.createToken(userfind)
                                });
                            }
                            //Devolver los datos
                            return res.status(200).send({
                                status:"success",
                                code:200,
                                message:"Se encontro el usuario",
                                user:userfind
                            });
                        }else{
                            return res.status(400).send({
                                status:"error",
                                code:400,
                                message:"Contraseña incorrecta"
                            });
                        }
                    });
                    
                }else{
                    return res.status(400).send({
                        status:"error",
                        code:400,
                        message:"El usuario no se encuentra registrado"
                    });
                }
            });
        }else{
            return res.status(400).send({
                status:"error",
                code:400,
                message:"Validación de la información fallida"
            });
        }   
    },
    update:function(req,res){
        var params = req.body;
        var user = req.user;
        try{
            var validate_name = !validator.isEmpty(params.name); 
            var validate_surname= !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        }catch(ex){
            return res.status(400).send({
                status:"error",
                message:"No se han enviado los datos completos"
            });
        }
        if(validate_name && validate_surname && validate_email){
            delete params.password
            //Comprobar si el email es unico
            if(user.email != params.email){
                User.findOne({email:params.email.toLowerCase()},(err,userfind)=>{
                    if(err){
                        return res.status(400).send({
                            status:"error",
                            message:"Error al comprobar duplicidad"
                        });
                    }
                    if(userfind && userfind.email==params.email){
                        return res.status(400).send({
                            status:"error",
                            message:"El correo ya se encuentra registrado en la plataforma"
                        });
                    }else{
                        User.findOneAndUpdate({_id:user.sub},params,{new:true},(err,userUpdated)=>{
                            if(err || !userUpdated){
                                return res.status(400).send({
                                    status:"error",
                                    message:"Error al actualizar el usuario"
                                });
                            }
                            return res.status(200).send({
                                status:"success",
                                message:"Se ha actualizado correctamente el usuario",
                                user:userUpdated
                            });
                        });
                    }
                });
            }else{
                User.findOneAndUpdate({_id:user.sub},params,{new:true},(err,userUpdated)=>{
                    if(err || !userUpdated){
                        return res.status(400).send({
                            status:"error",
                            message:"Error al actualizar el usuario"
                        });
                    }
                    return res.status(200).send({
                        status:"success",
                        message:"Se ha actualizado correctamente el usuario",
                        user:userUpdated
                    });
                });
            }
        }else{
            return res.status(400).send({
                status:"error",
                message:"Validación de la información fallida"
            });
        }
    },
    uploadAvatar:function(req,res){
        //Configurar el modulo multiparty en el router de usuarios
        //Recoger el fichero de la peticion
        var file_name="avatar no subido";
        if(!req.files){
            return res.status(400).send({
                status:"error",
                message:"No se ha necontrado archivos"
            });
        }
        //Conseguir el nombre y la extension del archivo subido
        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];
        //Comprobar la extension
        if(file_ext!="jpg" && file_ext!="png" && file_ext!="jpeg" && file_ext!="gif"){
            //Si no es valida la extension borrar el archivo subido
            fs.unlink(file_path,(err)=>{
                res.status(400).send({
                    status:"error",
                    message:"La extension del archivo no es valida"
                });
                
            })
        }else{ 
            //Sacar el id del usuario identificado
            var user_id=req.user.sub;
            //Hacer el update
            User.findOneAndUpdate({_id:user_id},{image:file_name},{new:true},(err,userUpdated)=>{
                if(err){
                    res.status(400).send({
                        status:"error",
                        message:"Error al guardar el usuario"
                    });
                }
                //Devolver la respuesta
                res.status(200).send({
                    status:"success",
                    message:"El metodo funciona correctamente",
                    user:userUpdated
                });
            });
            
        }   
    },
    avatar: function(req,res){
        var file_name=req.params.fileName;
        var path_file='./uploads/users/'+file_name;
        //si el archivo existe
        if(fs.existsSync(path_file)){
            return res.sendFile(path.resolve(path_file));
        }else{
            return res.status(400).send({
                status:"error",
                code:400,
                message:"No existe el avatar"
            });   
        }
    },
    usersList:function(req,res){
        User.find({},{password:0},function(err, documents){
            if(err || !documents){
                return res.status(400).send({
                    status:"error",
                    code:400,
                    message:"Error al intentar encontrar los usuarios"
                });
            }
            return res.status(200).send({
                status:"success",
                code:200,
                users:documents
            });
        });
    },
    findUser:function(req,res){
        var id_user=req.params.userId;
        User.findById(id_user,{password:0},function(err,user){
            if(err || !user){
                res.status(400).send({
                    status:"error",
                    code:400,
                    message:"No se ha logrado encontrar el usuario"
                });
            }
            return res.status(200).send({
                status:"success",
                code:200,
                message:"Se ha encontrado el usuario",
                user:user
            });
        });
    }

}

module.exports = controller;