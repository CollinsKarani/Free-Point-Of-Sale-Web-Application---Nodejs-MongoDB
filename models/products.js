var mongoose = require('mongoose');
var productSchema = mongoose.Schema({
    name:String,
    quantityReceived:Number,
    quantityIssued:Number,
    balance:Number,
    date:String,
    created_on:Date,
    price:Number,
    cart:Boolean
});
var Product = mongoose.model('Product',productSchema);
module.exports  = Product