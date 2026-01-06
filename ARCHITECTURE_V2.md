# JARVIS Full-Stack Architecture V2

## 🌐 1. High-Level Architecture
This project uses a monorepo-style structure separating `client` (Frontend), `server` (Backend), and `shared` (Types/Utils).

```mermaid
graph TD
  User[User / Client] -->|HTTPS/WSS| LB[Load Balancer / Nginx]
  LB -->|Static Assets| Client[React Client (Vite)]
  LB -->|API / Socket| Server[Node.js Server]
  Server -->|Query| DB[(PostgreSQL / Supabase)]
  Server -->|Cache| Redis[(Redis)]
  Server -->|AI Processing| ExternalAI[OpenAI / ElevenLabs]
```

---

## 📂 2. Directory Structure

```plaintext
/jarvis
├── /client                 # Frontend (React + Vite)
│   ├── /src
│   │   ├── /components     # UI Components (Button, MicOrb)
│   │   ├── /hooks          # Custom Logic (useVoice, useSocket)
│   │   ├── /services       # API Clients (api.js, socket.js)
│   │   ├── /pages          # Route Views (Dashboard, Settings)
│   │   └── /styles         # Global CSS / Tailwind
│   └── vite.config.js
│
├── /server                 # Backend (Node.js + Express)
│   ├── /src
│   │   ├── /config         # Env vars, DB config
│   │   ├── /controllers    # Route Logic (authController, chatController)
│   │   ├── /models         # DB Schemas (User, Interaction)
│   │   ├── /routes         # API Endpoints (/api/v1/auth)
│   │   ├── /services       # Business Logic (OpenAIService, VoiceService)
│   │   ├── /sockets        # Websocket Handlers
│   │   └── app.js          # App Entry
│   └── package.json
│
├── /shared                 # Shared Code
│   └── /constants          # Event Names, Error Codes
│
├── docker-compose.yml      # Container orchestration
└── README.md
```

---

## 🔗 3. Roles & Responsibilities

### **Frontend (Client)**
- **Responsibility**: State management, UI rendering, Audio capture/playback.
- **Tech**: React, Tailwind, Socket.io-client, AudioWorklets.
- **Key Pattern**: "Container/Presentational" pattern for components.

### **Backend (Server)**
- **Responsibility**: Business logic, Database access, AI orchestration, Auth.
- **Tech**: Express, Socket.io, Postgres (Prisma/Sequelize).
- **Key Pattern**: "MVC" (Model-View-Controller) + Service Layer.

### **Database**
- **Responsibility**: Persistent storage of user profiles, chat history, preferences.
- **Tech**: PostgreSQL (Structured Data), Redis (Hot Session Data/Rate Limiting).

---

## 💻 4. Sample Code Implementation

### **A. Backend: Clear Service Layer (`server/src/services/aiService.js`)**
```javascript
import OpenAI from 'openai';

class AIService {
  constructor() {
    this.openai = new OpenAI(process.env.OPENAI_API_KEY);
  }

  async generateResponse(history, systemPrompt) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history
        ]
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error('AI Gen Error:', error);
      throw new Error('AI Service Unavailable');
    }
  }
}

export default new AIService();
```

### **B. Backend: Route Controller (`server/src/controllers/chatController.js`)**
```javascript
import aiService from '../services/aiService.js';

export const handleChatMessage = async (req, res) => {
  try {
    const { message, history } = req.body;
    const response = await aiService.generateResponse(history, "You are JARVIS.");
    res.json({ reply: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### **C. Frontend: API Hook (`client/src/hooks/useChat.js`)**
```javascript
import { useState } from 'react';
import api from '../services/api';

export const useChat = () => {
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text) => {
    setLoading(true);
    try {
      const { data } = await api.post('/chat', { message: text });
      return data.reply;
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading };
};
```

---

## 🚀 5. Deployment Scalability
- **Dockerize** both client and server.
- Use **Nginx** as a reverse proxy.
- Use **PM2** for process management in Node.js.
