const axios = require('axios');


async function sendTranscriptToChatGPT(transcript, originalDose) {
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
        const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
            prompt: prompt,
            max_tokens: 150,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        return response.data.choices[0].text.trim();
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
  
  module.exports = {
    cleanTranscript,
  };
  
async function processTranscript(transcript, originalDose) {
    const cleanedTranscript = cleanTranscript(transcript);
    const result = await sendTranscriptToChatGPT(cleanedTranscript, originalDose);
    return result;
}

module.exports = {
  sendTranscriptToChatGPT,
  processTranscript,
  cleanTranscript
};
