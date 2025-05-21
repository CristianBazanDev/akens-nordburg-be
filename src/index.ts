import express from 'express';
import dotenv from 'dotenv';
import UserRouter from './routes/user.router';
import AuthRouter from './routes/auth.router';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use('/api/auth', AuthRouter);
app.use('/api/user', UserRouter);

app.listen(PORT, () => {
  console.log(`Server ON http://localhost:${PORT}`);
});
