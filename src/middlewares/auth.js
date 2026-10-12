import { User } from '../models/user.model.js';
import jwt from 'jsonwebtoken';

const protectedRoute = async (req, res, next) => {
    try {

        const token = req.cookies?.token;

        if (!token) return res.status(401).json({ message: "Not authorized" });
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            console.log(error);
            return res.status(401).json({ message: "Token verification failed." });
        }
        req.user = await User.findById(decoded.id).select('-password');

        next();
    } catch (error) {
        console.log(error);
        return res.status(404).json({ message: "Internal server error." });
    }

};

const restrictTo = (role) => {
    return async (req, res, next) => {
        try {
            if (!role.includes(req.user.role)) {
                return res.status(404).json({ message: "Not authorized." });
            }
            next();
        } catch (error) {
            console.log(error)
            return res.status(404).json({ message: "Token verification failed" });
        }
    }
}

export { protectedRoute, restrictTo };