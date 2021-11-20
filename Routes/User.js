'use strict'

var express = require('express');
var userController = require('../Controllers/User');
var router = express.Router();
var md_auth = require('../Middlewares/authenticated');
var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir:'./uploads/users'});

router.get('/probando', userController.probando);
router.post('/testeando', userController.testeando);
//Rutas de usuarios
router.post('/register',userController.save);
router.post('/login',userController.login);
router.put('/user/update',md_auth.authenticated,userController.update);
router.post('/upload-avatar',[md_auth.authenticated,md_upload],userController.uploadAvatar);
router.get('/avatar/:fileName',userController.avatar);
router.get('/users',userController.usersList);
router.get('/user/:userId',userController.findUser);

module.exports = router;