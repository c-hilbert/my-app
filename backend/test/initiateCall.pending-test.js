// /* eslint-env jest */
// const request = require('supertest');
// const app = require('../app'); // Assuming your Express app is defined in app.js


// describe('POST /call/initiate-call', () => {
//   it('should return 200 and initiate a phone call', async () => {
//     const response = await request(app)
//       .post('/call/initiate-call')
//       .send({
//         phoneNumber: '+15125170223',
//         pharmacyName: 'Example Pharmacy',
//       });

//     console.log('Response:', response.body); // Log the response for debugging


//     expect(response.status).toBe(200);
//     expect(response.body.success).toBe(true); // Adjust to match your response
//     expect(response.body.message).toBe('Call initiated successfully.');
//     // Add more assertions as needed
//   });
// });
