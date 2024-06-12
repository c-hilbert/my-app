require('dotenv').config(); // Load environment variables from .env file
const { OpenAI } = require('openai'); // *Import OpenAI module*
const pharmacyModel = require('../models/pharmacyModel'); // Add this line to import pharmacyModel
const axios = require('axios');


async function sendTranscriptToChatGPT(transcript, originalDose) {
    const openai = new OpenAI(process.env.OPENAI_API_KEY); // *Instantiate OpenAI client*

    console.log('openaI api key:', process.env.OPENAI_API_KEY);
    console.log('sending transcript to chatgpt');
    const prompt = `
Extract medication availability from the following conversation. The original dose inquired about is "${originalDose}". The output should be in JSON format with the following keys:
- "available": a boolean indicating if the medication is available.
- "more_info_needed": a boolean indicating if the specific dose that the user is asking about is unavailable, but other doses might be available. This will always be false if "available" is true.

Example Output:
{
  "available": true,
  "more_info_needed": false
}

Conversation: ${transcript}`;

   
    try {
        const completion = await openai.chat.completions.create({ // *Update API endpoint and payload structure*
            model: 'gpt-4',
            messages: [{ role: 'system', content: prompt }],
            max_tokens: 150,
        });

        console.log("OpenAI response:", completion);
        let aiResponse = completion.choices[0].message.content.trim();
        const result = JSON.parse(aiResponse); 

        console.log("AI response:", result);

        if (!aiResponse) {
            console.error("Error: OpenAI API returned an undefined data object.");
            return null;
        }

        return result;
    } catch (error) {
        console.error('Error sending transcript to ChatGPT:', error);
        throw error;
    }
}

function cleanTranscript(transcript) {
    const lines = transcript.split('\n').map(line => line.trim());
    const cleanedLines = lines.map(line => {
      if (line.startsWith('user:')) {
        return line.replace('user:', 'pharmacy:');
      }
      return line;
    });
  
    // Remove lines that start with 'system: ' or the initial prompt
    const filteredLines = cleanedLines.filter(line => !line.startsWith('system: '));
  
    return filteredLines.join('\n');
  }
  
  async function processTranscript(transcript, dosage, placeId, medication) {
    const cleanedTranscript = cleanTranscript(transcript);
    const result = await sendTranscriptToChatGPT(cleanedTranscript, dosage);
    console.log('Processed Transcript Result from processTranscript function:', result);
    console.log('result.available:', result.available);


    if (result.available) {
        await pharmacyModel.updateAllDosagesAvailable(placeId, medication);
    } else if (!result.available && result.more_info_needed) {
        await pharmacyModel.updateSpecificDosageToNo(placeId, medication, dosage);
    } else {
        await pharmacyModel.updateAllDosagesUnavailable(placeId, medication);
    }
    
    // You can also record the call if necessary
    //await pharmacyModel.recordCall(pharmacyId, medicationId, cleanedTranscript, result);


    return result;
}



module.exports = {
  sendTranscriptToChatGPT,
  processTranscript,
  cleanTranscript
};
