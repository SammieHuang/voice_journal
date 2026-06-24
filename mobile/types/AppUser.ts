export type AppUser = {
    id: string,
    email: string,
    userName:string,
    createdAt?: string,
}

export type UserProfile = {
    id: string,
    userName: string,
    createdAt: string,
}

export type UserCredential = {
    email: string,
    password: string
}