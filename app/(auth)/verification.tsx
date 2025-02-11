import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const { width } = Dimensions.get('window')

// Keypad configuration
const keypadConfig = [
  [{ number: '1', letters: 'ABC' }, { number: '2', letters: 'DEF' }, { number: '3', letters: 'GHI' }],
  [{ number: '4', letters: 'JKL' }, { number: '5', letters: 'MNO' }, { number: '6', letters: 'PQRS' }],
  [{ number: '7', letters: 'TUV' }, { number: '8', letters: 'WXYZ' }, { number: '9', letters: '' }],
  [{ number: '+*#', letters: '' }, { number: '0', letters: '' }, { number: 'del', letters: '' }],
]

const VerificationScreen = () => {
  const router = useRouter()
  const [code, setCode] = useState('')

  const handleKeyPress = (key: string) => {
    if (key === 'del') {
      setCode(prev => prev.slice(0, -1))
    } else if (key === '+*#') {
      // Handle special characters
    } else if (code.length < 4) {
      setCode(prev => prev + key)
    }
  }

  useEffect(() => {
    if (code.length === 4) {
      // Handle verification
      console.log('Code complete:', code)
    }
  }, [code])

  const renderCodeDashes = () => {
    return Array(4).fill(0).map((_, index) => (
      <View key={index} style={styles.codeBox}>
        <Text style={styles.codeText}>
          {code[index] || '-'}
        </Text>
      </View>
    ))
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
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

        {/* Title and Code Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.title}>Enter your 4-digit code</Text>
          <Text style={styles.subtitle}>Code</Text>
          <View style={styles.codeContainer}>
            {renderCodeDashes()}
          </View>
        </View>

        {/* Resend Button */}
        <TouchableOpacity 
          style={styles.resendButton}
          onPress={() => {/* Handle resend */}}
        >
          <Text style={styles.resendText}>Resend Code</Text>
        </TouchableOpacity>

        {/* Custom Keypad */}
        <View style={styles.keypadContainer}>
          <View style={styles.keypad}>
            {keypadConfig.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.keypadRow}>
                {row.map((key, keyIndex) => (
                  <TouchableOpacity
                    key={keyIndex}
                    style={styles.keypadButton}
                    onPress={() => handleKeyPress(key.number)}
                  >
                    {key.number === 'del' ? (
                      <Ionicons name="backspace-outline" size={24} color="#333" />
                    ) : (
                      <>
                        <Text style={styles.keypadNumber}>{key.number}</Text>
                        {key.letters && <Text style={styles.keypadLetters}>{key.letters}</Text>}
                      </>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Next Button - Outside ScrollView to stay fixed */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.nextButton, code.length !== 4 && styles.nextButtonDisabled]}
          disabled={code.length !== 4}
          onPress={() => {/* Handle verification */}}
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  codeBox: {
    width: width * 0.15,
    height: width * 0.15,
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeText: {
    fontSize: 24,
    color: '#333',
    fontWeight: '500',
  },
  resendButton: {
    alignSelf: 'center',
    marginBottom: 32,
  },
  resendText: {
    color: '#88D2D9',
    fontSize: 16,
    fontWeight: '600',
  },
  keypadContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  keypad: {
    padding: 20,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  keypadButton: {
    width: width * 0.25,
    height: width * 0.15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadNumber: {
    fontSize: 24,
    color: '#333',
    fontWeight: '500',
  },
  keypadLetters: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 20,
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

export default VerificationScreen 