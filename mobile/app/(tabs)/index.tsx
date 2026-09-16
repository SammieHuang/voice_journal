import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { supabase } from "@/services/supabase";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import {type SwipeableMethods,} from "react-native-gesture-handler/ReanimatedSwipeable";
import { JournalRow, EmptyJournalsState } from "@/components";
import { useJournalsQuery } from "@/hooks/use-journals-query";
import { useDeleteJournalMutation} from "@/hooks/use-journal-mutations";
import { useQueryClient } from "@tanstack/react-query";
import { journalKeys } from "@/queries/journal-keys";


export default function JournalsScreen() {
  const { data: journals = [] } = useJournalsQuery()
  const deleteJournalMutation = useDeleteJournalMutation()
  const queryClient = useQueryClient()
  const openedSwipeableRef = useRef<SwipeableMethods | null>(null)

  const closeOpenedSwipeable = () => {
    openedSwipeableRef.current?.close()
    openedSwipeableRef.current = null
  }

  const handleSwipeableOpen = (ref: SwipeableMethods) => {
    if (openedSwipeableRef.current && openedSwipeableRef.current !== ref) {
      openedSwipeableRef.current.close()
    }
    openedSwipeableRef.current = ref
  }

  const handleDelete = (id: string) => {
    deleteJournalMutation.mutate(id)
  }
  const renderRightAction = (id: string) => {
    return (
      <View style={styles.actions}>
        <Pressable
          style={[styles.actionButton, styles.editButton]}
          onPress={() => {
            closeOpenedSwipeable()
            
            router.push({
              pathname: "/journal/[id]",
              params: { id, mode: 'edit' }
            })
          }}
        >
          <Text style={styles.actionText}>Edit</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(id)}
        >
          <Text style={styles.actionText}>Delete</Text>
        </Pressable>
      </View>
    );
  }

  useEffect(() => {
    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        queryClient.setQueryData(journalKeys.lists(), [])
        queryClient.removeQueries({queryKey: journalKeys.details()})
      } else {
        queryClient.invalidateQueries({queryKey: journalKeys.lists()})
      }
    })
    return () => subscription.unsubscribe()
  }, [queryClient])

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Journals</Text>

      <FlatList
        data={journals}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyJournalsState onStartRecording={()=>router.push('/new')} />
        }
        renderItem={({ item }) => (
          <JournalRow
            journal={item}
            renderRightAction={renderRightAction}
            onOpen={handleSwipeableOpen}
            closeOpenedSwipeable={closeOpenedSwipeable}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F1DD",
    paddingHorizontal: 24,
    paddingTop: 72,
  },
  title: {
    fontFamily: "SpecialElite_400Regular",
    fontSize: 32,
    color: "#3D3125",
    marginBottom: 24,
  },
  emptyText: {
    color: "#8A6F4D",
    fontSize: 18,
    textAlign: "center",
    marginTop: 80,
  },
  card: {
    backgroundColor: "#FFF8E8",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  date: {
    color: "#8A6F4D",
    fontSize: 14,
    marginBottom: 8,
  },
  transcript: {
    color: "#3D3125",
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    flexDirection: "row",
    marginBottom: 16,
  },
  actionButton: {
    width: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    backgroundColor:"#C8B08A",
  },
  deleteButton: {
    backgroundColor: "#C95C4A",
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
  actionText: {
    color: "white",
    fontWeight: "700",
  },
});
