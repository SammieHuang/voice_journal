import { transcribeAudio } from "@/services/transcribe-service";

const useCloudTranscribe = () => {
    const transcribe = async (uri: string) => {
        return transcribeAudio(uri)
    }

    return {isReady: true, transcribe}
}

export {useCloudTranscribe}