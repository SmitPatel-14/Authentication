import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './utils/db.js';
import UserRoutes from "./routes/User.routes.js"

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.BASE_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.get('/smit', (req, res) => {
    res.send('Hello smit!');
});
app.get('/everyone', (req, res) => {
    res.send('Hello Everyone!');
});

    
app.use('/api/v1/users',UserRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});