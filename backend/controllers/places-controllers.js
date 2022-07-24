const { v4: uuidv4 } = require('uuid');
const express = require('express');
const {validationResult} = require('express-validator');
const mongoose = require('mongoose');
const fs = require('fs');

const Place = require('../models/place.js');
const User = require('../models/user.js');
const fileUpload = require('../middleware/file-upload.js');


const HttpError = require('../models/http-error.js');
const getCoordsForAddress = require('../util/location.js');

// let DUMMY_PLACES = [
//     {
//       id: 'p1',
//       title: 'Empire State Building',
//       description: 'One of the most famous sky scrapers in the world!',
//       imageUrl:
//         'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
//       address: '20 W 34th St, New York, NY 10001',
//       location: {
//         lat: 40.7484405,
//         lng: -73.9878584
//       },
//       creator: 'u1'
//     },
//     {
//       id: 'p2',
//       title: 'Empire State Building',
//       description: 'One of the most famous sky scrapers in the world!',
//       imageUrl:
//         'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
//       address: '20 W 34th St, New York, NY 10001',
//       location: {
//         lat: 40.7484405,
//         lng: -73.9878584
//       },
//       creator: 'u2'
//     }
// ];

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pId;
    let place;
    try{
        place = await Place.findById(placeId).exec();
    }
    catch(err){
        const error = new HttpError('Could not find a place',404);
        throw error;
    } 
    
    if(!place){
        const error = new HttpError('Could not find a place',404);
        throw error;
    }

    return res.json({place});
    
};

const getPlacesByUserId = async (req,res,next)=> {
    const userId = req.params.uId;

    let userWithPlaces;
    //let places
    try{
        //places = await Place.find({creator: userId}).exec();
        userWithPlaces = await User.findById(userId).populate('places').exec()
    } catch(err){
        const error = new HttpError('Could not find a place',404);
        return next(error);
    } 

    if(!userWithPlaces || userWithPlaces.places.length === 0){
        const error = new HttpError('Could not find a place for the provided user id.',404);
        return next(error);
    }

    return res.status(200).json({places: userWithPlaces.places.map(place => place.toObject({getters: true}) )});
    // return res.status(200).json({places});
    
    
    
};

const createPlace = async (req,res,next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        next(new HttpError('Inputs are invalid', 422));
    }
    const { title, description, address, creator} = req.body;
    let coordinates;
    try{
        coordinates = await getCoordsForAddress(address);
    }
    catch(error){
        return next(new HttpError(
            'Map API is temporarily down due to limited usage. This might take 24 hours to restart limit due to Google policy. Please use other functions in the meantime. Thank you',
            500
        ));
    }

    
    //const title = req.body.title;
    const createdPlace = new Place({
        title,
        description: description, 
        location: coordinates,
        address: address, 
        image: req.file.path,
        creator: req.userData.userId
    });

    
    let user;

    try{
        console.log(req.userData.userId);
        console.log(creator);
        user = await User.findById(req.userData.userId);

        if(!user){
            console.log(user);
            return next(new HttpError('Can not find user', 404));
        }

        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({session: sess});
        user.places.push(createdPlace);
        await user.save({session: sess});
        await sess.commitTransaction();
        
    } catch(error){
        return next(new HttpError(
            'Creating place failed, please try again.',
            500
        ));
    }
        
    try{
        await createdPlace.save();
    } catch(err) {
        const error = new HttpError(
            'Creating place failed, please try again.',
            500
          );
        return next(error);
    }

    return res.status(201).json({place: createdPlace});
}

const updatePlace = async (req,res,next) => {
    const placeId = req.params.pId;
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        throw new HttpError('Inputs are invalid', 422);
    }

    const { title, description } = req.body;
    // const updatePlace = DUMMY_PLACES.find(p => {
    //     return p.creator === userId;
    // });
    // if(!updatePlace){
    //     const error = new Error('Could not find a place for the provided user id.',404);
    //     return next(error);
    // }

    // updatePlace.title = title;
    // updatePlace.description = description;
    // DUMMY_PLACES[placeId] = updatePlace;
    // return res.status(201).json({DUMMY_PLACES: DUMMY_PLACES, place: updatePlace});

    // const updatePlace = {...DUMMY_PLACES.find(p=> p.id === placeId)};
    // const placeIndex = DUMMY_PLACES.findIndex(p=> p.id === placeId);
    // updatePlace.title = title;
    // updatePlace.description = description;
    // DUMMY_PLACES[placeIndex] = updatePlace;
    let place;

    
    
    try{
        place = await Place.findById(placeId).exec();
        
    } catch(err){
        const error = new HttpError('Can not update the place', 500);
        return next(error);
    }

    console.log(place.creator);
    console.log(place.creator.toString());

    if (place.creator.toString() !== req.userData.userId) {
        const error = new HttpError(
          'You are not allowed to edit this place.',
          401
        );
        return next(error);
    }

    place.title = title;
    place.description = description;

    try {
    await place.save();
    } catch (err) {
    const error = new HttpError(
        'Something went wrong, could not update place.',
        500
    );
    return next(error);
    }
    
    
    return res.status(200).json({place: place.toObject({getters: true})});

};

const deletePlace = async (req,res,next) => {
    const placeId = req.params.pId;
    let place;
    

    try{
        place = await Place.findById(placeId).populate('creator').exec();
        console.log(place);
        
        if(!place){
            return next(new HttpError('Can not find the place with the id', 404));
        }

        if (place.creator.id !== req.userData.userId) {
            const error = new HttpError(
              'You are not allowed to delete this place.',
              401
            );
            return next(error);
        }

        const imagePath = place.image;
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.remove({session: sess});
        place.creator.places.pull(place);
        await place.creator.save({session: sess});
        await sess.commitTransaction();
        fs.unlink(imagePath, err => {
            console.log(err);
        });

    } catch(err){
        const error = new HttpError('Can not delete the place', 500);
        return next(error);
    }

    

    return res.status(200).json({message: 'Delete the place'});
}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;

 