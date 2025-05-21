import { Request, Response } from "express"
import Messages from "../constants/messages"

const UserController = {
    getUser: async (req: Request, res: Response): Promise<void> => {
        try {
        console.log("Get user")

        res.json("Getting user")

        } catch(error){
            console.error("Error in getUser:", error);
            res.status(500).json({message: Messages.USER.LOGGIN_ERROR})
        }
    }
}

export default UserController