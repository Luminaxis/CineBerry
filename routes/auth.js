import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import requireLogin from '../middleware/requireLogin.js';

const router = express.Router();
const USER = mongoose.model('USER');

router.post('/signup', async (req, res) => {
    const { name, userName, email, password } = req.body;
    if (!name || !email || !userName || !password) {
        return res.status(422).json({ error: 'Please add all the fields' });
    }

    try {
        const savedUser = await USER.findOne({ $or: [{ email: email }, { userName: userName }] });
        if (savedUser) {
            return res.status(422).json({ error: 'User already exists with that email or username' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new USER({
            name,
            email,
            userName,
            password: hashedPassword,
        });

        await user.save();
        res.json({ message: 'Registered successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).json({ error: 'Please add email and password' });
    }

    try {
        const savedUser = await USER.findOne({ email: email });
        if (!savedUser) {
            return res.status(422).json({ error: 'Invalid email' });
        }

        const match = await bcrypt.compare(password, savedUser.password);
        if (match) {
            const token = jwt.sign({ _id: savedUser.id }, process.env.Jwt_secret);
            const { _id, name, email, userName } = savedUser;
            res.json({ token, user: { _id, name, email, userName } });
            console.log({ token, user: { _id, name, email, userName } });
        } else {
            return res.status(422).json({ error: 'Invalid password' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/googleLogin', async (req, res) => {
    const { email_verified, email, name, clientId, userName, Photo } = req.body;

    if (email_verified) {
        try {
            const savedUser = await USER.findOne({ email: email });
            if (savedUser) {
                const token = jwt.sign({ _id: savedUser.id }, process.env.Jwt_secret);
                const { _id, name, email, userName } = savedUser;
                res.json({ token, user: { _id, name, email, userName } });
                console.log({ token, user: { _id, name, email, userName } });
            } else {
                const password = email + clientId;
                const user = new USER({
                    name,
                    email,
                    userName,
                    password: password,
                    Photo,
                });

                await user.save();
                const userId = user._id.toString();
                const token = jwt.sign({ _id: userId }, process.env.Jwt_secret);
                const { _id, name, email, userName } = user;
                res.json({ token, user: { _id, name, email, userName } });
                console.log({ token, user: { _id, name, email, userName } });
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Server error' });
        }
    } else {
        res.status(422).json({ error: 'Email not verified' });
    }
});

export default router;
