import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const { width } = Dimensions.get('window')

const PhoneNumberScreen = () => {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState('')

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Title and Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.title}>Enter your mobile number</Text>
          <Text style={styles.subtitle}>Mobile Number</Text>
          <View style={styles.phoneInput}>
            <View style={styles.countryCode}>
              <Image 
                source={require('../../assets/images/uae-flag.png')}
                style={styles.flag}
                resizeMode="contain"
              />
              <Text style={styles.countryCodeText}>+971</Text>
            </View>
            <TextInput
              style={styles.phoneNumberInput}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              autoFocus
            />
          </View>
        </View>

        {/* Spacer to ensure content is above the button */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Next Button - Outside ScrollView to stay fixed */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.nextButton, !phoneNumber && styles.nextButtonDisabled]}
          disabled={!phoneNumber}
          onPress={() => router.push('/(auth)/verification')}
        >
          <Ionicons name="arrow-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  inputContainer: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 8,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  flag: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  countryCodeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  phoneNumberInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  spacer: {
    flex: 1,
    minHeight: 100, // Ensure minimum space for the button
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    alignItems: 'flex-end',
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#88D2D9',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  nextButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
})

export default PhoneNumberScreen 