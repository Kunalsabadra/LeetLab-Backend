import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'
import problemRoutes from './routes/problem.routes.js';

import authRoutes from './routes/auth.routes.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get('/api/v1/test', (req, res) => {
    res.send({
        message: "Server Connected at test route",
        status: 200

    })
})

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/problems", problemRoutes);



app.listen((process.env.PORT || 3000), () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
})
