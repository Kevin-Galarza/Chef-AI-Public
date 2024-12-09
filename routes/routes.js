const express = require('express');
const { transcribeAudio, generateVoiceResponse, answerQuestion } = require('../services/chefService');
const router = express.Router();

router.post('/transcribe', async (req, res) => {
  try {
    const { audioFile } = req.body; // base64
    const transcription = await transcribeAudio(audioFile);
    res.json({ transcription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/question', async (req, res) => {
  try {
    const { context, question } = req.body;
    const answer = await answerQuestion(context, question);
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/speak', async (req, res) => {
  try {
    const { text } = req.body;
    const audioBuffer = await generateVoiceResponse(text);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'inline; filename="response.mp3"',
    });

    res.send(audioBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
