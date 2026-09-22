import { useSpeechToText, models } from "react-native-executorch";
import { decodeAudioData } from "react-native-audio-api";

const useLocalTranscribe = () => {
    const stt = useSpeechToText(models.speechToText.WHISPER.EN.SMALL.DEFAULT)

    const transcribe = async (uri: string) => {
        if (!stt.transcribe) {
            throw new Error('Local transcription model is not ready')
        }

        const audioBuffer = await decodeAudioData(uri, 16000)
        const audio = audioBuffer.getChannelData(0)
        return stt.transcribe(audio, {language: 'en'})
    }

    return {isReady: stt.isReady, transcribe}
    
}

export {useLocalTranscribe}