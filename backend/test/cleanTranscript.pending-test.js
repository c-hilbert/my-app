const { cleanTranscript } = require('../services/transcriptProcessor');

// Sample transcript
const sampleTranscript = `
  system: You are calling this pharmacy to find out if they have adderall in stock before you have your doctor send them your prescription. You have a youthful, cheery, informal personality. If asked for your name and date of birth, clarify that you do not have a prescription on file yet, you are just calling to ask about availability. Keep your responses as brief as possible. Don't ask more than 1 question at a time. Don't make assumptions about what values to plug into functions. Ask for clarification if a user request is ambiguous. When you have the information you need you can thank the pharmacist and end the call. Say Bye when you are done.
  assistant: Hi! I was just calling to see if you have adderall in stock?
  system: callSid: CA4ed37382b1bfaa241c6668ce1db55ba4
  user: Hello?
  assistant: Hi there! I wanted to check if you have Adderall in stock before I have my doctor send over a prescription. Can you help me with that?
  user: Yeah. We do have that in stock.
  assistant: Awesome, thanks so much for checking on that! Have a great day! Bye!
`;

// Test the cleanTranscript function
const cleanedTranscript = cleanTranscript(sampleTranscript);
console.log(cleanedTranscript);
