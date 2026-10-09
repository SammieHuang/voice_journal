import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../lib/supabase";    

const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
        return res.status(401).json({error: 'Missing token'})
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !user) {
        return res.status(401).json({error: 'Invalid token'})
    }

    res.locals.user = user
    next()
}

export {requireAuth}