import express from 'express';
import mongoose from 'mongoose';
const router = express.Router();
import requireLogin from '../middleware/requireLogin.js';

const CLIP = mongoose.model("CLIP")

router.post('/createClip', requireLogin, async (req, res) => {
    const { description, video } = req.body;
    if (!description || !video) {
        return res.status(422).json({ error: 'Please add all the fields' });
    }
    const clip = new CLIP({
        description,
        video,
        postedBy: req.user,
    });
    try {
        const result = await clip.save();
        res.json({ clip: result });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/myclips', requireLogin, async (req, res) => {
    try {
        const myclips = await CLIP.find({ postedBy: req.user._id })
            .populate('postedBy', '_id name')
            .populate('comments.postedBy', '_id name')
            .sort('-createdAt');
        res.json(myclips);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/allclips', requireLogin, async (req, res) => {
    let limit = parseInt(req.query.limit);
    let skip = parseInt(req.query.skip);
    try {
        const clips = await CLIP.find()
            .populate('postedBy', '_id name Photo')
            .populate('comments.postedBy', '_id name')
            .skip(skip)
            .limit(limit)
            .sort('-createdAt');
        res.json(clips);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/likeClip', requireLogin, async (req, res) => {
    try {
        const result = await CLIP.findByIdAndUpdate(
            req.body.postId,
            { $push: { likes: req.user._id } },
            { new: true }
        )
        .populate('postedBy', '_id name Photo');
        res.json(result);
    } catch (err) {
        console.log(err);
        res.status(422).json({ error: 'Server error' });
    }
});

router.put('/unlikeClip', requireLogin, async (req, res) => {
    try {
        const result = await CLIP.findByIdAndUpdate(
            req.body.postId,
            { $pull: { likes: req.user._id } },
            { new: true }
        )
        .populate('postedBy', '_id name Photo');
        res.json(result);
    } catch (err) {
        console.log(err);
        res.status(422).json({ error: 'Server error' });
    }
});

router.put('/commentClip', requireLogin, async (req, res) => {
    const comment = {
        comment: req.body.text,
        postedBy: req.user._id,
    };
    try {
        const result = await CLIP.findByIdAndUpdate(
            req.body.postId,
            { $push: { comments: comment } },
            { new: true }
        )
        .populate('comments.postedBy', '_id name')
        .populate('postedBy', '_id name Photo');
        res.json(result);
    } catch (err) {
        console.log(err);
        res.status(422).json({ error: 'Server error' });
    }
});

router.delete('/deleteClip/:postId', requireLogin, async (req, res) => {
    try {
        const clip = await CLIP.findOne({ _id: req.params.postId }).populate('postedBy', '_id');
        if (!clip) {
            return res.status(422).json({ error: 'Clip not found' });
        }

        if (clip.postedBy._id.toString() === req.user._id.toString()) {
            await clip.deleteOne();
            res.json({ message: 'Successfully deleted' });
        } else {
            res.status(403).json({ error: 'Unauthorized' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/myfollowingclips', requireLogin, async (req, res) => {
    try {
        const clips = await CLIP.find({ postedBy: { $in: req.user.following } })
            .populate('postedBy', '_id name')
            .populate('comments.postedBy', '_id name');
        res.json(clips);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server error' });
    }
});


export default router;
