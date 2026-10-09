import { createClient } from "@supabase/supabase-js";
import ws from 'ws'

require('dotenv').config()

const createUserClient = (accessToken: string) => {
    return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
        realtime: {transport: ws as any}
    })
}

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: { autoRefreshToken: false, persistSession: false },
        realtime:{transport: ws as any}
    }
)

export {createUserClient, supabaseAdmin}