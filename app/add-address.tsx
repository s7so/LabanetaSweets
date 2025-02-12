import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Alert, ActivityIndicator, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAddress } from '@/context/AddressContext'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'
import * as Location from 'expo-location'

const { width } = Dimensions.get('window')
const ASPECT_RATIO = width / 200
const LATITUDE_DELTA = 0.02
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO

const AddAddressScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { addAddress } = useAddress()
  const [title, setTitle] = useState('')
  const [address, setAddress] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [location, setLocation] = useState({
    latitude: 24.2105,  // Default to Al Ain coordinates
    longitude: 55.7427,
  })
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)

  useEffect(() => {
    getCurrentLocation()
  }, [])

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true)
      let { status } = await Location.requestForegroundPermissionsAsync()
      
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Please allow location access to use this feature')
        return
      }

      let location = await Location.getCurrentPositionAsync({})
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })

      // Get address from coordinates
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })

      if (address[0]) {
        const addressStr = `${address[0].street || ''} ${address[0].district || ''} ${address[0].city || ''}`
        setAddress(addressStr.trim())
      }
    } catch (error) {
      console.error('Error getting location:', error)
      Alert.alert('Error', 'Failed to get your location')
    } finally {
      setIsLoadingLocation(false)
    }
  }

  const handleSubmit = async () => {
    if (!title.trim() || !address.trim()) {
      Alert.alert('Error', 'Please fill all fields')
      return
    }
    
    setIsSubmitting(true)
    try {
      await addAddress({
        title: title.trim(),
        address: address.trim(),
        latitude: location.latitude,
        longitude: location.longitude,
      })
      router.back()
    } catch (error) {
      Alert.alert('Error', 'Failed to add address. Please try again.')
    } finally {
      setIsSubmitting(false)
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
            var map = L.map('map').setView([${location.latitude}, ${location.longitude}], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            L.marker([${location.latitude}, ${location.longitude}]).addTo(map);
          </script>
        </body>
      </html>
    `
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Add New Address</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Address Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Home, Office, etc."
              value={title}
              onChangeText={setTitle}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.mapContainer}>
            {isLoadingLocation ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#88D2D9" />
              </View>
            ) : (
              <WebView
                style={styles.map}
                source={{ html: getMapHTML() }}
                scrollEnabled={false}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.warn('WebView error: ', nativeEvent);
                }}
              />
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Address</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Enter full address details"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={4}
              editable={!isSubmitting}
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Save Address</Text>
            )}
          </TouchableOpacity>
        </View>
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
  headerRight: {
    width: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  mapContainer: {
    height: 200,
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#88D2D9',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})

export default AddAddressScreen 