import jwt from "jsonwebtoken"
import { db } from "../libs/db.js";

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized user"
            })
        }
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        }
        catch (error) {
            console.error("Error authenticating user", error)
            res.status(401).json({
                message: "Error authenticating User"
            })
        }
        const user = await db.user.findUnique({
            where: {
                id: decoded.id
            },
            select: {
                id: true, name: true, email: true, role: true
            }
        })

        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error("Error authenticating user", error)
    }
}

export const isAdmin = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await db.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true, name: true, email: true, role: true
            }
        })
        if (!user || user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Access denied: Admins only"
            })
        }
        next()
    }
    catch (error) {
        console.error("Error checking user role", error)
        res.status(401).json({
            message: "Error authenticating User"
        })
    }
}
