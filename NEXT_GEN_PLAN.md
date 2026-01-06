# JARVIS v2.0 Implementation Plan

## 📦 Dependencies
You will need to install these packages:
```bash
npm install socket.io-client
npm install --save-dev @types/socket.io-client
```
*(Server-side dependencies will be in a separate `server` directory)*

## 🛠️ Step-by-Step Implementation

### Step 1: Voice Server (The Application Layer)
We will create a discrete backend service `voice-server.js` that acts as the bridge.
- **Why?** Vite is for frontend serving. We need a real Node process for long-running WebSockets and API secrets.

### Step 2: Client-side Hooks
Refactor `jarvis.jsx` to use custom hooks:
- `useVoiceRecorder`: Manages `navigator.mediaDevices.getUserMedia`
- `useVoicePlayer`: Manages `AudioContext` and buffering
- `useJarvisConnection`: Manages Socket.io connection

### Step 3: UI Overhaul
Update the interface to reflect the "State Machine":
- **Default**: Glowing Orb (Idle)
- **Listening**: Orb expands/contracts with mic volume
- **Thinking**: Rapid orbital spin
- **Speaking**: Orb pulses with output audio

## 🚀 Migration Strategy
1. **Parallel v2**: We will build `AppV2.jsx` and `voice-server.js` alongside current files.
2. **Switch**: Once tested, we swap `main.jsx` to render `AppV2`.

---
**Status**: Ready to begin Step 1.
