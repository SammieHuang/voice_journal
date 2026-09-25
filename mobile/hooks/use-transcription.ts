import { useLocalTranscribe } from "./use-local-transcribe";
import { useCloudTranscribe } from "./use-cloud-transcribe";
import { useProfileQuery } from "./use-profile-query";

const useTranscription = () => {
    const local = useLocalTranscribe()
    const cloud = useCloudTranscribe()
    const { data } = useProfileQuery()
    
    return data?.tier === 'premium' ? cloud : local
}

export {useTranscription}