import React, { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  category: string
}

interface Voucher {
  code: string
  discount: {
    type: 'percentage' | 'fixed'
    value: number
  }
  minOrder?: number
}

// وده interface تاني بيوصف الحاجات اللي ال CartContext بيقدمها
interface CartContextType {
  items: CartItem[] // مصفوفة فيها كل العناصر اللي في السلة
  voucher: Voucher | null // Add voucher to context
  addToCart: (item: CartItem) => Promise<void> // ফাংশൻ بتضيف عنصر للسلة
  removeFromCart: (itemId: string) => Promise<void> // ফাংশൻ بتمسح عنصر من السلة
  updateQuantity: (itemId: string, quantity: number) => Promise<void> // ফাংশൻ بتعدل كمية عنصر في السلة
  getTotalPrice: () => number // ফাংশൻ بتحسب السعر الإجمالي لكل اللي في السلة
  getTotalItems: () => number // ফাংশൻ بتحسب عدد العناصر اللي في السلة
  clearCart: () => Promise<void>
  applyVoucher: (voucher: Voucher) => Promise<void> // Add method to apply voucher
  removeVoucher: () => Promise<void> // Add method to remove voucher
  isLoading: boolean
  error: string | null
}

// CartContext ده هو الـ context نفسه اللي هنستخدمه في التطبيق
const CART_STORAGE_KEY = '@LabanetaSweets:cart'
const VOUCHER_STORAGE_KEY = '@LabanetaSweets:voucher'
const MAX_QUANTITY_PER_ITEM = 99
const MIN_ORDER_AMOUNT = 50

const CartContext = createContext<CartContextType | undefined>(undefined)

// CartProvider ده কম্পোনেন্ট اللي بيوفر ال CartContext لكل ال কম্পোনেন্ট اللي تحته
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  // دى স্টেট فيها كل العناصر اللى فى السلة
  const [items, setItems] = useState<CartItem[]>([])
  const [voucher, setVoucher] = useState<Voucher | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load cart data from AsyncStorage when app starts
  useEffect(() => {
    loadCartData()
  }, [])

  const loadCartData = async () => {
    try {
      const [savedCart, savedVoucher] = await Promise.all([
        AsyncStorage.getItem(CART_STORAGE_KEY),
        AsyncStorage.getItem(VOUCHER_STORAGE_KEY)
      ])
      
      if (savedCart) {
        setItems(JSON.parse(savedCart))
      }
      if (savedVoucher) {
        setVoucher(JSON.parse(savedVoucher))
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

  // Save voucher data to AsyncStorage
  const saveVoucherData = async (voucherData: Voucher | null) => {
    try {
      if (voucherData) {
        await AsyncStorage.setItem(VOUCHER_STORAGE_KEY, JSON.stringify(voucherData))
      } else {
        await AsyncStorage.removeItem(VOUCHER_STORAGE_KEY)
      }
    } catch (err) {
      setError('Failed to save voucher data')
      console.error('Error saving voucher:', err)
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

  const applyVoucher = async (newVoucher: Voucher) => {
    try {
      setError(null)
      const subtotal = getTotalPrice()
      
      // Check minimum order amount if specified
      if (newVoucher.minOrder && subtotal < newVoucher.minOrder) {
        setError(`Minimum order amount of AED${newVoucher.minOrder} required`)
        return
      }

      setVoucher(newVoucher)
      await saveVoucherData(newVoucher)
    } catch (err) {
      setError('Failed to apply voucher')
      console.error('Error applying voucher:', err)
    }
  }

  const removeVoucher = async () => {
    try {
      setError(null)
      setVoucher(null)
      await saveVoucherData(null)
    } catch (err) {
      setError('Failed to remove voucher')
      console.error('Error removing voucher:', err)
    }
  }

  // ফাংশൻ بتحسب السعر الإجمالي لكل اللي في السلة
  const getTotalPrice = () => {
    const subtotal = Number(items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2))
    
    if (!voucher) return subtotal

    // Apply discount
    if (voucher.discount.type === 'percentage') {
      const discount = subtotal * (voucher.discount.value / 100)
      return Number((subtotal - discount).toFixed(2))
    } else {
      return Number((subtotal - voucher.discount.value).toFixed(2))
    }
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
      voucher,
      addToCart, // ফাংশൻ إضافة عنصر
      removeFromCart, // ফাংশൻ مسح عنصر
      updateQuantity, // ফাংশൻ تعديل الكمية
      getTotalPrice, // ফাংশൻ حساب السعر الإجمالي
      getTotalItems, // ফাংশൻ حساب عدد العناصر
      clearCart,
      applyVoucher,
      removeVoucher,
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