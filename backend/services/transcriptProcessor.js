require('dotenv').config(); // Load environment variables from .env file
const { OpenAI } = require('openai'); // *Import OpenAI module*

const axios = require('axios');


async function sendTranscriptToChatGPT(transcript, originalDose) {
    const openai = new OpenAI(process.env.OPENAI_API_KEY); // *Instantiate OpenAI client*

    console.log('openaI api key:', process.env.OPENAI_API_KEY);
    console.log('sending transcript to chatgpt');
    const prompt = `
    Extract medication availability from the following conversation. The original dose inquired about is "${originalDose}". The output should be in JSON format with "available" as true or false, "specific_dose_unavailable" as a list of doses that are not available (if any), and "more_info_needed" as true or false.

    Example Output:
    {
      "available": true,
      "specific_dose_unavailable": [],
      "more_info_needed": false
    }

    Conversation: ${transcript}
    `;

   
    try {
        const completion = await openai.chat.completions.create({ // *Update API endpoint and payload structure*
            model: 'gpt-4',
            messages: [{ role: 'system', content: prompt }],
            max_tokens: 150,
        });

        console.log("OpenAI response:", completion);
        let aiResponse = completion.choices[0].message.content.trim();
        console.log("AI response:", aiResponse);

        if (!aiResponse) {
            console.error("Error: OpenAI API returned an undefined data object.");
            return null;
        }

        return aiResponse;
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
  
async function processTranscript(transcript, originalDose) {
    console.log('processing transcript with '.blue,  originalDose);
    const cleanedTranscript = cleanTranscript(transcript);
    const result = await sendTranscriptToChatGPT(cleanedTranscript, originalDose);
    return result;
}

module.exports = {
  sendTranscriptToChatGPT,
  processTranscript,
  cleanTranscript
};
