# 🧠 JARVIS v2.0: Real-Time Voice Architecture

## 1. System Overview
**Goal:** Sub-second latency (<500ms), interruptible, human-like interaction.

This architecture moves away from client-side processing (Web Speech API) to a **Server-Side Streaming Pipeline**. This allows for high-quality models (Whisper, ElevenLabs) which cannot run in the browser efficiently.

---

## 2. Technology Stack

| Component | Technology | Reasoning |
|-----------|------------|-----------|
| **Frontend** | React + AudioWorklet | Low-latency audio capture & playback |
| **Transport** | WebSockets (Socket.io) | Full-duplex real-time communication |
| **Orchestrator** | Node.js Server | Manages streams and state |
| **STT** | OpenAI Whisper (or Deepgram) | High accuracy transcription |
| **Brain** | GPT-4o / Gemini 1.5 Flash | Fast reasoning & tool calling |
| **TTS** | ElevenLabs Streaming API | Best-in-class emotional voice |

---

## 3. Data Flow Pipeline

### Step 1: Input (User Speaks)
1. **Frontend**: Captures microphone input at 16kHz (PCM/L16).
2. **Streaming**: Sends binary audio chunks via WebSocket to `jarvis-server`.
3. **VAD (Voice Activity Detection)**: Server detects when user starts/stops speaking to optimize API usage.

### Step 2: Perception (Ear)
1. **Server**: Buffers audio chunks.
2. **Transcription**: Sends audio to **STT Service**.
   - *Option A (Quality)*: OpenAI Whisper API (Chunked).
   - *Option B (Speed)*: Deepgram Streaming SDK (Real-time).
3. **Result**: emits `transcript.final` events.

### Step 3: Cognition (Brain)
1. **Server**: Accumulates transcript.
2. **Context**: Appends system prompt ("You are JARVIS...") + recent history.
3. **Inference**: Streams text prompt to **LLM** (GPT-4o/Gemini).
4. **Tool Use**: If LLM detects intent (e.g., "Turn on lights"), it pauses generation, executes code, and resumes.

### Step 4: Expression (Voice)
1. **Stream Buffer**: As LLM generates tokens (words), they are immediately sent to **TTS Service**.
2. **Synthesis**: ElevenLabs WebSocket API accepts text stream and returns audio stream (MPEG/PCM).
3. **Playback**: Server forwards audio chunks to Frontend.
4. **Frontend**: Plays audio immediately using `AudioContext` buffer queue.

---

## 4. State Machine (Voice AI)

The system operates on a strict state machine to handle interruptions:

- **IDLE**: Waiting for Wake Word or Button Press.
- **LISTENING**: capturing audio, VAD active.
- **THINKING**: STT done, waiting for LLM first token.
- **SPEAKING**: Playing audio. *Interruptible*.
  - *Condition*: If user speaks during **SPEAKING**, transition immediately to **THINKING** (or **LISTENING**), cancel TTS stream, clear audio buffer.

---

## 5. Security & Performance
- **API Keys**: Stored in server-side `.env`. Never exposed to client.
- **Rate Limiting**: Protect against excessive usage.
- **Audio Cleanup**: Audio buffers discarded immediately after processing.

---

## 6. Implementation Roadmap

### Phase 1: The Core (Server)
- [ ] Set up Node.js WebSocket Server.
- [ ] Implement VAD and Silence Detection.
- [ ] Connect OpenAI/Deepgram STT.
- [ ] Connect ElevenLabs TTS Streaming.

### Phase 2: The Client (React)
- [ ] Build `AudioRecorder` hook (Worklet based).
- [ ] Build `AudioPlayer` hook (Queue based).
- [ ] Visualizer component synced to volume.

### Phase 3: Intelligence
- [ ] System Prompt Engineering ("Disciplined, Concise").
- [ ] Context Management (Sliding window).
