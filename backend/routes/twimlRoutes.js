const express = require('express');
const router = express.Router();
const VoiceResponse = require('twilio').twiml.VoiceResponse;

router.post('/join-conference', (req, res) => {
  const conferenceName = req.query.name;
  const twiml = new VoiceResponse();

  twiml.dial().conference(conferenceName);

  res.type('text/xml');
  res.send(twiml.toString());
});

module.exports = router;