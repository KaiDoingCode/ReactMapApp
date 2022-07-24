const jwt = require('jsonwebtoken');

const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
    
    if(req.method === 'OPTIONS') {
        return next();
    }
    try{
        const token = req.headers.authorization.split(' ')[1]; // Not AUTHORIZATION: TOKEN but instead Authorization: 'Bearer Token'
        console.log(token);
        
        if(!token){
            return next(new HttpError('You need to login or sign up first', 403));
        }

        const decodedToken = jwt.verify(token, process.env.JWT_KEY);
        req.userData = {userId: decodedToken.userId, email: decodedToken.email};
        next();

    }catch(err){
        console.log(err);
        return next(new HttpError('The server is going through some problem. Please try again', 403));
    }

};