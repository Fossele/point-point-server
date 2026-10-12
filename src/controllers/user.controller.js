
import { User } from "../models/user.model.js";
import createToken from "../utils/createToken.js";
//import nodemailer from "nodemailer";
//import crypto from 'crypto';
//https://www.mindstudio.ai/blog/how-to-add-authentication-web-app





const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(404).json({ message: "username, password or email is missing." });
        }

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(404).json({ message: "User already exists.", success: false })
        }

        const user = await User.create({ username, email: email.toLowerCase(), password });
    
        return res.status(201).json({ message: 'User successfully created.', success: true})

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}



const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(401).json({ message: "email and password are required." });
        }

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(400).json({ message: "User do not exist." });
        }


        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(405).json({ message: "Wrong password." });
        }

        const token = createToken(user._id);
        res.cookie('token', token, {
            maxAge: 7 * 24 * 60 * 60 * 60,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        return res.status(200).json({ message: 'User successfully logged in.', success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' })
    }
}

const logOut = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(404).json({ message: "email is missing." });
        }

        const user = await User.findOne({ email: email.toLowerCase() })
        if (!user) {
            return res.status(400).json({ message: "User do not exist." });
        }


        res.cookie('token', "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            expiresIn: new Date(0)
        });
        return res.status(200).json({ message: "User logged out" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' })
    }
}

/*
const sendVerificationEmail = async (userId, email) => {
    try {
        const code = crypto.randomBytes(32).toString('hex');
        const expiresIn = new Date(Date.now()+60*60*1000) //1 hour to expires
        await 
    
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


*/
export {
    logOut, login, register
}