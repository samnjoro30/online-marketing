const cors = require('cors');
const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const socketIo =require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const User = require('./models/User');


app.use(express.json());
app.use(cors({ origin: ['http://localhost:5500'] }));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("MongoDB connection error: ", err));


const server = http.createServer(app);
const io = socketIo(server);
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    try {
    
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        user = new User({ email, password: hashedPassword });
        await user.save();

        res.status(201).json({ msg: "User registered successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

// User Login Route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});
io.on("connection", (socket) => {
    console.log("New socket connection: ", socket.id);
    
    socket.on("disconnect", () => {
        console.log("Socket disconnected: ", socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`server running on port ${PORT} `));