// controllers/recordingController.js

const twilio = require('twilio');

function handleRecordingStatus(req, res) {
  console.log('Recording status update:', req.body);
  res.sendStatus(200);
}

async function getRecordings(req, res) {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const callSid = req.params.callSid;

  try {
    const recordings = await client.recordings.list({callSid: callSid});
    res.json(recordings);
  } catch (error) {
    console.error('Error fetching recordings:', error);
    res.status(500).json({ error: 'Failed to fetch recordings' });
  }
}

async function getRecordingAudio(req, res) {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const recordingSid = req.params.recordingSid;

  try {
    const recording = await client.recordings(recordingSid).fetch();
    res.redirect(recording.mediaUrl);
  } catch (error) {
    console.error('Error fetching recording audio:', error);
    res.status(500).json({ error: 'Failed to fetch recording audio' });
  }
}

module.exports = {
  handleRecordingStatus,
  getRecordings,
  getRecordingAudio
};