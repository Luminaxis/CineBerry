import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import './models/model.js'; // Import other models if needed
import './models/post.js'; // Example: Importing Post model
import './models/clip.js'; // Importing Clip model
import authRoutes from './routes/auth.js';
import createPostRoutes from './routes/createPost.js';
import userRoutes from './routes/user.js';
import clipRoutes from './routes/clipRoutes.js'; // Import clip routes

// Configure dotenv
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Setting up __dirname for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Middleware for routes
app.use(authRoutes);
app.use(createPostRoutes);
app.use(userRoutes);
app.use(clipRoutes); // Use clip routes

const mongoURI = process.env.MONGODB_URL;

if (!mongoURI) {
    console.error("MongoDB URI is not defined in environment variables.");
    process.exit(1); // Exit process with failure
}

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('connected', () => {
    console.log('Successfully connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Not connected to MongoDB:', err);
});

// Serving the frontend
app.use(express.static(path.join(__dirname, './frontend/build')));

app.get('*', (req, res) => {
    res.sendFile(
        path.join(__dirname, './frontend/build/index.html'),
        function (err) {
            res.status(500).send(err);
        }
    );
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
