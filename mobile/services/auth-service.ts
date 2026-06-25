import { supabase } from "./supabase";
import { UserCredential } from "@/types/AppUser";

const signUp = async (
    {email,password}:UserCredential
) => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        })
        if (error) throw error

        return data
        
    } catch (err) {
        throw err
        
    }
};

const logIn = async ({ email, password }: UserCredential) => {
    try {
      console.log(email, password)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  } catch (err) {
    throw err;
  }
};

const logOut = async () => {
    try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error;
    } catch (err) {
        console.log("Failed to log out", err)
        throw err
    }
};

const getCurrentUser = async () => {
    const {
        data: { user },
        error
    } = await supabase.auth.getUser()
    if (error) {
        console.log('No current user', error.message)
        return null
    } 
    return user
};
 
const requireAuth = async () => {
    const { data: { session }
    } = await supabase.auth.getSession()

    return session?.user ?? null
}

export { signUp, logIn, logOut, getCurrentUser, requireAuth}

