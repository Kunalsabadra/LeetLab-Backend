import bcrypt from 'bcryptjs'
import { db } from '../libs/db.js'
import { UserRole } from '../generated/prisma/index.js'
import jwt from 'jsonwebtoken'

export const register = async (req, res) => {
    const { name, email, password } = req.body
    try {
        const existUser = await db.user.findUnique({
            where: {
                email: email
            }
        })
        if (existUser) {
            res.status(400).json({
                error: "User already Exist"
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword,
                role: UserRole.ADMIN
            }
        })
        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        })
        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 1000 * 60 * 60 * 24
        })
        res.status(201).json({
            message: "User created Successfully",
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role
            }
        })
    }
    catch (error) {
        console.error("Error while creating User", error);
        res.status(500).json({
            error: "Error Creating User"
        })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Please fill all the required fields" });
    }
    try {
        const user = await db.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            res.status(401).json({ message: "User Not Found" });
        }

        const isVerified = await bcrypt.compare(password, user.password);
        if (!isVerified) {
            res.status(400).json({ message: "Invalid Credentials" });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' })
        res.cookie('jwt', token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 1000 * 60 * 60 * 24
        })
        res.status(201).json({
            message: "User log in Successfully",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        })
    }
    catch (error) {
        console.error("Error while logging in  User", error);
        res.status(500).json({
            error: "Error logging in User"
        })
    }

}

export const logout = async (req, res) => {
    try {
        res.clearCookie('jwt', {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 1000 * 60 * 60 * 24
        })
        res.status(204).json({
            message: "User Logged out successfully"
        })
    }
    catch (error) {
        console.error("Error while logging out  User", error);
        res.status(500).json({
            error: "Error Creating User"
        })
    }
}

export const check = async (req, res) => {
    try {
        res.status(200).json({
            message: "User authenticated successfully",
            success: true,
            user: req.user
        })
    }
    catch (err) {
        res.status(400).json({
            message: "Error occured while authenticating user"
        })
    }
}

