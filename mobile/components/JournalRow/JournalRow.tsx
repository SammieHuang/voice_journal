/** @format */

import { useRef } from "react";
import Swipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import { router } from "expo-router";
import { Journal } from "@/types/journal";
import { JournalCard } from "@/components/JournalCard/JournalCard";

type JournalRowProps = {
    journal: Journal,
    renderRightAction: (id: string) => React.ReactNode,
    onOpen: (ref: SwipeableMethods) => void,
    closeOpenedSwipeable: ()=>void
}

export function JournalRow(
    {journal,
     renderRightAction,
     onOpen,
     closeOpenedSwipeable
    }: JournalRowProps) {
    
    const swipeableRef = useRef<SwipeableMethods | null>(null)

    
    return (
        <Swipeable
            ref={swipeableRef}
            renderRightActions={() => renderRightAction(journal.id)}
            onSwipeableOpen={() => {
                if (swipeableRef.current) {
                    onOpen(swipeableRef.current)
                }
            }}
        >
            <JournalCard
                onPress={() => {
                    closeOpenedSwipeable()
                    router.push({
                        pathname: "/journal/[id]",
                        params:{id: journal.id, mode: 'view'}
                    })
                }}
                journal={journal}    
            />

        </Swipeable>

    )
}