import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Alert, Platform, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useCart } from '@/context/CartContext'
import type { CartItem } from '@/context/CartContext'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width: screenWidth } = Dimensions.get('window')
const isSmallDevice = screenWidth < 375 // iPhone SE, iPhone 7 and smaller
const isLargeDevice = screenWidth >= 768 // Tablets and larger phones

// Temporary data - should come from API
const DELIVERY_FEE = 9
const PROMO_CODES = {
  'WELCOME': {
    discount: 14,
    minOrder: 100,
    expiryDate: '2025-12-31',
    usageLimit: 1,
    type: 'fixed' as const, // fixed amount discount
  },
  'FIRST': {
    discount: 10,
    minOrder: 50,
    expiryDate: '2025-12-31',
    usageLimit: 1,
    type: 'percentage' as const, // percentage discount
  },
  'SPECIAL': {
    discount: 20,
    minOrder: 150,
    expiryDate: '2025-06-30',
    usageLimit: 1,
    type: 'fixed' as const,
  },
}

const CartScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { items, removeFromCart, updateQuantity, getTotalPrice, isLoading, error } = useCart()
  const [promoCode, setPromoCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(0)
  const [applyingPromo, setApplyingPromo] = useState(false)
  const [promoError, setPromoError] = useState<string | null>(null)

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    try {
      await updateQuantity(itemId, newQuantity)
    } catch (err) {
      console.error('Error updating quantity:', err)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromCart(itemId)
            } catch (err) {
              console.error('Error removing item:', err)
            }
          },
        },
      ]
    )
  }

  const validatePromoCode = (code: string, subtotal: number) => {
    const promoDetails = PROMO_CODES[code as keyof typeof PROMO_CODES]
    
    if (!promoDetails) {
      return { isValid: false, error: 'Invalid promo code' }
    }

    // Check expiry
    if (new Date(promoDetails.expiryDate) < new Date()) {
      return { isValid: false, error: 'Promo code has expired' }
    }

    // Check minimum order
    if (subtotal < promoDetails.minOrder) {
      return { 
        isValid: false, 
        error: `Minimum order amount for this code is AED${promoDetails.minOrder}`
      }
    }

    return { isValid: true, promoDetails }
  }

  const calculateDiscount = (promoDetails: typeof PROMO_CODES[keyof typeof PROMO_CODES], subtotal: number) => {
    if (promoDetails.type === 'percentage') {
      return (subtotal * promoDetails.discount) / 100
    }
    return promoDetails.discount
  }

  const handleApplyPromoCode = () => {
    setApplyingPromo(true)
    setPromoError(null)

    // Simulate API call
    setTimeout(() => {
      const subtotal = getTotalPrice()
      const { isValid, error, promoDetails } = validatePromoCode(promoCode, subtotal)

      if (!isValid || !promoDetails) {
        setPromoError(error || 'Invalid promo code')
        setAppliedDiscount(0)
      } else {
        const discount = calculateDiscount(promoDetails, subtotal)
        setAppliedDiscount(discount)
        Alert.alert(
          'Success', 
          promoDetails.type === 'percentage' 
            ? `Promo code applied! You got ${promoDetails.discount}% off.`
            : `Promo code applied! You got AED${discount} off.`
        )
      }
      setApplyingPromo(false)
    }, 1000)
  }

  const subtotal = getTotalPrice()
  const total = subtotal + DELIVERY_FEE - appliedDiscount

  const handleCheckout = () => {
    if (total < 50) {
      Alert.alert('Minimum Order', 'Minimum order amount is AED50')
      return
    }
    // TODO: Navigate to checkout screen
    router.push('/checkout')
  }

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemImagePlaceholder}>
        <Ionicons 
          name={item.category === 'Farghaly Juice' ? 'wine' : item.category === 'Cheesecake' ? 'ice-cream' : 'cafe'} 
          size={32} 
          color="#88D2D9" 
        />
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>AED{item.price}</Text>
      </View>
      <View style={styles.quantityControls}>
        <TouchableOpacity 
          style={[styles.quantityButton, item.quantity <= 1 && styles.quantityButtonDisabled]}
          onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
          disabled={item.quantity <= 1}
        >
          <Ionicons name="remove" size={20} color={item.quantity <= 1 ? "#999" : "#333"} />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity 
          style={[styles.quantityButton, item.quantity >= 99 && styles.quantityButtonDisabled]}
          onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
          disabled={item.quantity >= 99}
        >
          <Ionicons name="add" size={20} color={item.quantity >= 99 ? "#999" : "#333"} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
        >
          <Text style={styles.removeButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderEmptyCart = () => (
    <View style={styles.emptyCart}>
      <Ionicons name="cart-outline" size={64} color="#999" />
      <Text style={styles.emptyCartText}>Your cart is empty</Text>
      <TouchableOpacity 
        style={styles.startShoppingButton}
        onPress={() => router.push('/(tabs)/home')}
      >
        <Text style={styles.startShoppingButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  )

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#88D2D9" />
      </View>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>My Cart</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={renderEmptyCart}
        contentContainerStyle={styles.cartList}
      />

      {items.length > 0 && (
        <View style={styles.footer}>
          {/* Promo Code */}
          <View style={styles.promoContainer}>
            <View style={styles.promoInputContainer}>
              <TextInput
                style={styles.promoInput}
                placeholder="Add your promo code"
                value={promoCode}
                onChangeText={(text) => {
                  setPromoCode(text.toUpperCase())
                  setPromoError(null)
                }}
                autoCapitalize="characters"
              />
              {promoError && (
                <Text style={styles.promoErrorText}>{promoError}</Text>
              )}
            </View>
            <TouchableOpacity 
              style={[styles.applyButton, (!promoCode || applyingPromo) && styles.applyButtonDisabled]}
              onPress={handleApplyPromoCode}
              disabled={!promoCode || applyingPromo}
            >
              {applyingPromo ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.applyButtonText}>Apply</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>AED{subtotal.toFixed(2)}</Text>
            </View>
            {appliedDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Coupon discount</Text>
                <Text style={[styles.summaryValue, styles.discountText]}>-AED{appliedDiscount}</Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>AED{DELIVERY_FEE}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>AED{total.toFixed(2)}</Text>
            </View>
            {total < 50 && (
              <Text style={styles.minimumOrderText}>
                Add AED{(50 - total).toFixed(2)} more to place your order
              </Text>
            )}
          </View>

          {/* Checkout Button */}
          <TouchableOpacity 
            style={[styles.checkoutButton, total < 50 && styles.checkoutButtonDisabled]}
            onPress={handleCheckout}
            disabled={total < 50}
          >
            <Text style={styles.checkoutButtonText}>Continue to checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: Platform.select({
      ios: isSmallDevice ? 20 : 24,
      android: 24,
    }),
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: Platform.select({
      ios: isSmallDevice ? 16 : 20,
      android: 20,
    }),
    paddingVertical: Platform.select({
      ios: isSmallDevice ? 12 : 16,
      android: 16,
    }),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#FFE5E5',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
  },
  cartList: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Platform.select({
      ios: isSmallDevice ? 12 : 20,
      android: 20,
    }),
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: Platform.select({
      ios: isSmallDevice ? 8 : 12,
      android: 12,
    }),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImagePlaceholder: {
    width: Platform.select({
      ios: isSmallDevice ? 50 : 60,
      android: 60,
    }),
    height: Platform.select({
      ios: isSmallDevice ? 50 : 60,
      android: 60,
    }),
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
    marginLeft: Platform.select({
      ios: isSmallDevice ? 8 : 12,
      android: 12,
    }),
  },
  itemName: {
    fontSize: Platform.select({
      ios: isSmallDevice ? 14 : 16,
      android: 16,
    }),
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: Platform.select({
      ios: isSmallDevice ? 14 : 16,
      android: 16,
    }),
    color: '#333',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: Platform.select({
      ios: isSmallDevice ? 24 : 28,
      android: 28,
    }),
    height: Platform.select({
      ios: isSmallDevice ? 24 : 28,
      android: 28,
    }),
    borderRadius: Platform.select({
      ios: isSmallDevice ? 12 : 14,
      android: 14,
    }),
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: Platform.select({
      ios: isSmallDevice ? 14 : 16,
      android: 16,
    }),
    fontWeight: '600',
    color: '#333',
    marginHorizontal: Platform.select({
      ios: isSmallDevice ? 8 : 12,
      android: 12,
    }),
  },
  removeButton: {
    marginLeft: Platform.select({
      ios: isSmallDevice ? 8 : 12,
      android: 12,
    }),
  },
  removeButtonText: {
    color: '#88D2D9',
    fontSize: Platform.select({
      ios: isSmallDevice ? 12 : 14,
      android: 14,
    }),
    fontWeight: '500',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  startShoppingButton: {
    backgroundColor: '#88D2D9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startShoppingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: Platform.select({
      ios: isSmallDevice ? 16 : 20,
      android: 20,
    }),
    paddingTop: Platform.select({
      ios: isSmallDevice ? 12 : 16,
      android: 16,
    }),
    paddingBottom: Platform.select({
      ios: isSmallDevice ? 24 : 32,
      android: 32,
    }),
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  promoContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  promoInputContainer: {
    flex: 1,
    marginRight: 12,
  },
  promoInput: {
    height: Platform.select({
      ios: isSmallDevice ? 40 : 48,
      android: 48,
    }),
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: Platform.select({
      ios: isSmallDevice ? 12 : 16,
      android: 16,
    }),
    fontSize: Platform.select({
      ios: isSmallDevice ? 14 : 16,
      android: 16,
    }),
  },
  promoErrorText: {
    color: '#FF6B6B',
    fontSize: Platform.select({
      ios: isSmallDevice ? 10 : 12,
      android: 12,
    }),
    marginTop: 4,
  },
  applyButton: {
    backgroundColor: '#88D2D9',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 8,
  },
  applyButtonDisabled: {
    opacity: 0.5,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: Platform.select({
      ios: isSmallDevice ? 12 : 16,
      android: 16,
    }),
    marginBottom: Platform.select({
      ios: isSmallDevice ? 16 : 20,
      android: 20,
    }),
  },
  summaryTitle: {
    fontSize: Platform.select({
      ios: isSmallDevice ? 16 : 18,
      android: 18,
    }),
    fontWeight: '600',
    color: '#333',
    marginBottom: Platform.select({
      ios: isSmallDevice ? 12 : 16,
      android: 16,
    }),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: Platform.select({
      ios: isSmallDevice ? 12 : 14,
      android: 14,
    }),
    color: '#666',
  },
  summaryValue: {
    fontSize: Platform.select({
      ios: isSmallDevice ? 12 : 14,
      android: 14,
    }),
    color: '#333',
    fontWeight: '500',
  },
  discountText: {
    color: '#4CAF50',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: Platform.select({
      ios: isSmallDevice ? 14 : 16,
      android: 16,
    }),
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: Platform.select({
      ios: isSmallDevice ? 16 : 18,
      android: 18,
    }),
    fontWeight: 'bold',
    color: '#333',
  },
  minimumOrderText: {
    fontSize: Platform.select({
      ios: isSmallDevice ? 12 : 14,
      android: 14,
    }),
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 8,
  },
  checkoutButton: {
    backgroundColor: '#88D2D9',
    paddingVertical: Platform.select({
      ios: isSmallDevice ? 12 : 16,
      android: 16,
    }),
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    opacity: 0.5,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: Platform.select({
      ios: isSmallDevice ? 16 : 18,
      android: 18,
    }),
    fontWeight: '600',
  },
})

export default CartScreen 