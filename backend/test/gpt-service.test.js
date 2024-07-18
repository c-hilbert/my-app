/* eslint-env jest */

const { GptService } = require('../services/gpt-service');

describe('GptService', () => {
  let gptService;

  beforeEach(() => {
    gptService = new GptService();
  });

  test('should complete a prompt and potentially emit DTMF', (done) => {
    console.log('Starting test');
    const prompt = "You've reached an automated system. For pharmacy, press 1.";
    
    let gptReplyReceived = false;
    let dtmfReceived = false;

    function checkTestCompletion() {
      if (gptReplyReceived && (dtmfReceived || gptReplyReceived)) {
        // Wait a bit before calling done to allow for any final async operations
        setTimeout(done, 100);
      }
    }

    gptService.on('gptreply', (reply) => {
      console.log('Received gptreply event');
      try {
        expect(reply).toBeTruthy();
        expect(reply.partialResponse).toBeTruthy();
        expect(typeof reply.partialResponse).toBe('string');
        console.log('Response:', reply.partialResponse);
        gptReplyReceived = true;
        checkTestCompletion();
      } catch (error) {
        done(error);
      }
    });

    gptService.on('dtmf', (tone) => {
      console.log('Received dtmf event');
      try {
        expect(tone).toBeTruthy();
        expect(typeof tone).toBe('string');
        expect(tone).toMatch(/^\d+$/);  // Ensure it's a string of digits
        console.log('DTMF tone:', tone);
        dtmfReceived = true;
        checkTestCompletion();
      } catch (error) {
        done(error);
      }
    });

    console.log('Calling completion method');
    gptService.completion(prompt, 0);
  }, 30000); // 30 second timeout
});