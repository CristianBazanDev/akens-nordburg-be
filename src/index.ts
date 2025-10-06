import express from 'express';
import dotenv from 'dotenv';
import UserRouter from './routes/user.router';
import AuthRouter from './routes/auth.router';
import cors from 'cors';
import { authMiddleware } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(
  cors({
    origin: process.env.FE_URL,
    credentials: true,
  })
);



// Routes
app.use('/api/auth', AuthRouter);
app.use('/api/user', UserRouter);

// Middlewares

app.listen(PORT, () => {
  console.log(`Server ON http://localhost:${PORT}`);
});
