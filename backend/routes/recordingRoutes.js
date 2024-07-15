// routes/recordingRoutes.js

const express = require('express');
const router = express.Router();
const { handleRecordingStatus, getRecordings, getRecordingAudio } = require('../controllers/recordingController');

router.post('/status', handleRecordingStatus);
router.get('/:callSid', getRecordings);
router.get('/:recordingSid/audio', getRecordingAudio);

module.exports = router;