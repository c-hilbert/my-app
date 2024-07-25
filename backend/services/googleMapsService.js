const axios = require('axios');
const { formatPhoneNumber } = require('../utils/phoneFormatter');


const googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_MAPS_API_KEY,
  Promise: Promise,
});

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

async function getCoordinates(address) {
  console.log("Google Maps API Key:", process.env.GOOGLE_MAPS_API_KEY); // Temporary log statement

  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;
  const response = await axios.get(geocodeUrl);

  if (response.data.status !== 'OK') {
    throw new Error(`Geocoding failed: ${response.data.status}`);
  }

  const { lat, lng } = response.data.results[0].geometry.location;
  return { lat, lng };
}

const getNearbyPharmacies = async (location) => {
  const { lat, lng } = await getCoordinates(location);
  console.log(`Coordinates for ${location}: ${lat}, ${lng}`); // Add this line for debugging


  try {
    const response = await googleMapsClient.placesNearby({
      location: [lat, lng],
      rankby: 'distance',
      type: 'pharmacy',
    }).asPromise();

    //console.log('Nearby pharmacies response:', response.json.results);
    return response.json.results;
  } catch (error) {
    console.error('Error fetching nearby pharmacies:', error);
    throw new Error('Failed to fetch nearby pharmacies');
  }
};

const getPharmacyDetails = async (placeId) => {
  try {


    const response = await googleMapsClient.place({
      placeid: placeId,
      fields: ['name', 'formatted_phone_number', 'formatted_address', 'place_id'],
    }).asPromise();

    const result = response.json.result;
  // Format the phone number
  if (result.formatted_phone_number) {
    result.formatted_phone_number = formatPhoneNumber(result.formatted_phone_number);
  }
    //console.log('Pharmacy details response:', response.json.result);
    return result;
  } catch (error) {
    console.error('Error fetching pharmacy details:', error);
    throw new Error('Failed to fetch pharmacy details');
  }
};

const getUniquePharmaciesWithDetails = async (location) => {
  const nearbyPharmacies = await getNearbyPharmacies(location);

  const uniquePharmacies = [];
  const seenAddresses = new Set();

  for (const pharmacy of nearbyPharmacies) {
    if (!seenAddresses.has(pharmacy.vicinity)) {
      seenAddresses.add(pharmacy.vicinity);
      uniquePharmacies.push(pharmacy);
    }
  }

  const detailPromises = uniquePharmacies.map(pharmacy =>
    getPharmacyDetails(pharmacy.place_id)
  );

  const pharmacyDetails = await Promise.all(detailPromises);
 // console.log("pharmacyDetails", pharmacyDetails);
  return pharmacyDetails;
};

module.exports = {
  getNearbyPharmacies,
  getPharmacyDetails,
  getUniquePharmaciesWithDetails,
  getCoordinates
};
