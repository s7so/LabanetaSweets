import React, { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface User {
  id: string
  name: string
  phone: string
  email?: string
  points: number
  profileImage?: string | null
}

interface UserContextType {
  user: User | null
  updateUser: (newUser: Partial<User>) => Promise<void>
  logout: () => Promise<void>
}

const UserContext = createContext<UserContextType>({} as UserContextType)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user')
        if (storedUser) setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }
    
    loadUserData()
  }, [])

  const updateUser = async (newUser: Partial<User>) => {
    try {
      const updatedUser = { ...user, ...newUser } as User
      setUser(updatedUser)
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser))
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user')
      setUser(null)
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <UserContext.Provider value={{ user, updateUser, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext) 