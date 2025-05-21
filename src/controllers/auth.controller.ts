import { Request, Response } from "express"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const JWT_SECRET = process.env.JWT_SECRET

const users: any[] = []; 

const AuthController = {
    register: async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body 

            const hash = await bcrypt.hash(password, 12); 

            users.push({ email, password: hash });

            res.json({message: "User registered"})
        } catch (error) {
            console.error(error);
        }
    }, 
    login: async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body 
            const user = users.find(u => u.email === email); 

            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ error: "Error on user or password" }); 
            }

            const token = jwt.sign({ email: user.email }, JWT_SECRET, {expiresIn: '1h'})

            res.json(token)
        } catch (error) {
            console.error(error);
        }
    }
}

export default AuthController