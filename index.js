import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// CORS middleware
app.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

// Serve static files
app.use(express.static('public'));

app.use(express.json({ limit: '50mb' }));

app.post('/analyze-image/gemini', async (req, res) => {


    try {

        const { base64Image } = req.body;
        const { prompt } = req.body || 'Describe the image';
        const { model } = req.body || 'gemini-2.0-flash';
        const { temperature } = req.body || 0.5;
        const { maxOutputTokens } = req.body || 1000;
        const { topP } = req.body || 0.8;
        const { topK } = req.body || 40;
        const { stopSequences } = req.body || ['\n'];
        const { maxInputTokens } = req.body || 4096;    
        const { numOutputs } = req.body || 1;
        const { stream } = req.body || false;
        const { returnPrompt } = req.body || false;
        const { returnMetadata } = req.body || false;
        const { returnChoices } = req.body || false;
        
        if (!base64Image) {
            return res.status(400).json({ error: 'No image provided' });
        }

        
        const contents = [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image,
              },
            },
            { text: prompt },
          ];

          
          const ai = new GoogleGenAI(process.env.GOOGLE_API_KEY);


          const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            temperature: temperature,
            maxOutputTokens: maxOutputTokens,
            topP: topP,
            topK: topK,
            stopSequences: stopSequences,
            maxInputTokens: maxInputTokens,
            numOutputs: numOutputs,
            stream: stream,
            returnPrompt: returnPrompt,
            returnMetadata: returnMetadata,
            returnChoices: returnChoices,

          });


          res.json({ response: response.text });


    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to analyze image' });
    }
});

app.get('/uploadgemini', (_req, res) => {
    res.sendFile(__dirname + '/uploadgemini.html');
});

app.get('/cameragemini', (_req, res) => {
    res.sendFile(__dirname + '/cameragemini.html');
});

app.get('/', (_req, res) => {
    res.sendFile(__dirname + '/index.html');
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});