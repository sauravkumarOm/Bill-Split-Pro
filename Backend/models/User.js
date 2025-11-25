const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {type:String, required: true, trim:true},
    email:{type:String, required:true, unique:true, lowercase:true, trim:true},
    passwordHash :{type:String, required:true},
    avatarFileId:{type:Schema.Types.ObjectID, ref:'File', default:null},
}, {timestamps:true});

module.exports = mongoose.model('User', UserSchema);