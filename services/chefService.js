const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({
  organization: "<$ORG_ID>",
  project: "<$PROJECT_ID>",
  apiKey: process.env.OPENAI_API_KEY,
});

const transcribeAudio = async (audioFile) => {
  try {
    // Decode Base64 audio into a buffer
    const audioBuffer = Buffer.from(audioFile, 'base64');

    const tempFilePath = path.join(__dirname, 'temp_audio_file.mp3');
    await fs.promises.writeFile(tempFilePath, audioBuffer);

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: 'whisper-1',
    });

    await fs.promises.unlink(tempFilePath);

    return transcription.text;
  } catch (error) {
    console.error('Error transcribing audio:', error.message);
    throw new Error('Failed to transcribe audio');
  }
};

// Answer a question using OpenAI's GPT-4o-Mini model
const answerQuestion = async (context, question) => {
  try {
    const prompt = `
      The following text contains a recipe and instructions:

      Context:
      ${context}

      Answer the question using the provided context:
      ${question}
    `;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant that answers questions about recipes." },
        { role: "user", content: prompt },
      ],
      model: "gpt-4o-mini",
      max_tokens: 1000,
    });

    const answer = completion.choices[0].message.content;

    console.log("Answer:\n");
    console.log(answer);

    return answer;
  } catch (error) {
    console.error("Error answering the question:", error.message);
  }
};

// Text To Speech
const generateVoiceResponse = async (text) => {
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    const audioBuffer = Buffer.from(await mp3.arrayBuffer());

    return audioBuffer;
  } catch (error) {
    throw new Error(`Error generating voice output: ${error.message}`);
  }
};

module.exports = {
  transcribeAudio,
  generateVoiceResponse,
  answerQuestion,
};
