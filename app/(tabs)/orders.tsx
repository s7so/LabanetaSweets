import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

// Types
interface OrderItem {
  id: string
  name: string
  quantity: number
  category: string // Add category to determine icon
}

interface Order {
  id: string
  items: OrderItem[]
  status: 'delivering' | 'delivered'
  total: number
  date?: string
}

// Temporary data - should come from API
const orders: Order[] = [
  {
    id: '254656',
    items: [
      { id: '1', name: 'Rice Milk', quantity: 1, category: 'rice_milk' },
      { id: '2', name: 'Rice Milk', quantity: 1, category: 'rice_milk' },
      { id: '3', name: 'Rice Milk', quantity: 1, category: 'rice_milk' },
    ],
    status: 'delivering',
    total: 120,
  },
  {
    id: '254656',
    items: [
      { id: '1', name: 'Rice Milk', quantity: 1, category: 'rice_milk' },
      { id: '2', name: 'Rice Milk', quantity: 1, category: 'rice_milk' },
      { id: '3', name: 'Rice Milk', quantity: 1, category: 'rice_milk' },
    ],
    status: 'delivered',
    total: 120,
    date: '20 Oct 2024, at 05:00 PM',
  },
  {
    id: '254656',
    items: [
      { id: '1', name: 'Rice Milk', quantity: 1, category: 'rice_milk' },
      { id: '2', name: 'Rice Milk', quantity: 1, category: 'rice_milk' },
      { id: '3', name: 'Rice Milk', quantity: 1, category: 'rice_milk' },
    ],
    status: 'delivered',
    total: 120,
    date: '20 Oct 2024, at 05:00 PM',
  },
]

const OrdersScreen = () => {
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const getIconName = (category: string) => {
    switch(category) {
      case 'rice_milk':
        return 'cafe'
      case 'cheesecake':
        return 'ice-cream'
      case 'juice':
        return 'wine'
      default:
        return 'restaurant'
    }
  }

  const handleReorder = (order: Order) => {
    // TODO: Implement reorder functionality
    console.log('Reordering:', order.id)
  }

  const renderOrderItem = ({ item: order }: { item: Order }) => {
    const isDelivering = order.status === 'delivering'
    const remainingItems = order.items.length > 3 ? order.items.length - 3 : 0

    return (
      <TouchableOpacity 
        style={styles.orderCard}
        onPress={() => router.push({
          pathname: '/order-details/[id]',
          params: { id: order.id }
        })}
      >
        {/* Order ID and Arrow */}
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Order ID {order.id}</Text>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </View>

        {/* Order Items */}
        <View style={styles.itemsContainer}>
          {order.items.slice(0, 3).map((item, index) => (
            <View key={index} style={styles.itemImagePlaceholder}>
              <Ionicons 
                name={getIconName(item.category)} 
                size={24} 
                color="#88D2D9" 
              />
            </View>
          ))}
          {remainingItems > 0 && (
            <View style={styles.remainingItems}>
              <Text style={styles.remainingItemsText}>+{remainingItems}</Text>
            </View>
          )}
          <Text style={styles.totalPrice}>AED{order.total}</Text>
        </View>

        {/* Status or Date */}
        {isDelivering ? (
          <View style={styles.deliveringContainer}>
            <Text style={styles.deliveringText}>Delivering</Text>
          </View>
        ) : (
          <>
            <View style={styles.deliveredContainer}>
              <Text style={styles.deliveredText}>
                Delivered <Text style={styles.dateText}>on {order.date}</Text>
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.reorderButton}
              onPress={() => handleReorder(order)}
            >
              <Text style={styles.reorderText}>Reorder</Text>
            </TouchableOpacity>
          </>
        )}
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>orders</Text>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listContent: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  itemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  remainingItems: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  remainingItemsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 'auto',
  },
  deliveringContainer: {
    backgroundColor: '#E8F7F8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deliveringText: {
    color: '#88D2D9',
    fontSize: 16,
    fontWeight: '500',
  },
  deliveredContainer: {
    marginBottom: 12,
  },
  deliveredText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  dateText: {
    color: '#666',
    fontWeight: 'normal',
  },
  reorderButton: {
    borderWidth: 1,
    borderColor: '#88D2D9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  reorderText: {
    color: '#88D2D9',
    fontSize: 16,
    fontWeight: '500',
  },
})

export default OrdersScreen 