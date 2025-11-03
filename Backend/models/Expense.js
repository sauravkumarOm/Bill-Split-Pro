const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SplitSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    share :{type:Number, required: true},
    paid :{type: Boolean, default: false}
});

const ExpenseScehma = new Schema({
    group: {type:Schema.Types.ObjectId, ref: 'Group', required:true},
    title: {type:String, required:true},
    amount: {type:Number, required:true},
    paidBy: {type:Schema.Types.ObjectId, ref: 'User', required:true},
    splitType: {type: String, enum: ['equal', 'custom', 'percentage'], default: 'equal'},
    splits: [SplitSchema],
    date: {type:Date, default: Date.now},
    note: {type:String},
    receiptUrl: {type:String}
}, {timestamps:true});

module.exports = mongoose.model('Expense', ExpenseScehma);