'use strict';
var express = require('express');
var router = express.Router();
var topicController = require('../Controllers/Topic');
var md_auth = require('../Middlewares/authenticated');

router.post('/topic',md_auth.authenticated,topicController.saveTopic);
router.get('/topics/:page?',topicController.getTopics);
router.get('/user-topics/:userId/:page?',topicController.getUserTopics);
router.get('/topic/:id',topicController.getTopic);
router.put('/topic/:id',md_auth.authenticated,topicController.update);
router.delete('/topic/:id',md_auth.authenticated,topicController.delete);
router.get('/search/:search',topicController.search);

//El simbolo ? en page significa que es un parametro opcional
module.exports = router;