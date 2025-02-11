import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'

interface ProductCardProps {
  iconName: string
  name: string
  description?: string
  price: number
  onAddToCart?: () => void
  small?: boolean
}

const ProductCard = ({ iconName, name, description, price, onAddToCart, small }: ProductCardProps) => {
  return (
    <View style={[styles.container, small && styles.containerSmall]}>
      <View style={[styles.imageContainer, small && styles.imageContainerSmall]}>
        <Ionicons name={iconName} size={small ? 40 : 50} color="#88D2D9" />
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        {description && (
          <Text style={styles.description} numberOfLines={1}>{description}</Text>
        )}
        <View style={styles.footer}>
          <Text style={styles.price}>AED{price}</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={onAddToCart}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    width: 200,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  containerSmall: {
    width: 160,
  },
  imageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainerSmall: {
    height: 120,
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#88D2D9',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default ProductCard 