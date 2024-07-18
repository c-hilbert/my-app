// const { updateAllDosagesAvailable, updateAllDosagesUnavailable, updateSpecificDosageToNo } = require('../models/pharmacyModel');
// const db = require('../config/db');

// async function updateTestData(placeId, medicationId, available, moreInfoNeeded) {
//   await db.execute(`
//     UPDATE pharmacy_medications 
//     SET available = ?, more_info_needed = ?
//     WHERE place_id = ? AND medication_id = ?
//   `, [available, moreInfoNeeded, placeId, medicationId]);
// }

// async function testUpdateAllDosagesAvailable() {
//   // Update test data
//   await updateTestData('pharmacy_1', 1, null, 1);
//   await updateTestData('pharmacy_1', 2, null, 1);
//   await updateTestData('pharmacy_1', 3, null, 1);
//   await updateTestData('pharmacy_1', 4, null, 1);

//   // Call the function to test
//   await updateAllDosagesAvailable('pharmacy_1', 'Adderall');

//   // Fetch the updated rows
//   const [rows] = await db.execute(`
//     SELECT m.type, m.dosage, pm.available, pm.last_inquired 
//     FROM pharmacy_medications pm 
//     JOIN medications m ON pm.medication_id = m.id 
//     WHERE pm.place_id = ? AND m.type = ?
//   `, ['pharmacy_1', 'Adderall']);

//   console.log('After updating all dosages to "yes":', rows);
// }

// async function testUpdateAllDosagesUnavailable() {
//   // Update test data
//   await updateTestData('pharmacy_1', 1, 1, 0);
//   await updateTestData('pharmacy_1', 2, 1, 0);
//   await updateTestData('pharmacy_1', 3, 1, 0);
//   await updateTestData('pharmacy_1', 4, 1, 0);

//   // Call the function to test
//   await updateAllDosagesUnavailable('pharmacy_1', 'Adderall');

//   // Fetch the updated rows
//   const [rows] = await db.execute(`
//     SELECT m.type, m.dosage, pm.available, pm.last_inquired 
//     FROM pharmacy_medications pm 
//     JOIN medications m ON pm.medication_id = m.id 
//     WHERE pm.place_id = ? AND m.type = ?
//   `, ['pharmacy_1', 'Adderall']);

//   console.log('After updating all dosages to "no":', rows);
// }

// async function testUpdateSpecificDosageToNo() {
//   // Update test data
//   await updateTestData('pharmacy_1', 1, 1, 0);
//   await updateTestData('pharmacy_1', 2, 1, 0);
//   await updateTestData('pharmacy_1', 3, 1, 0);
//   await updateTestData('pharmacy_1', 4, 1, 0);

//   // Call the function to test
//   await updateSpecificDosageToNo('pharmacy_1', 'Adderall', '10mg IR');

//   // Fetch the updated rows
//   const [rows] = await db.execute(`
//     SELECT m.type, m.dosage, pm.available, pm.last_inquired 
//     FROM pharmacy_medications pm 
//     JOIN medications m ON pm.medication_id = m.id 
//     WHERE pm.place_id = ? AND m.type = ?
//   `, ['pharmacy_1', 'Adderall']);

//   console.log('After updating specific dosage to "no":', rows);
// }

// async function runTests() {
//   try {
//     await testUpdateAllDosagesAvailable();
//     await testUpdateAllDosagesUnavailable();
//     await testUpdateSpecificDosageToNo();
//   } catch (error) {
//     console.error('Error testing update functions:', error);
//   } finally {
//     await db.end();
//   }
// }

// runTests();

