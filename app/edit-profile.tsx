import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useUser } from '@/context/UserContext'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'

const EditProfileScreen = () => {
  const { user, updateUser } = useUser()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [email, setEmail] = useState(user?.email || '')
  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null)

  // State variables for error messages
  const [nameError, setNameError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [emailError, setEmailError] = useState('')

  // State variable for loading state
  const [isLoading, setIsLoading] = useState(false)

  // Ref for the name input to enable auto-focus
  const nameInputRef = useRef<TextInput>(null)

  useEffect(() => {
    // Focus on the name input when the component mounts
    nameInputRef.current?.focus()
  }, [])

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow access to your photos to update profile picture')
      }
    })()
  }, [])

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri)
    }
  }

  const validateEmail = (email: string) => {
    if (!email) return true // Optional field, so empty is valid
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const validatePhone = (phone: string) => {
    if (!phone) return false // Phone is required
    const regex = /^\+?[0-9]{7,14}$/ // Basic phone number regex
    return regex.test(phone)
  }

  const handleCancel = () => {
    router.back()
  }

  const handleSave = async () => {
    setIsLoading(true) // Start loading
    setNameError('')
    setPhoneError('')
    setEmailError('')

    let isValid = true

    if (!name.trim()) {
      setNameError('Name is required')
      isValid = false
    }

    if (!validatePhone(phone)) {
      setPhoneError('Invalid phone number')
      isValid = false
    }

    if (email && !validateEmail(email)) {
      setEmailError('Invalid email format')
      isValid = false
    }

    if (isValid) {
      try {
        await updateUser({ name, phone, email, profileImage })
        Alert.alert('Success', 'Profile updated successfully')
        router.back()
      } catch (error) {
        Alert.alert('Error', 'Failed to update profile') // Basic error alert
        console.error('Update profile error:', error) // Log error for debugging
      } finally {
        setIsLoading(false) // End loading, whether success or error
      }
    } else {
      setIsLoading(false) // End loading if validation fails
    }
  }

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButton}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <TouchableOpacity style={styles.profileImageContainer} onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="camera-outline" size={32} color="#fff" />
              <Text style={styles.placeholderText}>Change Profile Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          ref={nameInputRef}
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor="#666"
        />
        {!!nameError && <Text style={styles.errorText}>{nameError}</Text>}

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter phone number"
          placeholderTextColor="#666"
          keyboardType="phone-pad"
        />
        {!!phoneError && <Text style={styles.errorText}>{phoneError}</Text>}

        <Text style={styles.label}>Email (Optional)</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          placeholderTextColor="#666"
          keyboardType="email-address"
        />
        {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    color: '#88D2D9',
    fontWeight: '600',
  },
  cancelButton: {
    color: '#666',
    fontWeight: '500',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
})

export default EditProfileScreen 