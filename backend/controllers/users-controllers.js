const express = require('express');
const {validationResult} = require('express-validator');
const bcrypt= require('bcryptjs');
const jwt = require('jsonwebtoken');

const { v4: uuidv4 } = require('uuid');

const HttpError = require('../models/http-error.js');
const User = require('../models/user.js');

const getUsers = async (req,res,next) => {
    const users = await User.find({}, '-password').exec();
    return res.json({users: users.map(user => user.toObject({getters: true}))});

};

const signup = async (req,res,next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return next(new HttpError('Inputs are invalid', 422));
    }

    const {name, email, password} = req.body;
    try{
        const existingUser = await User.findOne({email: email});

        if(existingUser){
            return next(new HttpError('Email already existed', 402));
        }
        let hashedPassword;
        try{
            hashedPassword = await bcrypt.hash(password, 12);
        } catch(err){
            const error = new HttpError('Could not create user.', 500);

            return next(error);
        }
        
        const createdUser = new User({
            name,
            email,
            password: hashedPassword,
            image: req.file.path,
            places: []
        });

        await createdUser.save();

        console.log(createdUser);
        console.log(createdUser.id);
        let token;
        try {   
            token = jwt.sign(
                { userId: createdUser.id, email: createdUser.email },
                process.env.JWT_KEY,
                { expiresIn: '1h' }
            );
        }catch(err){    
            return next(new HttpError('Server is going through some problem. Please sign up again', 500));
        }
        
        // return res.status(201).json({user: createdUser.toObject({getters: true})});
        return res.status(201).json({userId: createdUser.id, email: createdUser.email, token: token});

    } catch(err){
        return next(new HttpError('Some Error occured', 402));
    }
};

const login = async(req,res,next) => {
    // const errors = validationResult(req);

    // if(!errors.isEmpty()){
    //     throw new HttpError('Inputs are invalid', 422);
    // }

    const {email, password} = req.body;

    const existingUser = await User.findOne({email: email});



    if(!existingUser){
        return next(new HttpError('Can not find user with that email', 403));
    }

    let isValidPassword = false;

    try{    
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch(err){
        return next(new HttpError(
            'The server is going through some trouble. Please log in again', 500
        ));
    }
    

    if(!isValidPassword){
        return next(new HttpError('Password is wrong. Please re-enter the password', 403));
    }

    console.log(existingUser);
    console.log(existingUser._id);
    console.log(existingUser.id);

    let token;
    try {   
        token = jwt.sign({userId: existingUser.id, email: existingUser.email}, 'supersecret_dont_share', { expiresIn: '1h' });
    }catch(err){    
        return next(new HttpError('Server is going through some problem. Please login again', 500));
    }

    // return res.status(200).json({message: 'Logged In', user: existingUser.toObject({getters: true})});    
    return res.status(200).json({userId: existingUser.id, email: email, token: token});


};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;