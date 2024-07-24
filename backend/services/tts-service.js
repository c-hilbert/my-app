require('dotenv').config();
const EventEmitter = require('events');
const fetch = require('node-fetch');

class TextToSpeechService extends EventEmitter {
  constructor() {
    super();
    this.nextExpectedIndex = 0;
    this.speechBuffer = {};
  }

  async generate(gptReply, interactionCount) {
    const { partialResponseIndex, partialResponse } = gptReply;

    if (!partialResponse) { return; }

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${process.env.VOICE_ID}/stream?output_format=ulaw_8000&optimize_streaming_latency=3`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': process.env.XI_API_KEY,
            'Content-Type': 'application/json',
            'accept': 'audio/wav',
          },
          body: JSON.stringify({
            model_id: process.env.XI_MODEL_ID,
            text: partialResponse,
          }),
        }
      );

      if (response.status === 200) {
       
        const audioArrayBuffer = await response.arrayBuffer();
        const base64String = Buffer.from(audioArrayBuffer).toString('base64');
          // const blob = await response.blob();
          // const audioArrayBuffer = await blob.arrayBuffer();
          // const base64String = btoa(String.fromCharCode(...new Uint8Array(audioArrayBuffer)));
          this.emit('speech', partialResponseIndex, base64String, partialResponse, interactionCount);
      } else {
        console.log('ElevenLabs error:');
        console.log(await response.text());
      }
    } catch (err) {
      console.error('Error occurred in TextToSpeech service');
      console.error(err);
    }
  }
}

module.exports = { TextToSpeechService };