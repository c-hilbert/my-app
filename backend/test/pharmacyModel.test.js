/* eslint-env jest */

const db = require('../config/db');
const pharmacyModel = require('../models/pharmacyModel');

const TEST_PREFIX = 'TESTDATA_';
const TEST_PLACE_ID = `${TEST_PREFIX}place_id`;
const TEST_MEDICATION_ID = 999999;
const INVALID_PLACE_ID = `${TEST_PREFIX}invalid_place_id`;
const INVALID_MEDICATION_TYPE = 'Invalid Medication';


describe('pharmacyModel', () => {
  beforeAll(async () => {
    // Set up test data
    await db.execute(`
      INSERT IGNORE INTO pharmacies (place_id, name, address, phone_number)
      VALUES (?, 'Test Pharmacy', 'Test Address', '1234567890')
    `, [TEST_PLACE_ID]);

    await db.execute(`
      INSERT IGNORE INTO medications (id, type, dosage)
      VALUES (?, 'Test Medication', 'Test Dosage')
    `, [TEST_MEDICATION_ID]);
  });

  beforeEach(async () => {
    // Clear existing test data and insert fresh test records
    await db.execute('DELETE FROM pharmacy_medications WHERE place_id = ?', [TEST_PLACE_ID]);
    await db.execute(
      'INSERT INTO pharmacy_medications (place_id, medication_id, available) VALUES (?, ?, ?)',
      [TEST_PLACE_ID, TEST_MEDICATION_ID, 1]
    );
  });

  afterAll(async () => {
    // Clean up all test data
    await db.execute('DELETE FROM pharmacy_medications WHERE place_id = ?', [TEST_PLACE_ID]);
    await db.execute('DELETE FROM pharmacies WHERE place_id = ?', [TEST_PLACE_ID]);
    await db.execute('DELETE FROM medications WHERE id = ?', [TEST_MEDICATION_ID]);
    await db.end();
  });

  test('getMedicationAvailabilityByPharmacyId returns medication details', async () => {
    const result = await pharmacyModel.getMedicationAvailabilityByPharmacyId(TEST_PLACE_ID, 'Test Medication');
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('type', 'Test Medication');
    expect(result[0]).toHaveProperty('available', 1);
  });

  test('getMedicationAvailabilityByPharmacyId should return undefined for an invalid pharmacyId or medication type', async () => {
    // Test with invalid pharmacy ID
    let result = await pharmacyModel.getMedicationAvailabilityByPharmacyId(INVALID_PLACE_ID, 'Test Medication');
    expect(result).toBeUndefined();
  
    // Test with invalid medication type
    result = await pharmacyModel.getMedicationAvailabilityByPharmacyId(TEST_PLACE_ID, INVALID_MEDICATION_TYPE);
    expect(result).toBeUndefined();
  });

  test('updateLastCalledTimestamp updates the timestamp', async () => {
    await pharmacyModel.updateLastCalledTimestamp(TEST_PLACE_ID, TEST_MEDICATION_ID);
    const [rows] = await db.execute(
      'SELECT last_called FROM pharmacy_medications WHERE place_id = ? AND medication_id = ?',
      [TEST_PLACE_ID, TEST_MEDICATION_ID]
    );
    expect(rows.length).toBe(1);
    expect(rows[0].last_called).not.toBeNull();
    const timeDiff = new Date() - new Date(rows[0].last_called);
    expect(timeDiff).toBeLessThan(1000); // Should be updated within the last second
  });


});
