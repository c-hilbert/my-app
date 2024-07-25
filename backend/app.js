require('dotenv').config();
require('colors');
const express = require('express');
const ExpressWs = require('express-ws');
const router = express.Router();
let clients = [];

//const makeOutboundCall = require('./controllers/callController'); // Ensure the path is correct


const { GptService } = require('./services/gpt-service');
const { StreamService } = require('./services/stream-service');
const { TranscriptionService } = require('./services/transcription-service');
const { TextToSpeechService } = require('./services/tts-service');

// **Import the transcript processor**
const { cleanTranscript, processTranscript } = require('./services/transcriptProcessor');


const app = express();
ExpressWs(app);

const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Integrate the new routes
const searchRouter = require('./routes/searchRoutes');
const callRouter = require('./routes/callRoutes');
const recordingRoutes = require('./routes/recordingRoutes');


app.use('/search', searchRouter);
app.use('/call', callRouter);
app.use('/recordings', recordingRoutes);


app.post('/incoming', (req, res) => {
  res.status(200);
  res.type('text/xml');
  res.end(`
  <Response>
    <Connect>
      <Stream url="wss://${process.env.SERVER}/connection" />
    </Connect>
  </Response>
  `);
});

// SSE endpoint
app.get('/events', (req, res) => {
  console.log('Client connected to /events'); // Log when a client connects

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const clientId = Date.now();
  const newClient = {
      id: clientId,
      res,
  };
  clients.push(newClient);

  req.on('close', () => {
    console.log('Client disconnected from /events'); // Log when a client disconnects

      clients = clients.filter(client => client.id !== clientId);
  });
});


module.exports = router;

function updateCallStatus(status, result) {
  const data = { status, result }; // Combine status and result into a single object
  console.log('update call status was called');
  clients.forEach(client => {
    console.log(`Sending status to client: ${JSON.stringify(data)}`);
    client.res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}


app.ws('/connection', (ws) => {
  console.log('New WebSocket connection established');

  try {
    ws.on('error', console.error);
    // Filled in from start message
    let streamSid;
    let callSid;

  
    const streamService = new StreamService(ws);
    const gptService = new GptService(streamService);
    const transcriptionService = new TranscriptionService();
    const ttsService = new TextToSpeechService({});
  
    let marks = [];
    let interactionCount = 0;
    let isFirstUtterance = true; // Add this flag

  
    // Incoming from MediaStream
    ws.on('message', function message(data) {
      const msg = JSON.parse(data);
      if (msg.event === 'start') {
        streamSid = msg.start.streamSid;
        callSid = msg.start.callSid;
        streamService.setStreamSid(streamSid);
        streamService.setCallSid(callSid);  // Add this line

        gptService.setCallSid(callSid);
        console.log(`Twilio -> Starting Media Stream for ${streamSid}`.underline.red);
       
       // ttsService.generate({partialResponseIndex: null, partialResponse: 'Hi! I was curious if you have adderall in stock?'}, 1);
      } else if (msg.event === 'media') {
        transcriptionService.send(msg.media.payload);
      } else if (msg.event === 'mark') {
        const label = msg.mark.name;
        console.log(`Twilio -> Audio completed mark (${msg.sequenceNumber}): ${label}`.red);
        marks = marks.filter(m => m !== msg.mark.name);
      } else if (msg.event === 'stop') {
        console.log(`Twilio -> Media stream ${streamSid} ended.`.underline.red);
      }
    });
  
    transcriptionService.on('utterance', async (text) => {
      // This is a bit of a hack to filter out empty utterances
      if(marks.length > 0 && text?.length > 5) {
        console.log('Twilio -> Interruption, Clearing stream'.red);
        ws.send(
          JSON.stringify({
            streamSid,
            event: 'clear',
          })
        );
      }
    });
  
    transcriptionService.on('transcription', async (text) => {
      if (!text) { return; }
      console.log(`Interaction ${interactionCount} – STT -> GPT: ${text}`.yellow);
    
      if (isFirstUtterance) {
        isFirstUtterance = false;
        await gptService.completion(text, interactionCount);
      } else {
        await gptService.completion(text, interactionCount);
      
      }
      
      interactionCount += 1;
    });
    
    gptService.on('gptreply', async (gptReply, icount) => {
      console.log(`Interaction ${icount}: GPT -> TTS: ${gptReply.partialResponse}`.green );
      
      ttsService.generate(gptReply, icount);
    });
  
    ttsService.on('speech', (responseIndex, audio, label, icount) => {
      console.log(`Interaction ${icount}: TTS -> TWILIO: ${label}`.blue);
  
      streamService.buffer(responseIndex, audio);
    });
  
    streamService.on('audiosent', (markLabel) => {
      marks.push(markLabel);
    });


    gptService.on('fullTranscript', async (fullTranscript, placeId, dosage, medication) => {
          console.log(`Received full transcript with pharmacyId=${placeId} and dosage=${dosage} and medication= ${medication}`); // Add this log
          const result = await processTranscript(fullTranscript, dosage, placeId, medication);
          console.log(`Processed Transcript Result: ${result}`);
          updateCallStatus({ status: 'processed', result }); // Ensure this call

        });

        
  } catch (err) {
    console.log(err);
  }
});



app.listen(PORT);
console.log(`Server running on port ${PORT}`);
