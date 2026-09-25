import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";

const useProfileQuery = () => {
    return useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return { tier: 'free' as const }
            
            const { data, error } = await supabase
                .from('profiles')
                .select('tier')
                .eq('id', user.id)
                .single()
            if (error) return { tier: 'free' as const }
            return data
        }
    })
}

export {useProfileQuery}