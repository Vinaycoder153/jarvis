import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import OpenAI from 'openai';
// import { ElevenLabsClient } from 'elevenlabs'; // Uncomment when installed

dotenv.config();

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // In production, strict this to your client URL
        methods: ["GET", "POST"]
    }
});

const PORT = 3000;

// --- Configuration ---
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Initialize OpenAI
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// System Instruction for JARVIS
const SYSTEM_PROMPT = `
You are JARVIS, a highly advanced, disciplined, and efficient AI assistant.
Your voice is calm, authoritative, and concise. 
You do not use filler words like "um", "ah", or "like".
You prioritize execution over conversation. 
If a user asks for a task, confirm it briefly and do it.
Keep responses under 2 sentences unless detailed explanation is requested.
`;

io.on('connection', (socket) => {
    console.log(`[Connected]: Client ${socket.id}`);

    let audioBuffer = []; // Store audio chunks for VAD/Processing

    // 1. Receive Audio Stream from Logic
    socket.on('audio-stream', (blob) => {
        // In a real implementation:
        // 1. Append to buffer
        // 2. Run VAD (Voice Activity Detection)
        // 3. If silence detected -> trigger STT
        audioBuffer.push(blob);
    });

    // 2. Handle "Stop/Interrupt" signal
    socket.on('interrupt', () => {
        console.log('[Interrupt]: Stopping generation');
        // Stop LLM stream, Stop TTS stream
        socket.emit('audio-stop');
    });

    // 3. Simple Text Input (Fallback/Chat Mode)
    socket.on('message', async (text) => {
        console.log(`[User]: ${text}`);
        socket.emit('status', 'Thinking...');

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4-turbo-preview", // or gpt-3.5-turbo for speed
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: text }
                ],
                stream: true,
            });

            let fullResponse = "";

            // Stream chunks back
            for await (const chunk of completion) {
                const content = chunk.choices[0]?.delta?.content || "";
                if (content) {
                    fullResponse += content;
                    // Emit text token for UI
                    socket.emit('text-stream', content);

                    // TODO: Pipe 'content' to ElevenLabs Stream here
                    // ttsStream.write(content);
                }
            }

            console.log(`[JARVIS]: ${fullResponse}`);
            socket.emit('status', 'Idle');

        } catch (error) {
            console.error('[Error]:', error);
            socket.emit('error', 'Processing failed');
        }
    });

    socket.on('disconnect', () => {
        console.log(`[Disconnected]: ${socket.id}`);
    });
});

httpServer.listen(PORT, () => {
    console.log(`🚀 JARVIS v2 Voice Server running on port ${PORT}`);
    console.log(`   - STT: Whisper (Pending Integration)`);
    console.log(`   - Brain: GPT-4 (Ready)`);
    console.log(`   - TTS: ElevenLabs (Pending Integration)`);
});
