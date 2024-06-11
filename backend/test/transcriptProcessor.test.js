const { processTranscript } = require('../services/transcriptProcessor');
const db = require('../config/db');
require('dotenv').config();

async function setupDatabase() {
    // Clean up existing duplicates
    await db.execute(`
        DELETE pm1 FROM pharmacy_medications pm1
        INNER JOIN pharmacy_medications pm2 
        WHERE 
            pm1.id > pm2.id AND 
            pm1.pharmacy_id = pm2.pharmacy_id AND 
            pm1.medication_id = pm2.medication_id;
    `);

    // Insert or update pharmacies
    await db.execute(`
        INSERT INTO pharmacies (id, name, address, phone_number)
        VALUES ('pharmacy_1', 'Pharmacy 1', '123 Street', '1234567890'),
               ('pharmacy_2', 'Pharmacy 2', '456 Avenue', '0987654321')
        ON DUPLICATE KEY UPDATE
            name = VALUES(name), address = VALUES(address), phone_number = VALUES(phone_number)
    `);

    // Insert or update pharmacy medications
    await db.execute(`
        INSERT INTO pharmacy_medications (pharmacy_id, medication_id, available, more_info_needed)
        VALUES ('pharmacy_1', 1, NULL, NULL),
               ('pharmacy_1', 2, NULL, NULL),
               ('pharmacy_1', 3, NULL, NULL),
               ('pharmacy_1', 4, NULL, NULL),
               ('pharmacy_2', 1, NULL, NULL),
               ('pharmacy_2', 2, NULL, NULL),
               ('pharmacy_2', 3, NULL, NULL),
               ('pharmacy_2', 4, NULL, NULL)
        ON DUPLICATE KEY UPDATE
            available = VALUES(available), more_info_needed = VALUES(more_info_needed)
    `);
}

async function testProcessTranscript() {
    await setupDatabase();

    const testCases = [
        {
            transcript: `assistant: Hi! I was just calling to see if you have adderall in stock?
                         system: callSid: CA4ed37382b1bfaa241c6668ce1db55ba4
                         user:  Hello?
                         assistant: Hi there! I wanted to check if you have Adderall in stock before I have my doctor send over a prescription. Can you help me with that?
                         user:  Yeah. We do have that in stock.
                         assistant: Awesome, thanks so much for checking on that! Have a great day! Bye!`,
            originalDose: '10mg IR',
            pharmacyId: 'pharmacy_1',
            medicationType: 'Adderall',
            expected: { available: true, more_info_needed: false }
        },
        {
            transcript: `assistant: Hi! I was just calling to see if you have adderall in stock?
                         system: callSid: CA4ed37382b1bfaa241c6668ce1db55ba4
                         user:  Hello?
                         assistant: Hi there! I wanted to check if you have Adderall in stock before I have my doctor send over a prescription. Can you help me with that?
                         user:  No, we don't have that in stock.
                         assistant: Okay, thanks for letting me know. Bye!`,
            originalDose: '20mg XR',
            pharmacyId: 'pharmacy_2',
            medicationType: 'Adderall',
            expected: { available: false, more_info_needed: false }
        },
        // Add more test cases as needed
    ];

    for (const testCase of testCases) {
        const { transcript, originalDose, pharmacyId, medicationType, expected } = testCase;

        try {
            const result = await processTranscript(transcript, originalDose, pharmacyId, medicationType);
            console.log('Processed Transcript Result from test:', result);

            // Query the database to check if the updates were made
            const [rows] = await db.execute(`
                SELECT m.type, m.dosage, pm.available
                FROM pharmacy_medications pm
                JOIN medications m ON pm.medication_id = m.id
                WHERE pm.pharmacy_id = ? AND m.type = ?
            `, [pharmacyId, medicationType]);

            console.log('Database results after processing:', rows);
            console.assert(result.available === expected.available, `Expected available to be ${expected.available}, but got ${result.available}`);
            console.assert(result.more_info_needed === expected.more_info_needed, `Expected more_info_needed to be ${expected.more_info_needed}, but got ${result.more_info_needed}`);
        } catch (error) {
            console.error('Error processing transcript:', error);
        }
    }
}

testProcessTranscript();
