/* eslint-env jest */

const { GptService } = require('../services/gpt-service');

describe('GptService', () => {
  let gptService;

  beforeEach(() => {
    gptService = new GptService();
  });

  test('should complete a regular chat prompt', (done) => {
    console.log('Starting regular chat test');
    const prompt = "Hello, how are you?";
    
    gptService.on('gptreply', (reply) => {
      console.log('Received gptreply event');
      try {
        expect(reply).toBeTruthy();
        expect(reply.partialResponse).toBeTruthy();
        expect(typeof reply.partialResponse).toBe('string');
        console.log('Response:', reply.partialResponse);
        done();
      } catch (error) {
        done(error);
      }
    });

    console.log('Calling completion method for regular chat');
    gptService.completion(prompt, 0);
  }, 30000);

  test('should include DTMF instructions in response when appropriate', (done) => {
    console.log('Starting DTMF test');
    const prompt = "You've reached an automated system. For pharmacy, press 1.";
    
    gptService.on('gptreply', (reply) => {
      console.log('Received gptreply event in DTMF test');
      try {
        console.log('DTMF test response:', reply.partialResponse);
        expect(reply.partialResponse).toMatch(/DTMF:\s*\d/);
        done();
      } catch (error) {
        done(error);
      }
    });

    console.log('Calling completion method for DTMF test');
    gptService.completion(prompt, 0);
  }, 30000);
});