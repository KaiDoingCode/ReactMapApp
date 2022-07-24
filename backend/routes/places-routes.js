const express = require('express');
const {check} = require('express-validator');

const router = express.Router();

const HttpError = require('../models/http-error.js');
const checkAuth = require('../middleware/check-auth.js');

const placesControllers = require('../controllers/places-controllers.js');
const fileUpload = require('../middleware/file-upload.js');

router.get('/user/:uId', placesControllers.getPlacesByUserId);

router.get('/:pId', placesControllers.getPlaceById);

router.use(checkAuth);

router.post('/', 
  fileUpload.single('image'),
  [check('title').not().isEmpty(),
  check('description').isLength({min: 5}),
  check('address').not().isEmpty()
  ]
  ,placesControllers.createPlace
);

router.patch('/:pId', 
  [check('title').not().isEmpty(),
  check('description').isLength({min: 5}),
  ]
,placesControllers.updatePlace);

router.delete('/:pId', placesControllers.deletePlace);

module.exports = router;