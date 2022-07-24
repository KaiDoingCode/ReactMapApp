const express = require('express');
const {check} = require('express-validator');

const router = express.Router();

const HttpError = require('../models/http-error.js');

const usersControllers = require('../controllers/users-controllers.js');
const fileUpload = require('../middleware/file-upload.js');

router.get('/', usersControllers.getUsers );

router.post('/signup', 
    fileUpload.single('image'),
[
    check('name').not().isEmpty(),
    check('email').isEmail(),
    check('password').isLength({min: 6})
]

, usersControllers.signup);

router.post('/login', usersControllers.login);

module.exports = router;