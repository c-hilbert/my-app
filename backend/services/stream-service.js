const EventEmitter = require('events');
const twilio = require('twilio');

const uuid = require('uuid');

class StreamService extends EventEmitter {
  constructor(websocket) {
    super();
    this.ws = websocket;
    this.expectedAudioIndex = 0;
    this.audioBuffer = {};
    this.streamSid = '';
    this.callSid = '';
    this.twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }

  setStreamSid (streamSid) {
    this.streamSid = streamSid;
  }

  setCallSid(callSid) {
    this.callSid = callSid;
  }

  buffer (index, audio) {
    // Escape hatch for intro message, which doesn't have an index
    if(index === null) {
      this.sendAudio(audio);
    } else if(index === this.expectedAudioIndex) {
      this.sendAudio(audio);
      this.expectedAudioIndex++;

      while(Object.prototype.hasOwnProperty.call(this.audioBuffer, this.expectedAudioIndex)) {
        const bufferedAudio = this.audioBuffer[this.expectedAudioIndex];
        this.sendAudio(bufferedAudio);
        this.expectedAudioIndex++;
      }
    } else {
      this.audioBuffer[index] = audio;
    }
  }

  sendAudio (audio) {
    this.ws.send(
      JSON.stringify({
        streamSid: this.streamSid,
        event: 'media',
        media: {
          payload: audio,
        },
      })
    );
    // When the media completes you will receive a `mark` message with the label
    const markLabel = uuid.v4();
    this.ws.send(
      JSON.stringify({
        streamSid: this.streamSid,
        event: 'mark',
        mark: {
          name: markLabel
        }
      })
    );
    this.emit('audiosent', markLabel);
  }

  async sendDTMF(digit) {
    try {
      console.log(`Attempting to send DTMF: ${digit}`);
      const twiml = `
        <Response>
          <Play digits="${digit}"></Play>
          <Connect>
            <Stream url="wss://${process.env.SERVER}/connection"></Stream>
          </Connect>
        </Response>
      `;
  
      console.log('TwiML generated:', twiml);
  
      await this.twilioClient.calls(this.callSid)
        .update({twiml: twiml});
      console.log(`Sent DTMF: ${digit} and requested stream reconnection`);
      
      // Don't wait for reconnection here, let Twilio handle it
      this.ws.close(); // Close the current WebSocket connection
      console.log('Closed current WebSocket connection');
    } catch (error) {
      console.error('Error sending DTMF:', error);
    }
  }

}

module.exports = {StreamService};