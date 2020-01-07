var mongoose = require('mongoose');
var salesSchema = mongoose.Schema({
    name:String,
    quantity:Number,
    date:String,
    created_on:Date,
    price:Number
});
var Sales = mongoose.model('Sales',salesSchema);
module.exports  = Sales