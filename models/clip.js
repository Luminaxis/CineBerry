import mongoose from 'mongoose';

const { ObjectId } = mongoose.Schema.Types;

const clipSchema = new mongoose.Schema(
    {
        description: {
            type: String,
            required: true,
        },
        video: {
            type: String,
            required: true,
        },
        likes: [{ type: ObjectId, ref: 'USER' }],
        comments: [
            {
                comment: { type: String },
                postedBy: { type: ObjectId, ref: 'USER' },
            },
        ],
        postedBy: {
            type: ObjectId,
            ref: 'USER',
        },
    },
    { timestamps: true }
);

mongoose.model('CLIP', clipSchema);
