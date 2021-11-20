/*
'use strict';
var mongoose = require('mongoose');
var schema = mongoose.Schema;
//Modelo de Comment
var commentSchema = schema({
    content:String,
    date:{type:Date, default:Date.now},
    user:{type:schema.ObjectId,ref:'User'}
});
module.exports = mongoose.model('Comment', commentSchema);
*/