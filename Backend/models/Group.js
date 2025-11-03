const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroupSchema = new Schema({
    name: {type:String, required: true, trim:true},
    members: [{type: Schema.Types.ObjectId, ref: 'User'}],
    currency:{type:String , default:'INR'},
    createdBy: {type:Schema.Types.ObjectId, ref: 'User', required:true}
}, {timestamps:true});

module.exports = mongoose.model('Group', GroupSchema);