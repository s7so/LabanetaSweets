import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// Card types regex patterns
const CARD_PATTERNS = {
  VISA: /^4[0-9]{12}(?:[0-9]{3})?$/,
  MASTERCARD: /^5[1-5][0-9]{14}$/,
  AMEX: /^3[47][0-9]{13}$/,
}

const AddCardScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [cardHolder, setCardHolder] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardType, setCardType] = useState<keyof typeof CARD_PATTERNS | ''>('')
  const [errors, setErrors] = useState({
    cardHolder: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  })

  // Luhn algorithm for card number validation
  const validateLuhn = (number: string): boolean => {
    let sum = 0;
    let isEven = false;
    
    // Loop through values starting from the rightmost side
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  // Detect card type based on number
  const detectCardType = (number: string): keyof typeof CARD_PATTERNS | '' => {
    const cleanNumber = number.replace(/\D/g, '');
    for (const [type, pattern] of Object.entries(CARD_PATTERNS)) {
      if (pattern.test(cleanNumber)) {
        return type as keyof typeof CARD_PATTERNS;
      }
    }
    return '';
  }

  const formatCardNumber = (text: string) => {
    // Remove any non-digit characters
    const cleaned = text.replace(/\D/g, '')
    
    // Detect card type
    const type = detectCardType(cleaned)
    setCardType(type)
    
    // Format based on card type
    let formatted = cleaned
    if (type === 'AMEX') {
      // Format: XXXX XXXXXX XXXXX
      formatted = cleaned.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3')
    } else {
      // Format: XXXX XXXX XXXX XXXX
      formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim()
    }
    
    return formatted
  }

  const formatExpiryDate = (text: string) => {
    // Remove any non-digit characters
    const cleaned = text.replace(/\D/g, '')
    
    // Add slash after 2 digits (MM/YY)
    if (cleaned.length >= 2) {
      const month = parseInt(cleaned.slice(0, 2))
      // Validate month (1-12)
      if (month > 12) {
        return '12/' + cleaned.slice(2, 4)
      }
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
    }
    return cleaned
  }

  const validateForm = () => {
    const newErrors = {
      cardHolder: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
    }
    let isValid = true

    // Validate card holder
    if (!cardHolder.trim()) {
      newErrors.cardHolder = 'Card holder name is required'
      isValid = false
    } else if (!/^[a-zA-Z\s]+$/.test(cardHolder)) {
      newErrors.cardHolder = 'Invalid card holder name'
      isValid = false
    }

    // Validate card number
    const cleanedCardNumber = cardNumber.replace(/\s/g, '')
    if (!cleanedCardNumber) {
      newErrors.cardNumber = 'Card number is required'
      isValid = false
    } else if (!validateLuhn(cleanedCardNumber)) {
      newErrors.cardNumber = 'Invalid card number'
      isValid = false
    } else if (!cardType) {
      newErrors.cardNumber = 'Unsupported card type'
      isValid = false
    }

    // Validate expiry date
    const [month, year] = expiryDate.split('/')
    if (!month || !year || month.length !== 2 || year.length !== 2) {
      newErrors.expiryDate = 'Invalid expiry date'
      isValid = false
    } else {
      const currentYear = new Date().getFullYear() % 100
      const currentMonth = new Date().getMonth() + 1
      const expMonth = parseInt(month)
      const expYear = parseInt(year)

      if (expMonth < 1 || expMonth > 12) {
        newErrors.expiryDate = 'Invalid month'
        isValid = false
      } else if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        newErrors.expiryDate = 'Card has expired'
        isValid = false
      }
    }

    // Validate CVV
    const requiredCvvLength = cardType === 'AMEX' ? 4 : 3
    if (!cvv) {
      newErrors.cvv = 'CVV is required'
      isValid = false
    } else if (cvv.length !== requiredCvvLength) {
      newErrors.cvv = `CVV must be ${requiredCvvLength} digits`
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSave = () => {
    if (validateForm()) {
      // Format card data for storage
      const cardData = {
        cardHolder: cardHolder.trim(),
        cardNumber: cardNumber.replace(/\s/g, '').slice(-4), // Store only last 4 digits
        expiryDate,
        cardType,
      }
      
      // TODO: Save card data securely
      console.log('Saving card:', cardData)
      router.back()
    }
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Card</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Card Holder Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Card holder name</Text>
          <TextInput
            style={[styles.input, errors.cardHolder && styles.inputError]}
            placeholder="name name"
            placeholderTextColor="#999999"
            value={cardHolder}
            onChangeText={setCardHolder}
            autoCapitalize="words"
          />
          {errors.cardHolder ? (
            <Text style={styles.errorText}>{errors.cardHolder}</Text>
          ) : null}
        </View>

        {/* Card Number */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Card Number</Text>
          <TextInput
            style={[styles.input, errors.cardNumber && styles.inputError]}
            placeholder="123 ************"
            placeholderTextColor="#999999"
            value={cardNumber}
            onChangeText={(text) => setCardNumber(formatCardNumber(text))}
            keyboardType="numeric"
            maxLength={19}
          />
          {errors.cardNumber ? (
            <Text style={styles.errorText}>{errors.cardNumber}</Text>
          ) : null}
        </View>

        {/* Expiry Date and CVV */}
        <View style={styles.row}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 16 }]}>
            <Text style={styles.label}>Expiry date</Text>
            <TextInput
              style={[styles.input, errors.expiryDate && styles.inputError]}
              placeholder="MM/YY"
              placeholderTextColor="#999999"
              value={expiryDate}
              onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
              keyboardType="numeric"
              maxLength={5}
            />
            {errors.expiryDate ? (
              <Text style={styles.errorText}>{errors.expiryDate}</Text>
            ) : null}
          </View>

          <View style={[styles.inputContainer, { flex: 1 }]}>
            <Text style={styles.label}>CVV</Text>
            <TextInput
              style={[styles.input, errors.cvv && styles.inputError]}
              placeholder="***"
              placeholderTextColor="#999999"
              value={cvv}
              onChangeText={setCvv}
              keyboardType="numeric"
              maxLength={3}
              secureTextEntry
            />
            {errors.cvv ? (
              <Text style={styles.errorText}>{errors.cvv}</Text>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity 
        style={styles.saveButton}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>Save Card</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: 'black',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#88D2D9',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})

export default AddCardScreen 