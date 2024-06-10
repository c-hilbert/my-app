// test/testTranscriptProcessor.js

const { processTranscript } = require('../services/transcriptProcessor');
require('dotenv').config();

async function testProcessTranscript() {
    const transcript = `assistant: Hi! I was just calling to see if you have adderall in stock?
system: callSid: CA4ed37382b1bfaa241c6668ce1db55ba4
user:  Hello?
assistant: Hi there! I wanted to check if you have Adderall in stock before I have my doctor send over a prescription. Can you help me with that?
user:  Yeah. We do have that in stock.
assistant: Awesome, thanks so much for checking on that! Have a great day! Bye!`;
    
    const originalDose = '10mg IR';

    try {
        const result = await processTranscript(transcript, originalDose);
        console.log('Processed Transcript Result:', result);
    } catch (error) {
        console.error('Error processing transcript:', error);
    }
}

testProcessTranscript();
