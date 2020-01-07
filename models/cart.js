var mongoose = require('mongoose');
var cartSchema = mongoose.Schema({
    name:String,
    quantity:Number,
    unit:Number,
    productID:String,
    price:Number,
    price2:Number,
    userID:String

});
var Cart = mongoose.model('Cart',cartSchema);
module.exports  = Cart