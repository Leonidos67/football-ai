"use client"

import { createContext, useContext } from "react"

interface AuthContextType {
  user: null
  loading: false
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        user: null,
        loading: false,
        logout: () => {
          console.log("[Auth] logout disabled")
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}