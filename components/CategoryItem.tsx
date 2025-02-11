import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

interface CategoryItemProps {
  iconName: string
  label: string
  selected?: boolean
  onPress?: () => void
}

const CategoryItem = ({ iconName, label, selected, onPress }: CategoryItemProps) => {
  const router = useRouter()

  const handlePress = () => {
    onPress?.()
    router.push({
      pathname: '/category',
      params: { name: label }
    })
  }

  return (
    <TouchableOpacity 
      style={[styles.container, selected && styles.containerSelected]}
      onPress={handlePress}
    >
      <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
        <Ionicons name={iconName} size={24} color={selected ? '#88D2D9' : '#666'} />
      </View>
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 24,
  },
  containerSelected: {
    opacity: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainerSelected: {
    backgroundColor: '#E8F7F8',
  },
  label: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  labelSelected: {
    color: '#333',
    fontWeight: '500',
  },
})

export default CategoryItem 