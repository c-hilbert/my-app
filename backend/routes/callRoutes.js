const express = require('express');
const router = express.Router();
const { handleRecordingStatus, getRecordings, getRecordingAudio } = require('../controllers/recordingController');
const { makeOutBoundCall, endCall } = require('../controllers/callController');

router.post('/initiate-call', makeOutBoundCall);
router.post('/end-call', endCall);
router.post('/status', handleRecordingStatus);
router.get('/:callSid', getRecordings);
router.get('/:recordingSid/audio', getRecordingAudio);

module.exports = router;