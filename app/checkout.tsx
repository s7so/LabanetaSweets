import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, Dimensions, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useCart } from '@/context/CartContext'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAddress } from '@/context/AddressContext'
import { WebView } from 'react-native-webview'
import * as Location from 'expo-location'

const { width: screenWidth } = Dimensions.get('window')
const isSmallDevice = screenWidth < 375
const ASPECT_RATIO = screenWidth / 150
const LATITUDE_DELTA = 0.01
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO

interface PaymentMethod {
  id: string
  name: string
  icon: string
  last4?: string
}

const paymentMethods: PaymentMethod[] = [
  { id: 'apple_pay', name: 'Apple pay', icon: 'logo-apple' },
  { id: 'card', name: 'XXXX-2154', icon: 'card', last4: '2154' },
  { id: 'new_card', name: 'Add new card', icon: 'add-circle-outline' },
  { id: 'cash', name: 'Cash', icon: 'cash-outline' },
]

const CheckoutScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { getTotalPrice, clearCart } = useCart()
  const { defaultAddress } = useAddress()
  const [selectedPayment, setSelectedPayment] = useState<string>('apple_pay')
  const [deliveryAddress, setDeliveryAddress] = useState(
    defaultAddress ? `${defaultAddress.title}, ${defaultAddress.address}` : 'Add delivery address'
  )
  const [points, setPoints] = useState(250)
  const [isProcessing, setIsProcessing] = useState(false)
  const [mapLocation, setMapLocation] = useState({
    latitude: 24.2105,
    longitude: 55.7427,
  })

  const subtotal = getTotalPrice()
  const couponDiscount = 14
  const deliveryFee = 8
  const total = subtotal + deliveryFee - couponDiscount

  useEffect(() => {
    if (defaultAddress?.latitude && defaultAddress?.longitude) {
      setMapLocation({
        latitude: defaultAddress.latitude,
        longitude: defaultAddress.longitude,
      })
    }
  }, [defaultAddress])

  const handlePayment = async () => {
    if (!defaultAddress) {
      Alert.alert('Error', 'Please add a delivery address')
      return
    }

    setIsProcessing(true)
    try {
      if (selectedPayment === 'apple_pay') {
        // Handle Apple Pay
        console.log('Processing Apple Pay payment...')
      } else if (selectedPayment === 'card') {
        // Handle Card payment
        console.log('Processing Card payment...')
      } else if (selectedPayment === 'cash') {
        // Handle Cash payment
        console.log('Processing Cash payment...')
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Clear cart after successful payment
      await clearCart()
      
      // Navigate to order confirmation screen
      router.push('/order-confirmation')
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentMethodPress = (methodId: string) => {
    if (methodId === 'new_card') {
      router.push('/add-card')
    } else {
      setSelectedPayment(methodId)
    }
  }

  const getMapHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
          <style>
            body { margin: 0; }
            #map { height: 100vh; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            var map = L.map('map').setView([${mapLocation.latitude}, ${mapLocation.longitude}], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            L.marker([${mapLocation.latitude}, ${mapLocation.longitude}]).addTo(map);
          </script>
        </body>
      </html>
    `
  }

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
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Deliver to</Text>
            <TouchableOpacity 
              style={styles.changeButton}
              onPress={() => router.push('/addresses')}
            >
              <Text style={styles.changeText}>Change location</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.addressContainer}
            onPress={() => router.push('/addresses')}
          >
            <Ionicons name="location-outline" size={24} color="#666" style={styles.addressIcon} />
            <Text style={[
              styles.addressText,
              !defaultAddress && styles.placeholderText
            ]}>
              {deliveryAddress}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          {/* Map View */}
          {defaultAddress && (
            <View style={styles.mapContainer}>
              <WebView
                style={styles.map}
                source={{ html: getMapHTML() }}
                scrollEnabled={false}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.warn('WebView error: ', nativeEvent);
                }}
              />
            </View>
          )}
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pay With</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={styles.paymentOption}
              onPress={() => handlePaymentMethodPress(method.id)}
            >
              <View style={styles.paymentInfo}>
                <Ionicons name={method.icon as any} size={24} color="#333" />
                <Text style={styles.paymentText}>{method.name}</Text>
              </View>
              <View style={styles.radioButton}>
                {selectedPayment === method.id && <View style={styles.radioButtonSelected} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Points */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Points</Text>
            <Text style={styles.pointsText}>Total: {points}</Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>AED{subtotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Coupon discount</Text>
            <Text style={[styles.summaryValue, styles.discountText]}>-AED{couponDiscount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>AED{deliveryFee}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>AED{total}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Payment Button */}
      {selectedPayment === 'apple_pay' ? (
        <TouchableOpacity 
          style={[styles.applePayButton, isProcessing && styles.buttonDisabled]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          <Ionicons name="logo-apple" size={24} color="#fff" />
          <Text style={styles.applePayText}>
            {isProcessing ? 'Processing...' : 'Pay'}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={[styles.payButton, isProcessing && styles.buttonDisabled]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          <Text style={styles.payButtonText}>
            {isProcessing ? 'Processing...' : `Pay AED${total}`}
          </Text>
        </TouchableOpacity>
      )}
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
      ios: isSmallDevice ? 18 : 20,
      android: 20,
    }),
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: Platform.select({
      ios: isSmallDevice ? 16 : 20,
      android: 20,
    }),
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: Platform.select({
      ios: isSmallDevice ? 16 : 18,
      android: 18,
    }),
    fontWeight: '600',
    color: '#333',
  },
  changeText: {
    fontSize: Platform.select({
      ios: isSmallDevice ? 14 : 16,
      android: 16,
    }),
    color: '#88D2D9',
    fontWeight: '500',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  addressIcon: {
    marginRight: 8,
  },
  addressText: {
    flex: 1,
    fontSize: Platform.select({
      ios: isSmallDevice ? 14 : 16,
      android: 16,
    }),
    color: '#666',
  },
  placeholderText: {
    color: '#999',
    fontStyle: 'italic',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentText: {
    fontSize: Platform.select({
      ios: isSmallDevice ? 14 : 16,
      android: 16,
    }),
    color: '#333',
    marginLeft: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#88D2D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#88D2D9',
  },
  pointsText: {
    fontSize: Platform.select({
      ios: isSmallDevice ? 14 : 16,
      android: 16,
    }),
    color: '#333',
    fontWeight: '500',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: Platform.select({
      ios: isSmallDevice ? 14 : 16,
      android: 16,
    }),
    color: '#666',
  },
  summaryValue: {
    fontSize: Platform.select({
      ios: isSmallDevice ? 14 : 16,
      android: 16,
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
      ios: isSmallDevice ? 16 : 18,
      android: 18,
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
  applePayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: Platform.select({
      ios: isSmallDevice ? 12 : 16,
      android: 16,
    }),
    borderRadius: 12,
  },
  applePayText: {
    color: '#fff',
    fontSize: Platform.select({
      ios: isSmallDevice ? 16 : 18,
      android: 18,
    }),
    fontWeight: '600',
    marginLeft: 8,
  },
  payButton: {
    backgroundColor: '#88D2D9',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: Platform.select({
      ios: isSmallDevice ? 12 : 16,
      android: 16,
    }),
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: Platform.select({
      ios: isSmallDevice ? 16 : 18,
      android: 18,
    }),
    fontWeight: '600',
  },
  changeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  mapContainer: {
    height: 150,
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
})

export default CheckoutScreen 