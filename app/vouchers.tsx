import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Dimensions, Platform, Alert } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCart } from '../context/CartContext'

// Types
interface Voucher {
  id: string
  code: string
  discount: {
    type: 'percentage' | 'fixed'
    value: number
  }
  validUntil: string
  status: 'available' | 'used' | 'expired'
  minOrder?: number
  terms: string[]
}

// Temporary data
const vouchers: Voucher[] = [
  {
    id: '1',
    code: 'SWEET50',
    discount: {
      type: 'percentage',
      value: 50
    },
    validUntil: '2026-12-31',
    status: 'available',
    minOrder: 100,
    terms: [
      'Valid on orders above AED 100',
      'Cannot be combined with other offers',
      'Valid until December 31, 2026'
    ]
  },
  {
    id: '2',
    code: 'WELCOME20',
    discount: {
      type: 'fixed',
      value: 20
    },
    validUntil: '2026-06-30',
    status: 'used',
    terms: [
      'One-time use only',
      'Valid for new customers',
      'Valid until June 30, 2026'
    ]
  },
  {
    id: '3',
    code: 'SUMMER25',
    discount: {
      type: 'percentage',
      value: 25
    },
    validUntil: '2023-12-31',
    status: 'expired',
    terms: [
      'Summer special offer',
      'Valid on all products',
      'Expired on December 31, 2023'
    ]
  }
]

const VouchersScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { applyVoucher, error: cartError } = useCart()
  const [activeTab, setActiveTab] = useState<'available' | 'used' | 'expired'>('available')
  const [voucherCode, setVoucherCode] = useState('')

  const filteredVouchers = vouchers.filter(voucher => voucher.status === activeTab)

  const handleApplyVoucher = () => {
    // Convert input to uppercase for comparison
    const code = voucherCode.toUpperCase()
    
    // Find the voucher in our list
    const voucher = vouchers.find(v => v.code === code)
    
    if (!voucher) {
      Alert.alert('Invalid Code', 'This voucher code is not valid.')
      return
    }

    // Check if voucher is already used or expired
    if (voucher.status === 'used') {
      Alert.alert('Already Used', 'This voucher has already been used.')
      return
    }

    if (voucher.status === 'expired') {
      Alert.alert('Expired', 'This voucher has expired.')
      return
    }

    // If voucher is valid, apply it to the cart
    applyVoucher({
      code: voucher.code,
      discount: voucher.discount,
      minOrder: voucher.minOrder,
    }).then(() => {
      if (!cartError) {
        Alert.alert(
          'Success!',
          `Voucher applied successfully!\n${
            voucher.discount.type === 'percentage' 
              ? `${voucher.discount.value}% discount`
              : `AED ${voucher.discount.value} discount`
          }${
            voucher.minOrder 
              ? `\nMinimum order: AED ${voucher.minOrder}`
              : ''
          }`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Clear the input after successful application
                setVoucherCode('')
                // Navigate back to cart
                router.back()
              }
            }
          ]
        )
      } else {
        Alert.alert('Error', cartError)
      }
    })
  }

  const getStatusColor = (status: Voucher['status']) => {
    switch (status) {
      case 'available':
        return '#4CAF50'
      case 'used':
        return '#9E9E9E'
      case 'expired':
        return '#FF6B6B'
      default:
        return '#666'
    }
  }

  const renderVoucherCard = (voucher: Voucher) => (
    <View key={voucher.id} style={styles.voucherCard}>
      <View style={styles.voucherHeader}>
        <View>
          <Text style={styles.discountText}>
            {voucher.discount.type === 'percentage' 
              ? `${voucher.discount.value}% OFF`
              : `AED ${voucher.discount.value} OFF`
            }
          </Text>
          <Text style={styles.codeText}>{voucher.code}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(voucher.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(voucher.status) }]}>
            {voucher.status.charAt(0).toUpperCase() + voucher.status.slice(1)}
          </Text>
        </View>
      </View>

      {voucher.minOrder && (
        <Text style={styles.minOrderText}>
          Min. order: AED {voucher.minOrder}
        </Text>
      )}

      <View style={styles.termsContainer}>
        <Text style={styles.termsTitle}>Terms & Conditions:</Text>
        {voucher.terms.map((term, index) => (
          <View key={index} style={styles.termItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.termText}>{term}</Text>
          </View>
        ))}
      </View>
    </View>
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vouchers</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Voucher Code Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter voucher code"
          placeholderTextColor="#666"
          value={voucherCode}
          onChangeText={setVoucherCode}
          autoCapitalize="characters"
        />
        <TouchableOpacity 
          style={[styles.applyButton, !voucherCode && styles.applyButtonDisabled]}
          onPress={handleApplyVoucher}
          disabled={!voucherCode}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(['available', 'used', 'expired'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Vouchers List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredVouchers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="ticket-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No {activeTab} vouchers</Text>
          </View>
        ) : (
          filteredVouchers.map(renderVoucherCard)
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  },
  headerRight: {
    width: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: '#88D2D9',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#88D2D9',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#88D2D9',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  voucherCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  voucherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  discountText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  codeText: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  minOrderText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  termsContainer: {
    marginTop: 12,
  },
  termsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  termItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bulletPoint: {
    marginRight: 8,
    color: '#666',
  },
  termText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
})

export default VouchersScreen 