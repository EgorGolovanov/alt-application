var crypto = require('crypto');

module.exports = function(passport, users) {
    var Users = users;
    var LocalStrategy = require('passport-local').Strategy;
    
    //Стратегия авторизации 
    passport.use('login', new LocalStrategy ({
        usernameField : 'username',
        password : 'password',
        passReqToCallback : true
    },
    function(req, username, password, done) {
        Users.findAll({
            attributes: ['id', 'username', 'password', 'avatar_url'],
            where: {
                username: username
            }, 
            raw: true
        })
        .then(res=>{
            if (!res.length) return done(null, false, req.flash('loginMessage', 'No user found!'));

            if (!(res[0].password == crypto.createHash('sha1', 'password').update(password).digest('base64')))
                return done(null, false, req.flash('loginMessage', 'Wrong password!'));
        
            return done(null, res[0]);
        })
        .catch(err=>{
            return done(null, false, req.flash('loginMessage', 'SQL error!'));
        });
    }));

    //Стратегия регистрации
    passport.use('signup', new LocalStrategy ({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, username, password, done) {

        Users.findAll({
            attributes: ['id', 'username'],
            where: {
                username: username
            }, 
            raw: true
        })
        .then(res=>{
            if (res.length) {
                return done(null, false, req.flash('signupMessage', 'That username is already exist'));
            } else {
                let newUser = { 
                    username: username, 
                    password: crypto.createHash('sha1', 'password').update(password).digest('base64') 
                };
                
                Users.create(newUser)
                .then((result)=>{
                    return done(null, result);
                }).catch(error=>{
                    return done(null, false, req.flash('signupMessage', 'SQL error!'));		
                })
            }
        })
        .catch(err=>{
            return done(null, false, req.flash('signupMessage', 'SQL error!'));
        });
    }));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        Users.findOne({
            attributes: ['id', 'username', 'avatar_url'],
            where: {
                id: id
            }
        }).then(user=>{
            if(!user) return;
            done(null, user);
        }).catch(err=>done(err, user));
    });
}