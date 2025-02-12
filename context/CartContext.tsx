import React, { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  category: string
}

// وده interface تاني بيوصف الحاجات اللي ال CartContext بيقدمها
interface CartContextType {
  items: CartItem[] // مصفوفة فيها كل العناصر اللي في السلة
  addToCart: (item: CartItem) => Promise<void> // ফাংশൻ بتضيف عنصر للسلة
  removeFromCart: (itemId: string) => Promise<void> // ফাংশൻ بتمسح عنصر من السلة
  updateQuantity: (itemId: string, quantity: number) => Promise<void> // ফাংশൻ بتعدل كمية عنصر في السلة
  getTotalPrice: () => number // ফাংশൻ بتحسب السعر الإجمالي لكل اللي في السلة
  getTotalItems: () => number // ফাংশൻ بتحسب عدد العناصر اللي في السلة
  clearCart: () => Promise<void>
  isLoading: boolean
  error: string | null
}

// CartContext ده هو الـ context نفسه اللي هنستخدمه في التطبيق
const CART_STORAGE_KEY = '@LabanetaSweets:cart'
const MAX_QUANTITY_PER_ITEM = 99
const MIN_ORDER_AMOUNT = 50

const CartContext = createContext<CartContextType | undefined>(undefined)

// CartProvider ده কম্পোনেন্ট اللي بيوفر ال CartContext لكل ال কম্পোনেন্ট اللي تحته
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  // دى স্টেট فيها كل العناصر اللى فى السلة
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load cart data from AsyncStorage when app starts
  useEffect(() => {
    loadCartData()
  }, [])

  const loadCartData = async () => {
    try {
      const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY)
      if (savedCart) {
        setItems(JSON.parse(savedCart))
      }
    } catch (err) {
      setError('Failed to load cart data')
      console.error('Error loading cart:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Save cart data to AsyncStorage whenever it changes
  const saveCartData = async (cartItems: CartItem[]) => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
    } catch (err) {
      setError('Failed to save cart data')
      console.error('Error saving cart:', err)
    }
  }

  // ফাংশൻ بتضيف عنصر للسلة
  const addToCart = async (newItem: CartItem) => {
    try {
      setError(null)
      setItems(currentItems => {
        const existingItem = currentItems.find(item => item.id === newItem.id)
        let updatedItems: CartItem[]

        if (existingItem) {
          const newQuantity = existingItem.quantity + newItem.quantity
          
          // Check if new quantity exceeds maximum
          if (newQuantity > MAX_QUANTITY_PER_ITEM) {
            setError(`Maximum quantity per item is ${MAX_QUANTITY_PER_ITEM}`)
            return currentItems
          }

          updatedItems = currentItems.map(item =>
            item.id === newItem.id
              ? { ...item, quantity: newQuantity }
              : item
          )
        } else {
          updatedItems = [...currentItems, newItem]
        }

        // Save to AsyncStorage
        saveCartData(updatedItems)
        return updatedItems
      })
    } catch (err) {
      setError('Failed to add item to cart')
      console.error('Error adding to cart:', err)
    }
  }

  // ফাংশൻ بتمسح عنصر من السلة
  const removeFromCart = async (itemId: string) => {
    try {
      setError(null)
      const updatedItems = items.filter(item => item.id !== itemId)
      setItems(updatedItems)
      await saveCartData(updatedItems)
    } catch (err) {
      setError('Failed to remove item from cart')
      console.error('Error removing from cart:', err)
    }
  }

  // ফাংশൻ بتعدل كمية عنصر في السلة
  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      setError(null)
      
      // Validate quantity
      if (quantity < 1) {
        setError('Quantity cannot be less than 1')
        return
      }
      if (quantity > MAX_QUANTITY_PER_ITEM) {
        setError(`Maximum quantity per item is ${MAX_QUANTITY_PER_ITEM}`)
        return
      }

      const updatedItems = items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
      setItems(updatedItems)
      await saveCartData(updatedItems)
    } catch (err) {
      setError('Failed to update quantity')
      console.error('Error updating quantity:', err)
    }
  }

  const clearCart = async () => {
    try {
      setError(null)
      setItems([])
      await AsyncStorage.removeItem(CART_STORAGE_KEY)
    } catch (err) {
      setError('Failed to clear cart')
      console.error('Error clearing cart:', err)
    }
  }

  // ফাংশൻ بتحسب السعر الإجمالي لكل اللي في السلة
  const getTotalPrice = () => {
    return Number(items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2))
  }

  // ফাংশൻ بتحسب عدد العناصر اللي في السلة
  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const canPlaceOrder = () => {
    return getTotalPrice() >= MIN_ORDER_AMOUNT
  }

  return (
    <CartContext.Provider value={{
      items, // العناصر اللي في السلة
      addToCart, // ফাংশൻ إضافة عنصر
      removeFromCart, // ফাংশൻ مسح عنصر
      updateQuantity, // ফাংশൻ تعديل الكمية
      getTotalPrice, // ফাংশൻ حساب السعر الإجمالي
      getTotalItems, // ফাংশൻ حساب عدد العناصر
      clearCart,
      isLoading,
      error,
    }}>
      {children}
    </CartContext.Provider>
  )
}

// ده هوك مخصص عشان نستخدم ال CartContext بسهولة
export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}