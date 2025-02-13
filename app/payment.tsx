import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const PaymentScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const paymentMethods = [
    {
      id: 'apple_pay',
      name: 'Apple Pay',
      icon: 'logo-apple' as const,
      last4: '2154'
    },
    {
      id: 'card',
      name: 'Visa Classic',
      icon: 'card-outline' as const,
      last4: '4321'
    }
  ]

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
      </View>

      {/* Saved Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saved Cards</Text>
        
        {paymentMethods.map((method) => (
          <TouchableOpacity 
            key={method.id}
            style={styles.paymentMethod}
            onPress={() => router.push(`/edit-card?id=${method.id}`)}
          >
            <View style={styles.methodLeft}>
              <Ionicons name={method.icon} size={24} color="#333" />
              <View style={styles.methodDetails}>
                <Text style={styles.methodName}>{method.name}</Text>
                <Text style={styles.methodInfo}>**** **** **** {method.last4}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Add New Card */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => router.push('/add-card')}
      >
        <Ionicons name="add-circle-outline" size={24} color="#88D2D9" />
        <Text style={styles.addButtonText}>Add New Card</Text>
      </TouchableOpacity>
    </ScrollView>
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
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodDetails: {
    marginLeft: 12,
  },
  methodName: {
    fontSize: 16,
    color: '#333',
  },
  methodInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#88D2D9',
    borderRadius: 12,
  },
  addButtonText: {
    color: '#88D2D9',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
})

export default PaymentScreen 