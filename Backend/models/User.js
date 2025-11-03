const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {type:String, required: true, trim:true},
    email:{type:String, required:true, unique:true, lowercase:true, trim:true},
    passwordHash :{type:String, required:true},
    avatarUrl:{type:String},
}, {timestamps:true});

module.exports = mongoose.model('User', UserSchema);