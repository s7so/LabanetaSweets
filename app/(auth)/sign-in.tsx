import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

const { width } = Dimensions.get('window')

const SignInScreen = () => {
  const router = useRouter()

  return (
    <ScrollView style={styles.container} bounces={false}>
      {/* Top Image with Gradient */}
      <View style={styles.imageWrapper}>
        <Image 
          source={require('../../assets/images/sigin_in.png')}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', '#fff']}
          style={styles.gradient}
          start={{ x: 0, y: 0.7 }}
          end={{ x: 0, y: 1 }}
        />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Discover the magic of{'\n'}Egyptian sweets!</Text>

        {/* Country Code Selector */}
        <TouchableOpacity 
          style={styles.countrySelector}
          onPress={() => router.push('/(auth)/phone-number')}
        >
          <Image 
            source={require('../../assets/images/uae-flag.png')}
            style={styles.flag}
            resizeMode="contain"
          />
          <Text style={styles.countryCode}>+971</Text>
        </TouchableOpacity>

        <Text style={styles.dividerText}>Or connect with social media</Text>

        {/* Social Buttons */}
        <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
          <Image 
            source={require('../../assets/images/google-icon.png')}
            style={styles.socialIcon}
          />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.socialButton, styles.facebookButton]}>
          <Ionicons name="logo-facebook" size={24} color="white" />
          <Text style={[styles.socialButtonText, styles.facebookButtonText]}>
            Continue with Facebook
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageWrapper: {
    height: width * 0.8,
    width: width,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20, // Add padding at the bottom for better scrolling
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 36,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  flag: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  countryCode: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dividerText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  facebookButton: {
    backgroundColor: '#3B5998',
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  facebookButtonText: {
    color: '#fff',
  },
})

export default SignInScreen 