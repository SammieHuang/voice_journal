async function transcribeAudio(uri: string) {
    const formData = new FormData()
    const API_BASE_URL = "http://192.168.4.70:3000";

    formData.append(
        'audio', 
        {
            uri: uri,
            name: 'recording.m4a',
            type:'audio/m4a'
        } as any
    )

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