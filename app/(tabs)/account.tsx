import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const AccountScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const menuItems = [
    {
      id: 'refer',
      title: 'Refer a friend',
      icon: 'gift-outline',
      onPress: () => router.push('/refer-a-friend'),
    },
    {
      id: 'vouchers',
      title: 'Vouchers',
      icon: 'ticket-outline',
      onPress: () => console.log('Vouchers'),
    },
    {
      id: 'addresses',
      title: 'Addresses',
      icon: 'location-outline',
      onPress: () => router.push('/addresses'),
    },
    {
      id: 'payment',
      title: 'Payment',
      icon: 'card-outline',
      onPress: () => console.log('Payment'),
    },
  ]

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Account</Text>

      {/* User Info */}
      <TouchableOpacity style={styles.userInfo}>
        <View>
          <Text style={styles.userName}>Customer Name</Text>
          <Text style={styles.userPhone}>+971 561 254 898</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>

      {/* Points Card */}
      <View style={styles.pointsCard}>
        <View style={styles.pointsContent}>
          <View>
            <Text style={styles.pointsAmount}>250</Text>
            <Text style={styles.pointsLabel}>Points</Text>
          </View>
          <View style={styles.pointsIcon}>
            <Ionicons name="trophy" size={32} color="#FFD700" />
          </View>
        </View>
        <Text style={styles.pointsExpiry}>Expire in 5 Days</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name={item.icon} size={24} color="#333" />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
  },
  pointsCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#E8F7F8',
    borderRadius: 12,
  },
  pointsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pointsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  pointsLabel: {
    fontSize: 16,
    color: '#666',
  },
  pointsIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsExpiry: {
    fontSize: 14,
    color: '#666',
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
})

export default AccountScreen 