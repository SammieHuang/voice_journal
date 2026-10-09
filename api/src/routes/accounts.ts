import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { supabaseAdmin } from "../lib/supabase";

const accountRouter = Router()

accountRouter.delete('/', requireAuth, async (_req, res) => {
    const userId = res.locals.user.id

    const { error: journalsError } = await supabaseAdmin
        .from('journals').delete().eq('user_id', userId)
    if (journalsError) {
        return res.status(500).json({error:'Failed to delete journals'})
    }

    const { error: profileError } = await supabaseAdmin
        .from('profiles').delete().eq('id', userId)
    if (profileError) {
        return res.status(500).json({error:'Failed to delete profile'})
    }

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (authError) {
        return res.status(500).json({error: 'Failed to delete account'})
    }

    res.json({ok: true})
})

export {accountRouter}