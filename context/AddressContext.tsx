import React, { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface Address {
  id: string
  title: string
  address: string
  isDefault: boolean
  latitude: number
  longitude: number
}

interface AddressContextType {
  addresses: Address[]
  defaultAddress: Address | null
  loadAddresses: () => void
  addAddress: (address: Omit<Address, 'id' | 'isDefault'>) => string
  updateAddress: (id: string, address: Partial<Address>) => void
  deleteAddress: (id: string) => void
  setDefaultAddress: (id: string) => void
}

const AddressContext = createContext<AddressContextType | undefined>(undefined)

export const AddressProvider = ({ children }: { children: React.ReactNode }) => {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [defaultAddressId, setDefaultAddressId] = useState<string | null>(null)

  const loadAddresses = () => {
    // TODO: Replace with real API call
    const mockAddresses = [
      {
        id: '1',
        title: 'Home',
        address: 'Al Ain khalifa street building 18, apartment 301',
        isDefault: true,
        latitude: 0,
        longitude: 0
      }
    ]
    setAddresses(mockAddresses)
    setDefaultAddressId(mockAddresses.find(a => a.isDefault)?.id || null)
  }

  const addAddress = (newAddress: Omit<Address, 'id' | 'isDefault'>): string => {
    const id = Math.random().toString(36).substr(2, 9)
    // Mark all existing addresses as non-default and add new address as default
    setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: false })).concat({ ...newAddress, id, isDefault: true }))
    setDefaultAddressId(id)
    return id
  }

  const updateAddress = (id: string, updates: Partial<Address>) => {
    setAddresses(prev => 
      prev.map(address => 
        address.id === id ? { ...address, ...updates } : address
      )
    )
  }

  const deleteAddress = (id: string) => {
    setAddresses(prev => {
      const newAddresses = prev.filter(address => address.id !== id);
      // If the deleted address was the default
      if (prev.find(a => a.id === id)?.isDefault && newAddresses.length > 0) {
        // Set the first address as default
        newAddresses[0].isDefault = true;
        setDefaultAddressId(newAddresses[0].id);
      }
      return newAddresses;
    });
  }

  const setDefaultAddress = (id: string) => {
    setAddresses(prev =>
      prev.map(address => ({
        ...address,
        isDefault: address.id === id,
      }))
    )
    setDefaultAddressId(id)
  }

  useEffect(() => {
    const loadSavedAddresses = async () => {
      try {
        const savedAddresses = await AsyncStorage.getItem('addresses');
        if (savedAddresses) {
          const parsedAddresses = JSON.parse(savedAddresses) as Address[];
          setAddresses(parsedAddresses);
          setDefaultAddressId(parsedAddresses.find(a => a.isDefault)?.id || null);
        }
      } catch (error) {
        console.error('Error loading addresses:', error);
      }
    };
    
    loadSavedAddresses();
  }, []);

  return (
    <AddressContext.Provider
      value={{
        addresses,
        defaultAddress: addresses.find(address => address.id === defaultAddressId) || null,
        loadAddresses,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress
      }}
    >
      {children}
    </AddressContext.Provider>
  )
}

export const useAddress = () => {
  const context = useContext(AddressContext)
  if (context === undefined) {
    throw new Error('useAddress must be used within an AddressProvider')
  }
  return context
} 