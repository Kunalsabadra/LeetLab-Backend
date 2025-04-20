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
            res.status(400).jsoon({
                error: "User already Exist"
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword,
                role: UserRole.USER
            }
        })
        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRERT, {
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

export const login = async (req, res) => { }

export const logout = async (req, res) => { }

export const check = async (req, res) => { }

