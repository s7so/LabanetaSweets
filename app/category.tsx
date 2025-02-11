import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCart } from '@/context/CartContext'

interface Product {
  id: string
  name: string
  description: string
  price: number
}

// Temporary data - should come from API
const categoryProducts: Record<string, Product[]> = {
  'Rice Milk': [
    {
      id: '1',
      name: 'Rice Milk Sakalans',
      description: 'Rice Milk with fruits',
      price: 16,
    },
    {
      id: '2',
      name: 'Rice Milk Pistachio',
      description: 'Rice Milk with pistachio sauce',
      price: 15,
    },
    {
      id: '3',
      name: 'Rice Milk Mango',
      description: 'Rice Milk with Mango',
      price: 15,
    },
    {
      id: '4',
      name: 'Rice Milk Nutella',
      description: 'Rice Milk with Nutella',
      price: 13,
    },
    {
      id: '5',
      name: 'Rice Milk Caesar',
      description: 'Rice pudding with topping of mix fruits (vanilla and nutmeg)',
      price: 17,
    },
  ],
  'Cheesecake': [
    {
      id: '1',
      name: 'Classic Cheesecake',
      description: 'New York style cheesecake',
      price: 18,
    },
    {
      id: '2',
      name: 'Oreo Cheesecake',
      description: 'Cheesecake with Oreo cookies',
      price: 20,
    },
    {
      id: '3',
      name: 'Lotus Cheesecake',
      description: 'Cheesecake with Lotus biscuits',
      price: 20,
    },
  ],
  'Farghaly Juice': [
    {
      id: '1',
      name: 'Orange Juice',
      description: 'Fresh squeezed orange juice',
      price: 12,
    },
    {
      id: '2',
      name: 'Mango Juice',
      description: 'Fresh mango juice',
      price: 14,
    },
    {
      id: '3',
      name: 'Mixed Berries',
      description: 'Mixed fresh berries juice',
      price: 16,
    },
  ],
  'Breakfast': [
    {
      id: '1',
      name: 'Breakfast',
      description: 'Breakfast',
      price: 16,
    },
  ],
  'Ashtoota': [
    {
      id: '1',
      name: 'Ashtoota',
      description: 'Ashtoota',
      price: 16,
    },
  ],
}

const CategoryScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { name } = useLocalSearchParams()
  const { getTotalPrice, getTotalItems, addToCart, isLoading, error } = useCart()
  const [addingToCart, setAddingToCart] = useState(false)
  
  // Get products for the current category
  const products = categoryProducts[name as string] || []

  // Add console log to debug
  console.log('Category name:', name)
  console.log('Available categories:', Object.keys(categoryProducts))
  console.log('Products found:', products.length)

  const handleAddToCart = async (item: Product) => {
    try {
      setAddingToCart(true)
      await addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        category: name as string,
      })
    } catch (err) {
      console.error('Error adding to cart:', err)
    } finally {
      setAddingToCart(false)
    }
  }

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.productItem}
      onPress={() => router.push({
        pathname: '/product-details',
        params: {
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price.toString(),
          category: name,
        }
      })}
    >
      <View style={styles.productImagePlaceholder}>
        <Ionicons 
          name={name === 'Farghaly Juice' ? 'wine' : name === 'Cheesecake' ? 'ice-cream' : 'cafe'} 
          size={32} 
          color="#88D2D9" 
        />
      </View>
      <View style={styles.productDetails}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription}>{item.description}</Text>
        <Text style={styles.productPrice}>AED{item.price}</Text>
      </View>
      <TouchableOpacity 
        style={[styles.addButton, addingToCart && styles.addButtonDisabled]}
        onPress={(e) => {
          e.stopPropagation()
          handleAddToCart(item)
        }}
        disabled={addingToCart}
      >
        {addingToCart ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="add" size={24} color="#fff" />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  )

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
        <Text style={styles.headerTitle}>{name || 'Category'}</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Product List */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No products available</Text>
          </View>
        )}
      />

      {/* Bottom Cart Summary */}
      {getTotalItems() > 0 ? (
        <TouchableOpacity 
          style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}
          onPress={() => router.push('/cart')}
        >
          <Text style={styles.viewCartText}>View Cart</Text>
          <Text style={styles.cartPrice}>AED {getTotalPrice()}</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.orderText}>Add AED 50 To Place Your Order !</Text>
        </View>
      )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  productList: {
    padding: 20,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productDetails: {
    flex: 1,
    marginLeft: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#88D2D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  bottomBar: {
    backgroundColor: '#88D2D9',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cartPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  orderText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
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
  addButtonDisabled: {
    opacity: 0.5,
  },
})

export default CategoryScreen 