const express = require('express');
const redis = require('redis');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create single Redis client
const client = redis.createClient({
    url: 'redis://@127.0.0.1:6379'
});

// Redis connection handling
client.on('error', (err) => console.error('Redis Client Error:', err));

// Connect to Redis before setting up routes
(async () => {
    try {
        await client.connect();
        console.log('Connected to Redis');

        // Middleware
        app.use(cors());
        app.use(bodyParser.json());

        // Pass Redis client to auth routes
        const authRoutes = require('./LoginServer')(client);  // Pass client to LoginServer.js
        app.use('/', authRoutes);

        // RBAC
        const SECRET_KEY = "your_secret_key";

        const users = {
            user1: { username: "user1", password: "pass123", role: "admin" },
            user2: { username: "user2", password: "pass123", role: "user" },
        };

        // Login endpoint
        app.post("/login", async (req, res) => {
            const { username, password } = req.body;
            const user = users[username];



// Delete (D)
app.delete('/students/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await client.del(`student:${id}`);
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Failed to delete student' });
  }
});



        // Start server
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

    } catch (err) {
        console.error('Failed to connect to Redis:', err);
        process.exit(1);
    }
})();