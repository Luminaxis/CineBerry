import express from 'express';
import mongoose from 'mongoose';
import requireLogin from '../middleware/requireLogin.js';

const router = express.Router();
const POST = mongoose.model('POST');
const USER = mongoose.model('USER');
const CLIP = mongoose.model('CLIP')

// to get user profile

router.get('/user/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // Fetch user details (excluding password)
        const user = await USER.findOne({ _id: userId }).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch posts by the user
        const posts = await POST.find({ postedBy: userId }).populate('postedBy', '_id name');

        // Fetch clips by the user
        const clips = await CLIP.find({ postedBy: userId }).populate('postedBy', '_id name');

        res.status(200).json({ user, posts, clips });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


// to follow user
router.put('/follow', requireLogin, async (req, res) => {
    try {
        await USER.findByIdAndUpdate(req.body.followId, { $push: { followers: req.user._id } }, { new: true });
        const result = await USER.findByIdAndUpdate(req.user._id, { $push: { following: req.body.followId } }, { new: true });
        res.json(result);
    } catch (err) {
        return res.status(422).json({ error: err });
    }
});

// to unfollow user
router.put('/unfollow', requireLogin, async (req, res) => {
    try {
        await USER.findByIdAndUpdate(req.body.followId, { $pull: { followers: req.user._id } }, { new: true });
        const result = await USER.findByIdAndUpdate(req.user._id, { $pull: { following: req.body.followId } }, { new: true });
        res.json(result);
    } catch (err) {
        return res.status(422).json({ error: err });
    }
});

// to upload profile pic
router.put('/uploadProfilePic', requireLogin, async (req, res) => {
    try {
        const result = await USER.findByIdAndUpdate(req.user._id, { $set: { Photo: req.body.pic } }, { new: true });
        res.json(result);
    } catch (err) {
        return res.status(422).json({ error: err });
    }
});

export default router;
