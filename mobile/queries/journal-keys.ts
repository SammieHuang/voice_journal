export const journalKeys = {
    all: ['journals'] as const,
    lists: () => [...journalKeys.all, 'list'] as const,
    details: () => [...journalKeys.all, 'detail'] as const,
    detail: (id: string) =>[...journalKeys.details(), id] as const
}