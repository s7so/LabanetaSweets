import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const CartScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cart</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
})

export default CartScreen 