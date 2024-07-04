import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const USER = mongoose.model('USER');

const requireLogin = (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ error: 'You must be logged in 1' });
    }
    const token = authorization.replace('Bearer ', '');
    jwt.verify(token, process.env.Jwt_secret, (err, payload) => {
        if (err) {
            return res.status(401).json({ error: 'You must be logged in 2' });
        }
        const { _id } = payload;
        USER.findById(_id).then(userData => {
            req.user = userData;
            next();
        });
    });
};

export default requireLogin;
