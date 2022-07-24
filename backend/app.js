const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routes.js');
const usersRoutes = require('./routes/users-routes.js');

const HttpError = require('./models/http-error.js');

const app = express();

app.use(bodyParser.json()); //bodyParser.urlencoded({})

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  return next();
});

app.use('/api/places', placesRoutes); // => /api/places/...

app.use('/api/users', usersRoutes);

app.use((req,res,next) => {
    const error = new HttpError('Could not find the routes', 404);
    throw error;

});

app.use((error, req, res, next)=> {
  if(req.file){
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if(res.headerSent){
      return next(error);
  }
  res.status(error.code || 500).json({message: error.message || 'An unknown error occured'});
  return next();
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.gnog7.mongodb.net/${process.env.DB_NAME}?retryWrites=true`
    
  )
  .then(() => {
    app.listen(5000);
    
  })
  .catch(err => console.log(err));