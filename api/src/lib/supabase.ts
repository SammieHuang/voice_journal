import { createClient } from "@supabase/supabase-js";

require('dotenv').config()

const createUserClient = (accessToken: string) => {
    return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
        global: {headers: {Authorization: `Bearer ${accessToken}`}}
    })
}

export {createUserClient}