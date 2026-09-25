import { File } from "expo-file-system"
import { supabase } from "./supabase";

async function transcribeAudio(uri: string) {
    const formData = new FormData()
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

    const audioFile = new File(uri)
    formData.append('audio', audioFile, 'recording.m4a')

    const {data: {session}} = await supabase.auth.getSession()

    const response = await fetch(`${API_BASE_URL}/transcribe`, {
        method: 'POST',
        body: formData, 
        headers: {
            Authorization: `Bearer ${session?.access_token}`
        }
    })

    if (!response.ok) {
        throw new Error('Failed to fetch audio')
    }

    const data = await response.json()
    
    return data.message
    
}

export{transcribeAudio}