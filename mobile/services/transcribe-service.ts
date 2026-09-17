import {File} from "expo-file-system"

async function transcribeAudio(uri: string) {
    const formData = new FormData()
    const API_BASE_URL = "http://192.168.4.70:3000";

    const audioFile = new File(uri)
    formData.append('audio', audioFile, 'recording.m4a')

    const response = await fetch(`${API_BASE_URL}/transcribe`, {
        method: 'POST',
        body: formData
    })

    if (!response.ok) {
        throw new Error('Failed to fetch audio')
    }

    const data = await response.json()
    
    return data.message
    
}

export{transcribeAudio}