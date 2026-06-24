require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http'); // 1. Importa il modulo HTTP nativo
const WebSocket = require('ws'); // 2. Importa la libreria ws
const db = require('./database/db');

const authRoutes = require('./routes/authRoutes');
const photoRoutes = require('./routes/photoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', photoRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// 3. Crea un server HTTP integrando Express
const server = http.createServer(app);

// 4. Inizializza WebSocket sul server HTTP esistente (condividono la stessa porta)
const wss = new WebSocket.Server({ server });

const clients = new Map(); // userId -> websocket
console.log("CLIENTS:", Array.from(clients.keys()));

wss.on("connection", (ws) => {
    console.log("Client connesso");

    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message);
           console.log("FROM:", data.from);
           console.log("TO:", data.to);
           console.log("DATAAA:", data);
            switch (data.type) {
                case "REGISTER":
                    clients.set(data.userId, ws);
                    // Memorizza l'id nel socket per la rimozione alla disconnessione
                    ws.userId = data.userId; 
                    console.log("Registrato:", data.userId);
                    break;

                case "MESSAGE":
                    const receiverSocket = clients.get(data.to);
                    if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
                        receiverSocket.send(JSON.stringify({
                            type: "MESSAGE",
                            text: data.text,
                            from: data.from
                        }));
                    }
                    break;
            }
        } catch (err) {
            console.error("Errore nel parsing del messaggio:", err.message);
        }
    });

    ws.on("close", () => {
        if (ws.userId) {
            clients.delete(ws.userId);
            console.log(`Client disconnesso ed eliminato: ${ws.userId}`);
        } else {
            console.log("Client disconnesso senza registrazione");
        }
    });
});

// 5. Avvia il server HTTP (che ascolta sia Express che WebSocket)
server.listen(PORT, () => {
  console.log(`🎵 MusicBuddy Backend running on port ${PORT}`);
  console.log(`📍 Server URL HTTP: http://localhost:${PORT}`);
  console.log(`📍 Server URL WS: ws://localhost:${PORT}`);
  console.log(`🔗 Register endpoint: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`🔗 Login endpoint: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`🔗 Update Field endpoint: POST http://localhost:${PORT}/api/auth/updateFieldUser`);
  console.log(`🔗 Retrieve all users infos: GET http://localhost:${PORT}/api/auth/getAllUsersInfos`);
  console.log(`🔗 Delete a user by id: DELETE http://localhost:${PORT}/api/auth/deleteUser`);
});
