const axios = require('axios');

const HttpError = require('../models/http-error');

const API_KEYS = process.env.GOOGLE_API_KEY;

// const  getCoordsForAddress = async (address) => {

// }

async function getCoordsForAddress(address){
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEYS}`)

    const data = response.data;

    if(!data || data.status === 'ZERO_RESULTS'){
        throw new HttpError('Can not find coordinates for that address', 404);
    }
    console.log(data);
    const coordinates = data.results[0].geometry.location;

    return coordinates;
}

module.exports = getCoordsForAddress;