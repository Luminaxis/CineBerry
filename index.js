import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();

// Import models
import './models/model.js';
import './models/post.js';
import './models/clip.js';

// Import routes
import authRoutes from './routes/auth.js';
import createPostRoutes from './routes/createPost.js';
import userRoutes from './routes/user.js';
import clipRoutes from './routes/clipRoutes.js';

const app = express();
const port = process.env.PORT || 5000;

// Setting up __dirname for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Middleware for routes
app.use('/auth', authRoutes);
app.use('/posts', createPostRoutes);
app.use('/users', userRoutes);
app.use('/clips', clipRoutes);

const mongoURI = process.env.MONGODB_URL;

if (!mongoURI) {
    console.error("MongoDB URI is not defined in environment variables.");
    process.exit(1);
}

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Successfully connected to MongoDB'))
    .catch(err => {
        console.error('Not connected to MongoDB:', err);
        process.exit(1); // Exit process with failure if connection fails
    });

// Serving the frontend
app.use(express.static(path.join(__dirname, './frontend/build')));

app.get('*', (req, res) => {
    res.sendFile(
        path.join(__dirname, './frontend/build/index.html'),
        function (err) {
            if (err) {
                res.status(500).send(err);
            }
        }
    );
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
