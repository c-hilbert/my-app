const db = require('../config/db');

exports.getMedicationAvailabilityByPharmacyId = async (placeId, medication) => {
  const [rows] = await db.execute(`
    SELECT m.type, m.dosage, pm.available, pm.last_inquired
    FROM pharmacy_medications pm
    JOIN medications m ON pm.medication_id = m.id
    WHERE pm.place_id = ? AND m.type = ?
  `, [placeId, medication]);

  return rows.length ? rows : undefined;
};

// Case 1: Update every single dosage of the same type at that pharmacy to "yes"
exports.updateAllDosagesAvailable = async (placeId, medication) => {
  await db.execute(`
    UPDATE pharmacy_medications pm
    JOIN medications m ON pm.medication_id = m.id
    SET pm.available = 1, pm.more_info_needed = 0
    WHERE pm.place_id = ? AND m.type = ?
  `, [placeId, medication]);
};

// Case 2: Update every single dosage of the same type at that pharmacy to "no"
exports.updateAllDosagesUnavailable = async (placeId, medication) => {
  await db.execute(`
    UPDATE pharmacy_medications pm
    JOIN medications m ON pm.medication_id = m.id
    SET pm.available = 0, pm.more_info_needed = 0
    WHERE pm.place_id = ? AND m.type = ?
  `, [placeId, medication]);
};

// Function to update one specific dosage to "no" and all other dosages of that medication type to "unknown" for a given pharmacy
exports.updateSpecificDosageToNo = async (placeId, medication, dosage) => {
  // Update the specific dosage to "no"
  await db.execute(`
    UPDATE pharmacy_medications pm
    JOIN medications m ON pm.medication_id = m.id
    SET pm.available = 0, pm.more_info_needed = 0
    WHERE pm.place_id = ? AND m.type = ? AND m.dosage = ?
  `, [placeId, medication, dosage]);
    
  // Update all other dosages of the same medication type to "unknown"
  await db.execute(`
    UPDATE pharmacy_medications pm
    JOIN medications m ON pm.medication_id = m.id
    SET pm.available = NULL, pm.more_info_needed = 1
    WHERE pm.place_id = ? AND m.type = ? AND m.dosage != ?
  `, [placeId, medication, dosage]);
};

exports.recordCall = async (placeId, medication, transcript, availabilityResult) => {
  try {
    await db.execute(`
      INSERT INTO calls (place_id, medication_id, available, more_info_needed, transcript) 
      VALUES (?, ?, ?, ?, ?)
    `, [placeId, medication, availabilityResult.available, availabilityResult.more_info_needed, transcript]);
  } catch (error) {
    throw error;
  }
};

exports.insertOrUpdatePharmacy = async (details) => {
  console.log('Inserting or updating pharmacy details:', details); // Log the details
  await db.execute(`
    INSERT INTO pharmacies (place_id, name, address, phone_number)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      address = VALUES(address),
      phone_number = VALUES(phone_number)
  `, [details.place_id, details.name, details.formatted_address, details.formatted_phone_number]);
};
