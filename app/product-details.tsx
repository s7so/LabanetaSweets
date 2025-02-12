import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Platform, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCart } from '@/context/CartContext'

const { width: screenWidth } = Dimensions.get('window')
const isSmallDevice = screenWidth < 375 // iPhone SE, iPhone 7 and smaller
const isLargeDevice = screenWidth >= 768 // Tablets and larger phones

const getResponsiveFontSize = (size: number) => {
  if (isSmallDevice) return size - 2
  if (isLargeDevice) return size + 4
  return size
}

const getResponsiveSize = (size: number) => {
  if (isSmallDevice) return size * 0.9
  if (isLargeDevice) return size * 1.2
  return size
}

const ProductDetailsScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { id, name, description, price, category } = useLocalSearchParams()
  const [quantity, setQuantity] = useState(1)
  const { addToCart, error, isLoading } = useCart()
  const [addingToCart, setAddingToCart] = useState(false)

  const getIconName = () => {
    switch(category) {
      case 'Farghaly Juice':
        return 'wine'
      case 'Cheesecake':
        return 'ice-cream'
      default:
        return 'cafe'
    }
  }

  const handleIncrement = () => {
    if (quantity < 99) { // Maximum quantity check
      setQuantity(prev => prev + 1)
    }
  }

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  const totalPrice = Number(price) * quantity

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true)
      await addToCart({
        id: id as string,
        name: name as string,
        price: Number(price),
        quantity,
        category: category as string,
      })
      router.back()
    } catch (err) {
      console.error('Error adding to cart:', err)
    } finally {
      setAddingToCart(false)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#88D2D9" />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { marginTop: insets.top }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category}</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Product Image Placeholder */}
      <View style={styles.imageContainer}>
        <Ionicons 
          name={getIconName()} 
          size={80} 
          color="#88D2D9" 
        />
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{name}</Text>
        <Text style={styles.productDescription}>{description}</Text>
        <Text style={styles.productPrice}>AED{price}</Text>
      </View>

      {/* Quantity Controls */}
      <View style={styles.quantityContainer}>
        <TouchableOpacity 
          style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
          onPress={handleDecrement}
          disabled={quantity <= 1}
        >
          <Ionicons name="remove" size={24} color={quantity <= 1 ? "#999" : "#333"} />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{quantity}</Text>
        <TouchableOpacity 
          style={[styles.quantityButton, quantity >= 99 && styles.quantityButtonDisabled]}
          onPress={handleIncrement}
          disabled={quantity >= 99}
        >
          <Ionicons name="add" size={24} color={quantity >= 99 ? "#999" : "#333"} />
        </TouchableOpacity>
      </View>

      {/* Add to Basket Button */}
      <TouchableOpacity 
        style={[
          styles.addToBasketButton, 
          { paddingBottom: insets.bottom + 20 },
          addingToCart && styles.addToBasketButtonDisabled
        ]}
        onPress={handleAddToCart}
        disabled={addingToCart}
      >
        {addingToCart ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Text style={styles.addToBasketText}>Add to basket</Text>
            <Text style={styles.addToBasketPrice}>AED {totalPrice.toFixed(2)}</Text>
          </>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Platform.select({
      ios: isSmallDevice ? 16 : 20,
      android: 20,
    }),
    paddingVertical: Platform.select({
      ios: isSmallDevice ? 12 : 16,
      android: 16,
    }),
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Platform.select({
      ios: isSmallDevice ? 16 : 18,
      android: 18,
    }),
    fontWeight: '600',
    color: '#333',
    marginLeft: Platform.select({
      ios: isSmallDevice ? 6 : 8,
      android: 8,
    }),
  },
  imageContainer: {
    width: '100%',
    height: Platform.select({
      ios: isSmallDevice ? 200 : 300,
      android: 300,
    }),
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: Platform.select({
      ios: isSmallDevice ? 16 : 20,
      android: 20,
    }),
  },
  productName: {
    fontSize: Platform.select({
      ios: isSmallDevice ? 20 : 24,
      android: 24,
    }),
    fontWeight: '600',
    color: '#333',
    marginBottom: Platform.select({
      ios: isSmallDevice ? 6 : 8,
      android: 8,
    }),
  },
  productDescription: {
    fontSize: Platform.select({
      ios: isSmallDevice ? 14 : 16,
      android: 16,
    }),
    color: '#666',
    marginBottom: Platform.select({
      ios: isSmallDevice ? 12 : 16,
      android: 16,
    }),
  },
  productPrice: {
    fontSize: Platform.select({
      ios: isSmallDevice ? 20 : 24,
      android: 24,
    }),
    fontWeight: '600',
    color: '#333',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.select({
      ios: isSmallDevice ? 1 : 20,
      android: 20,
    }),
  },
  quantityButton: {
    width: Platform.select({
      ios: isSmallDevice ? 36 : 40,
      android: 40,
    }),
    height: Platform.select({
      ios: isSmallDevice ? 36 : 40,
      android: 40,
    }),
    borderRadius: Platform.select({
      ios: isSmallDevice ? 18 : 20,
      android: 20,
    }),
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: Platform.select({
      ios: isSmallDevice ? 16 : 18,
      android: 18,
    }),
    fontWeight: '600',
    color: '#333',
    marginHorizontal: Platform.select({
      ios: isSmallDevice ? 16 : 20,
      android: 20,
    }),
  },
  addToBasketButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#88D2D9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Platform.select({
      ios: isSmallDevice ? 16 : 20,
      android: 20,
    }),
  },
  addToBasketText: {
    fontSize: Platform.select({
      ios: isSmallDevice ? 16 : 18,
      android: 18,
    }),
    fontWeight: '600',
    color: '#fff',
  },
  addToBasketPrice: {
    fontSize: Platform.select({
      ios: isSmallDevice ? 16 : 18,
      android: 18,
    }),
    fontWeight: '600',
    color: '#fff',
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
    marginTop: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  addToBasketButtonDisabled: {
    opacity: 0.7,
  },
})

export default ProductDetailsScreen 