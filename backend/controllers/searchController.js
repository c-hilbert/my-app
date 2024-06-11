const googleMapsService = require('../services/googleMapsService');
const pharmacyModel = require('../models/pharmacyModel');

exports.findNearbyPharmacies = async (req, res) => {
  const { location, medication, dosage } = req.body;
  try {
    console.log('Calling findNearbyPharmacies with location:', location);
    const pharmacies = await googleMapsService.getUniquePharmaciesWithDetails(location);
    console.log('Found pharmacies:', pharmacies);

    // Insert or update each pharmacy in the database
    for (const pharmacy of pharmacies) {
      await pharmacyModel.insertOrUpdatePharmacy(pharmacy);
    }

    const result = await this.checkMedicationAvailability(pharmacies, medication, dosage);

    res.json(result);
  } catch (error) {
    console.error('Error in findNearbyPharmacies:', error);
    res.status(500).send('Error fetching nearby pharmacies');
  }
};

// //const pharmacyModel = require('../models/pharmacyModel');
// exports.checkMedicationAvailability = async (pharmacies, medicationType, medicationDosage) => {
//   const pharmacyStatuses = [];

//   for (const pharmacy of pharmacies) {
//     const pharmacyDetails = await pharmacyModel.getMedicationAvailabilityByPharmacyId(pharmacy.place_id, medicationType);

//     let status = 'Unknown';
//     if (pharmacyDetails) {
//       const specificMedication = pharmacyDetails.find(
//         detail => detail.dosage === medicationDosage
//       );

//       if (specificMedication) {
//         if (specificMedication.available === 'Yes') {
//           // If medication is available, return immediately
//           return { status: 'Medication Available', pharmacy: {
//             id: pharmacy.place_id,
//             name: pharmacy.name,
//             address: pharmacy.vicinity,
//             phoneNumber: pharmacy.phoneNumber, // Assuming phone number is available
//             medications: pharmacyDetails,
//             status: 'Available'
//           }};
//         } else {
//           status = 'No';
//         }
//       }
//     }

//     // Push the pharmacy details into the array
//     pharmacyStatuses.push({
//       id: pharmacy.place_id,
//       name: pharmacy.name,
//       address: pharmacy.vicinity,
//       phoneNumber: pharmacy.phoneNumber, // Assuming phone number is available
//       medications: pharmacyDetails,
//       status
//     });
//   }

//   // If no pharmacy has the medication available, check if all are 'No'
//   const allNo = pharmacyStatuses.every(p => p.status === 'No');
//   if (allNo) {
//     return { status: 'No Medication Available', pharmacies: pharmacyStatuses };
//   }

//   // If there are mixed statuses, return 'Unknown' with all pharmacies
//   return { status: 'Unknown', pharmacies: pharmacyStatuses };
// };
//helper function 


exports.checkMedicationAvailability = async (pharmacies, medicationType, medicationDosage) => {
  let allNo = true;
  const pharmacyStatuses = [];
  
  for (const pharmacy of pharmacies) {
    const pharmacyDetails = await pharmacyModel.getMedicationAvailabilityByPharmacyId(pharmacy.place_id, medicationType);
    //console.log(`Pharmacy: ${pharmacy.place_id}, Details: ${JSON.stringify(pharmacyDetails)}`);

    if (pharmacyDetails) {
      const specificMedication = pharmacyDetails.find(
        detail => detail.dosage === medicationDosage
      );
      // console.log(`Specific Medication: ${JSON.stringify(specificMedication)}`);

  
      if (specificMedication) {
        if (specificMedication.available === 'Yes') {
          return { status: 'Medication Available', pharmacy: pharmacy };
        } else if (specificMedication.available === 'No') {
          allNo = allNo && true;
          pharmacyStatuses.push({ pharmacy: pharmacy, medications: pharmacyDetails, status: 'No' });
        } else {
          allNo = false;
          pharmacyStatuses.push({ pharmacy: pharmacy, medications: pharmacyDetails, status: 'Unknown' });
        }
      } else {
        allNo = false;
        pharmacyStatuses.push({ pharmacy: pharmacy, medications: pharmacyDetails, status: 'Unknown' });
      }
    } else {
      allNo = false;
      pharmacyStatuses.push({ pharmacy: pharmacy, medications: pharmacyDetails, status: 'Unknown' });
    }
  }
  
  if (allNo) {
    console.log('returning this info to frontend: pharmacies:', JSON.stringify(pharmacyStatuses));
    return { status: 'No Medication Available', pharmacies: pharmacyStatuses };
  } else {
    console.log('returning this info to frontend: pharmacies:', JSON.stringify(pharmacyStatuses));
    return { status: 'Unknown', pharmacies: pharmacyStatuses };
  }
};

