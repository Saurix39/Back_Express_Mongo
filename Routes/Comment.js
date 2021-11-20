'use strict';
var express = require('express');
var router = express.Router();
var commentController = require('../Controllers/Comment');
var md_auth = require('../Middlewares/authenticated');
router.post('/comment/topic/:id',md_auth.authenticated,commentController.add);
router.put('/comment/:id',md_auth.authenticated,commentController.update);
router.delete('/comment/:topicId/:commentId',md_auth.authenticated,commentController.delete);


module.exports = router;