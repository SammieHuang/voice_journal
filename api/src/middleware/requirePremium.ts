import { Request, Response, NextFunction } from "express";
import { createUserClient } from "../lib/supabase";

const requirePremium = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
        return res.status(401).json({error: 'Missing token'})
    }

    const supabase = createUserClient(token)
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
        return res.status(401).json({error: 'Invalid token'})
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', user.id)
        .single()
    
    if (profile?.tier !== 'premium') {
        return res.status(403).json({error: 'Premium subscription required'})
    }

    next()
}

export {requirePremium}