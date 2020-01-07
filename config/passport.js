var LocalStrategy = require('passport-local').Strategy;
//userSchema
var passport = require('passport');
var User = require('../models/user.js');
//database route

var config = require('../config/keys.js');
//bcryptjs

var bcrypt = require('bcryptjs');

module.exports = function (passport) {

    //local strategy
    passport.use(new LocalStrategy(function (username, password, done) {
        //match Username
        let query = {
            username: username
        };
        User.findOne(query, function (err, user) {
            if (err)
                throw err;
            if (!user) {
                return done(null, false, {
                    message: 'No User Found'
                });
            }
            //Match Password
            bcrypt.compare(password, user.password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {
                        message: 'Wrong Password'
                    });
                }
            });
        });

    }));
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
}
