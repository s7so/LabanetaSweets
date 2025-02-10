import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'

const OnboardingScreen = () => {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('../../assets/images/onbording.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to our store</Text>
          <Text style={styles.subtitle}>
            Discover the beauty of the Egyptian desert through authentic products inspired by its rich heritage.
          </Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#88D2D9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
})

export default OnboardingScreen  