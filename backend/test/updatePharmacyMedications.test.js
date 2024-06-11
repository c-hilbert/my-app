const { updateAllDosagesAvailable, updateAllDosagesUnavailable, updateSpecificDosageToNo } = require('../models/pharmacyModel');
const db = require('../config/db');

async function testUpdateAllDosagesAvailable() {
  // Reset the table for a clean start
  await db.execute(`TRUNCATE TABLE pharmacy_medications`);

  // Insert test data
  await db.execute(`
    INSERT INTO pharmacy_medications (pharmacy_id, medication_id, available, more_info_needed) 
    VALUES 
    ('pharmacy_1', 1, NULL, 1),
    ('pharmacy_1', 2, NULL, 1),
    ('pharmacy_1', 3, NULL, 1),
    ('pharmacy_1', 4, NULL, 1)
  `);

  // Call the function to test
  await updateAllDosagesAvailable('pharmacy_1', 'Adderall');

  // Fetch the updated rows
  const [rows] = await db.execute(`
    SELECT m.type, m.dosage, pm.available, pm.last_inquired 
    FROM pharmacy_medications pm 
    JOIN medications m ON pm.medication_id = m.id 
    WHERE pm.pharmacy_id = ? AND m.type = ?
  `, ['pharmacy_1', 'Adderall']);

  console.log('After updating all dosages to "yes":', rows);
}

async function testUpdateAllDosagesUnavailable() {
  // Call the function to test
  await updateAllDosagesUnavailable('pharmacy_1', 'Adderall');

  // Fetch the updated rows
  const [rows] = await db.execute(`
    SELECT m.type, m.dosage, pm.available, pm.last_inquired 
    FROM pharmacy_medications pm 
    JOIN medications m ON pm.medication_id = m.id 
    WHERE pm.pharmacy_id = ? AND m.type = ?
  `, ['pharmacy_1', 'Adderall']);

  console.log('After updating all dosages to "no":', rows);
}

async function testUpdateSpecificDosageToNo() {
  // Call the function to test
  await updateSpecificDosageToNo('pharmacy_1', 'Adderall', '10mg IR');

  // Fetch the updated rows
  const [rows] = await db.execute(`
    SELECT m.type, m.dosage, pm.available, pm.last_inquired 
    FROM pharmacy_medications pm 
    JOIN medications m ON pm.medication_id = m.id 
    WHERE pm.pharmacy_id = ? AND m.type = ?
  `, ['pharmacy_1', 'Adderall']);

  console.log('After updating specific dosage to "no":', rows);
}

async function runTests() {
  try {
    await testUpdateAllDosagesAvailable();
    await testUpdateAllDosagesUnavailable();
    await testUpdateSpecificDosageToNo();
  } catch (error) {
    console.error('Error testing update functions:', error);
  } finally {
    await db.end();
  }
}

runTests();
