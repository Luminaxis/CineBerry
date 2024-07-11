import express from 'express';
import mongoose from 'mongoose';
import requireLogin from '../middleware/requireLogin.js';

const router = express.Router();
const POST = mongoose.model('POST');

router.get('/allposts', requireLogin, async (req, res) => {
    let limit = parseInt(req.query.limit) || 10;
    let skip = parseInt(req.query.skip) || 0;
    try {
        const posts = await POST.find()
            .populate('postedBy', '_id name Photo')
            .populate('comments.postedBy', '_id name')
            .skip(skip)
            .limit(limit)
            .sort('-createdAt');
        res.json(posts);
    } catch (err) {
        console.error('Error fetching all posts:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/createPost', requireLogin, async (req, res) => {
    const { body, pic } = req.body;
    if (!body || !pic) {
        return res.status(422).json({ error: 'Please add all the fields' });
    }
    const post = new POST({
        body,
        photo: pic,
        postedBy: req.user,
    });
    try {
        const result = await post.save();
        res.json({ post: result });
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/myposts', requireLogin, async (req, res) => {
    try {
        const myposts = await POST.find({ postedBy: req.user._id })
            .populate('postedBy', '_id name')
            .populate('comments.postedBy', '_id name')
            .sort('-createdAt');
        res.json(myposts);
    } catch (err) {
        console.error('Error fetching my posts:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/like', requireLogin, async (req, res) => {
    try {
        const result = await POST.findByIdAndUpdate(
            req.body.postId,
            { $push: { likes: req.user._id } },
            { new: true }
        )
        .populate('postedBy', '_id name Photo');
        res.json(result);
    } catch (err) {
        console.error('Error liking post:', err);
        res.status(422).json({ error: 'Server error' });
    }
});

router.put('/unlike', requireLogin, async (req, res) => {
    try {
        const result = await POST.findByIdAndUpdate(
            req.body.postId,
            { $pull: { likes: req.user._id } },
            { new: true }
        )
        .populate('postedBy', '_id name Photo');
        res.json(result);
    } catch (err) {
        console.error('Error unliking post:', err);
        res.status(422).json({ error: 'Server error' });
    }
});

router.put('/comment', requireLogin, async (req, res) => {
    const comment = {
        comment: req.body.text,
        postedBy: req.user._id,
    };
    try {
        const result = await POST.findByIdAndUpdate(
            req.body.postId,
            { $push: { comments: comment } },
            { new: true }
        )
        .populate('comments.postedBy', '_id name')
        .populate('postedBy', '_id name Photo');
        res.json(result);
    } catch (err) {
        console.error('Error commenting on post:', err);
        res.status(422).json({ error: 'Server error' });
    }
});

router.delete('/deletePost/:postId', requireLogin, async (req, res) => {
    try {
        const post = await POST.findOne({ _id: req.params.postId }).populate('postedBy', '_id');
        if (!post) {
            return res.status(422).json({ error: 'Post not found' });
        }

        if (post.postedBy._id.toString() === req.user._id.toString()) {
            await post.deleteOne();
            res.json({ message: 'Successfully deleted' });
        } else {
            res.status(403).json({ error: 'Unauthorized' });
        }
    } catch (err) {
        console.error('Error deleting post:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/myfollowingpost', requireLogin, async (req, res) => {
    try {
        const posts = await POST.find({ postedBy: { $in: req.user.following } })
            .populate('postedBy', '_id name')
            .populate('comments.postedBy', '_id name');
        res.json(posts);
    } catch (err) {
        console.error('Error fetching following posts:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
