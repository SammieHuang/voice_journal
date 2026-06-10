async function transcribeAudio(uri: string) {
    const formData = new FormData()

    formData.append(
        'audio', 
        {
            uri: uri,
            name: 'recording.m4a',
            type:'audio/m4a'
        } as any
    )

    const response = await fetch(uri, {
        method: 'POST',
        body: formData
    })

    if (!response.ok) {
        throw new Error('Failed to fetch audio')
    }

    const data = await response.json()
    
    return data.text
    
}

export{transcribeAudio}