// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io'); // Correct import for v4+
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({ origin: ['http://localhost:5500'] })); // Allow your frontend

const server = http.createServer(app);

// Socket.IO server with CORS
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5500'],
    methods: ['GET', 'POST']
  }
});

const auth = require('./routers/authRoutes');

app.use('/auth', auth)

// --- Login route ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// --- Protected route example ---
app.get('/api/protected', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Expect Bearer <token>
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    res.json({ msg: "Protected data", user: decoded });
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
});

// --- Socket.IO connection ---
io.on("connection", (socket) => {
  console.log("New socket connection:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.get('/', (req, res) => {
  res.send('Server is running!');
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
