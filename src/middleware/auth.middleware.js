import jwt from "jsonwebtoken"
import { db } from "../libs/db.js";

export const authMiddleware = async (req, res, next) => {
    console.log("In auth middleware")
    try {
        console.log(req.cookies)
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
        const user = db.user.findUnique({
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
        req.user = user.spec.args.select;
        next();
    }
    catch (error) {
        console.error("Error authenticating user", error)
    }
}