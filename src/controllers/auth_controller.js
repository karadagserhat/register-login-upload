const {validationResult} = require('express-validator');
const User = require('../model/user_model');
const passport = require('passport');
require('../config/passport_local')(passport);
const bcrypt = require('bcrypt');

const loginFormunuGoster = (req, res, next) => {
    res.render('login', {layout: './layout/auth_layout.ejs', title: 'Giriş Yap'});
};

const login = (req, res, next) => {

    const hatalar = validationResult(req);

    req.flash('email',req.body.email);
    req.flash('sifre',req.body.sifre);
    if(!hatalar.isEmpty()){

        req.flash('validation_error', hatalar.array());
      

        res.redirect('/login');
        //res.render('register', {layout: './layout/auth_layout.ejs', hatalar: hatalar.array()});
    }else {
        passport.authenticate('local',
        { successRedirect: '/yonetim',
        failureRedirect: '/login',
        badRequestMessage: 'Hatalı Giriş',
        failureFlash: true 
       })(req,res,next);
    }
};

const registerFormunuGoster = (req, res, next) => {
    res.render('register', {layout: './layout/auth_layout.ejs',title:'Kayıt Ol'});
};

const register = async (req, res, next) => {

    const hatalar = validationResult(req);
    if(!hatalar.isEmpty()){

        req.flash('validation_error', hatalar.array());
        req.flash('email', req.body.email);
        req.flash('ad', req.body.ad);
        req.flash('soyad', req.body.soyad);
        req.flash('sifre', req.body.sifre);
        req.flash('resifre', req.body.resifre);
        res.redirect('/register');
        //res.render('register', {layout: './layout/auth_layout.ejs', hatalar: hatalar.array()});
    } else {

        try {
            const _user = await User.findOne({email:req.body.email});

            if(_user){
                req.flash('validation_error',[{msg : "Bu mail kullanılıyor"}]);
                req.flash('email', req.body.email);
                req.flash('ad', req.body.ad);
                req.flash('soyad', req.body.soyad);
                req.flash('sifre', req.body.sifre);
                req.flash('resifre', req.body.resifre);
                res.redirect('/register');
            } else{

                const newUser = new User({
                    email: req.body.email,
                    ad : req.body.ad,
                    soyad : req.body.soyad,
                    sifre : await bcrypt.hash(req.body.sifre, 10)
                });
                await newUser.save();
                console.log("kullanıcı kaydedildi");

                req.flash('success_message', [{msg : 'Giriş Yapabilirsiniz'}]);

                res.redirect('/login');
            }
        } catch (err) {
            console.log("user kaydedilirken hata çıktı" + err);
        }
    }
};


const logout = (req,res,next) => {
    req.logout();
    req.session.destroy((error) => {
        res.clearCookie('connect.sid');
       // req.flash('success_message', [{msg:'Başarıyla çıkış yapıldı'}])
        res.render('login', {layout: './layout/auth_layout.ejs',title:'Giriş Yap', success_message : [{msg:'Başarıyla çıkış yapıldı'}]});
        //res.redirect('/login');

    });
}

module.exports = {
    loginFormunuGoster,
    registerFormunuGoster,
    register,
    login,
    logout
}