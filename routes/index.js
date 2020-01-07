var express = require('express');
var bcrypt = require('bcryptjs');
var passport = require('passport');
var router = express.Router();
var Product = require('../models/products.js')
var Cart = require('../models/cart.js');
var Sales = require('../models/sales.js');
var User = require('../models/user.js');
var auth = function (req, res, next) {
    if (!req.user) {
     
        res.redirect('/')
    } else {
        next()
    }
}
router.get('/',function(req,res){
    res.render('login.jade')
})
router.get('/signup',function(req,res){
    res.render('signup.jade')
})
router.get('/dashboard',auth, function (req, res) {
    Cart.find({userID:req.user.id}, function (err, carts) {
        res.render('dashboard.jade',{
            carts:carts
        })
    })
   
})
router.post('/signup',function(req,res){
    
    var data = new User();
    data.username = req.body.username;
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(req.body.password, salt, function (err, hash) {
            if (err) {
                console.log(err);
            } else {
                data.password = hash;
                data.save(function (err) {
                    if (err) {
                        console.log(err)
                    } else {

                       
                        res.redirect('/')


                    }
                })
            }
        })
    })

})
router.get('/geth',function(req,res){
    res.render('misesi.jade')
})
router.get('/addproducts',auth,function (req, res) {
    Cart.find({userID:req.user.id}, function (err, carts) {
        res.render('addproducts.jade',{
            carts:carts
        })
    })
    
})
router.get('/viewproducts',auth, function (req, res) {
    Product.find({}, function (err, products) {
        res.render('viewproducts.jade', {
            products: products
        })

    })

})
router.get('/inventory',auth,function(req,res){
    Cart.find({userID:req.user.id}, function (err, carts) {
      
    
    Product.find({}, function (err, products) {
        res.render('inventory.jade', {
            products: products,
            carts:carts
        })

    })
})
    
})
router.get('/sales',auth, function (req, res) {
    Sales.find({},function(err,sales){
        Sales.find({}).distinct('price',function(err,sale){
            Cart.find({userID:req.user.id}, function (err, carts) {
                var total = 0;
                for (var i = 0; i < sale.length; i++)
                {
                    total += sale[i];
                }
              console.log(sales)
            res.render('sales.jade',
            {
                sales:sales,
                total:total,
                carts:carts
            })
        })
    })
    })
    
})
router.get('/today',auth,function(req,res){
    var date = new Date();

    
    var hour = ('0' + date.getHours()).slice(-2);
    var min = ('0' + date.getMinutes()).slice(-2);
    var sec = date.getSeconds();
    var year = date.getFullYear();
    var day = ('0' + date.getDate()).slice(-2);
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    //2019-11-14/04:56
    var timeHistory = year + "-" + month + "-" + day;
    Sales.find({date:timeHistory},function(err,sales){
        
            Sales.find({date:timeHistory}).distinct('price',function(err,sale){
                Cart.find({}, function (err, carts) {
                console.log(sale)
                
                var total = 0;
                for (var i = 0; i < sale.length; i++)
                {
                    total += sale[i];
                }
               
                res.render('sales.jade',
                {
                    sales:sales,
                    total:total,
                    carts:carts
                })
            })
        })
       
    })

})
router.get('/cart',auth, function (req, res) {

    Cart.find({userID:req.user.id}, function (err, carts) {
        Cart.find({userID:req.user.id}).distinct('price2', function (err, cartis) {
            var total = eval(cartis.join('+'))
            res.render('cart.jade', {
                carts: carts,
                total: total
            })
        })

    })
})
router.post('/search',auth,function(req,res){
    var to = req.body.to;
    var from = req.body.from;
    Sales.find({created_on: {
        $gte: new Date(from),
        $lt: new Date(to)
    }},function(err,sales){
        
            Sales.find({created_on: {
                $gte: new Date(from),
                $lt: new Date(to)
            }}).distinct('price',function(err,sale){
                Cart.find({}, function (err, carts) {
                console.log(sale)
                var total = 0;
                for (var i = 0; i < sale.length; i++)
                {
                    total += sale[i];
                }
                
                res.render('sales.jade',
                {
                    sales:sales,
                    total:total,
                    carts:carts
                })
            })
        })
       
    })
})
router.get('/confirmCart',auth, function (req, res) {
    var date = new Date();

    
    var hour = ('0' + date.getHours()).slice(-2);
    var min = ('0' + date.getMinutes()).slice(-2);
    var sec = date.getSeconds();
    var year = date.getFullYear();
    var day = ('0' + date.getDate()).slice(-2);
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    //2019-11-14/04:56
    var timeHistory = year + "-" + month + "-" + day;
    var cartCursor = Cart.find({}).cursor();
    cartCursor.on('data', function (doc) {
        var data = new Sales();
        data.name = doc.name;
        data.quantity = doc.unit;
        data.price = doc.price2;
        data.created_on = new Date()
        data.date = timeHistory;
        data.save(function (err) {
            Product.findById(doc.productID,function(err,product){
                var query = {
                    _id: doc.productID
                }
                const quantity = product.quantityIssued + doc.unit;
                const data2 = {};
                data2.cart = false;
                data2.quantityIssued = parseFloat(quantity);
                data2.balance=product.quantityReceived-quantity;
                Product.update(query,data2,function(err){
                  Cart.findByIdAndRemove(doc.id,function(err){
                      console.log('Success')
                  })
                })
            })
          

           
        })

    })
    res.redirect('/sales')
})
router.post('/addproducts',auth, function (req, res) {
    var data = new Product();
    data.name = req.body.name;
    data.quantityReceived = req.body.quantity;
    data.quantityIssued = 0;
    data.balance =0;
    data.price = req.body.price;
    data.date = req.body.date;
    data.created_on = new Date();
    data.cart = false;
    data.save(function (err) {
        res.redirect('/addproducts');
    });
})
router.get("/addCart/:id",auth, function (req, res) {
    Product.findById(req.params.id, function (err, product) {
        var data = new Cart();
        data.name = product.name;
        data.quantity = product.quantity;
        data.price = product.price;
        data.productID = req.params.id
        data.price2 = product.price;
        data.userID = req.user.id
        data.unit = 1;
        data.save(function (err) {
            var query = {
                _id: req.params.id
            }
            var data2 = {};
            data2.cart = true;
            Product.update(query, data2, function (err) {
                res.redirect('/inventory')
            })

        })


    })
})
router.get('/removeCart/:id',auth, function (req, res) {
    Cart.findOneAndRemove({ productID: req.params.id }, function (err) {
        var query = {
            _id: req.params.id
        }
        var data = {};
        data.cart = false;
        Product.update(query, data, function (err) {
            res.redirect('/inventory')
        })
    })

});
router.post('/onChange/:id',auth, function (req, res) {
    Cart.findById(req.params.id, function (err, cart) {
        var query = {
            _id: req.params.id
        };
        var data = {};

        var price = cart.price * req.body.value;
        data.unit = parseFloat(req.body.value);
        data.price2 = parseFloat(price);
        Cart.update(query, data, function (err) {
            res.redirect('/cart')
        })





    })


})
router.get('/deleteItem/:id',auth, function (req, res) {

    Cart.findById(req.params.id, function (err, cart) {
        var query = {
            _id: cart.productID
        }
        var data = {};
        data.cart = false;
        Product.update(query, data, function (err) {
            Cart.findByIdAndRemove(req.params.id, function (err) {
                res.redirect('/cart')
            })

        })


    })
})
router.get('/deleteItem2/:id',auth,function(req,res){
    Product.findByIdAndRemove(req.params.id,function(err){
        res.redirect('/inventory')
    })
})
router.post('/admin-login',
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/',
        failureFlash: true,
        session: true

    })
);
router.get('/logout', function (req, res) {
    req.logout();
   
    res.redirect('/')
});
module.exports = router;