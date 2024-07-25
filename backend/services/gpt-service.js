require('colors');
const EventEmitter = require('events');
const OpenAI = require('openai');
const endCall = require('../functions/endCall');  // Ensure the correct path to endCall function


class GptService extends EventEmitter {
  constructor(streamService) {
    super();
    this.openai = new OpenAI();
    this.streamService = streamService;  // Add this line

    this.userContext = [
      
      { 'role': 'system', 'content': `You are calling this pharmacy to find out if they have adderall in stock.
    If you encounter an automated phone menu:
    - Listen carefully to all menu options.
    - When you need to press a button, respond ONLY with "DTMF: X", where X is the button to press.
    - After sending a DTMF tone, wait for the next prompt before responding again.
    - If there's an option to speak with a pharmacist, choose that option.
    
        When you're speaking with a human (pharmacist or staff):
        - Greet them politely. If it's a person, you can assume that they are the person you need to talk to.
        - You are calling to find out if they have adderall in stock.
        - You have a youthful, cheery, informal personality. 
        - If asked for your name and date of birth, clarify that you do not have a prescription on file yet, you are just calling to ask about availability. 
        - Keep your responses, and the whole conversation, as brief as possible. 
        - Don't ask more than 1 question at a time. 
        - When you have the information you need, thank the pharmacist and end the call.
        - Say Bye when you are done.
        
        Important: Say "Bye" in the following situations:
        1. When you've gotten the information you need and the conversation is complete.
        2. If you detect that the call has reached a voicemail.
        3. If you believe the other party has hung up.
        4. If you're stuck in a menu loop and can't reach a human after multiple attempts.
        5. If the call has gone on for too long without reaching a human (use your judgment).

        Always say "Bye" when you want to end the call for any reason.` },

    ],
    this.partialResponseIndex = 0;
    this.placeId = null; // Store pharmacyId
    this.medication = null; // Store medication
    this.dosage = null; // Store dosage

  }

 setPharmacyDetails(placeId, medication, dosage) {
    console.log(`Setting placeId=${placeId}, medication=${medication}, dosage=${dosage}`); // Add this log
    this.placeId = placeId;
    this.medication = medication;
    this.dosage = dosage;
  }


  setCallSid(callSid) {
    this.userContext.push({ 'role': 'system', 'content': `callSid: ${callSid}` });
  }

  updateUserContext(name, role, text) {
    if (name !== 'user') {
      this.userContext.push({ 'role': role, 'name': name, 'content': text });
    } else {
      this.userContext.push({ 'role': role, 'content': text });
    }
  }

  async completion(text, interactionCount, role = 'user', name = 'user') {
    console.log('Entering completion method');
    this.updateUserContext(name, role, text);
  
    const stream = await this.openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: this.userContext,
      stream: true,
    });
  
    let completeResponse = '';
    let partialResponse = '';
    let finishReason = '';

  
    for await (const chunk of stream) {
      let content = chunk.choices[0]?.delta?.content || '';
      let deltas = chunk.choices[0].delta;
      finishReason = chunk.choices[0].finish_reason;
  
      completeResponse += content;
      partialResponse += content;
 
  
      if (content.trim().slice(-1) === '•' || finishReason === 'stop') {
        const gptReply = { 
          partialResponseIndex: this.partialResponseIndex,
          partialResponse
        };

        console.log('gptReply.partialResponse:', gptReply.partialResponse);

        // Only emit gptReply if it's not a DTMF command
        if (!gptReply.partialResponse.includes('DTMF:')) {
          this.emit('gptreply', gptReply, interactionCount);

            
          // Check for "bye" to end the call
          if (gptReply.partialResponse.toLowerCase().includes('bye')) {
            const callSid = this.userContext.find(item => item.content.startsWith('callSid')).content.split(': ')[1];
            console.log('ending the call by calling the endCall function');
            setTimeout(async () => {
              const endCallResult = await endCall({ callSid });
              console.log(endCallResult);
              const fullTranscript = this.userContext.map(item => `${item.role}: ${item.content}`).join('\n');
          
              const placeId = this.placeId;
              const medication = this.medication;
              const dosage = this.dosage;
              this.emit('fullTranscript', fullTranscript, placeId, medication, dosage);
            }, 6000);  // Add a 6-second delay before ending the call
          }


        } else {
          console.log('DTMF command detected, skipping emit');
          const dtmfMatch = gptReply.partialResponse.match(/DTMF:\s*(\d)/);
          if (dtmfMatch) {
            const dtmfDigit = dtmfMatch[1];
            console.log(`Detected DTMF command: ${dtmfDigit}`);
            await this.streamService.sendDTMF(dtmfDigit);
            console.log(`DTMF command ${dtmfDigit} sent`);
          }
        }
        this.partialResponseIndex++;
        partialResponse = '';
      }

    }
  
    this.userContext.push({ 'role': 'assistant', 'content': completeResponse });
    console.log(`GPT -> user context length: ${this.userContext.length}`.green);
  }

} 

module.exports = { GptService };

