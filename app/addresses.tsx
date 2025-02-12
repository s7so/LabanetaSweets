import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAddress } from '@/context/AddressContext'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const AddressesScreen = () => {
  const router = useRouter()
  const { addresses, loadAddresses, setDefaultAddress, deleteAddress } = useAddress()
  const insets = useSafeAreaInsets()

  useEffect(() => {
    loadAddresses()
  }, [])

  const handleDeleteAddress = (id: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteAddress(id);
            Alert.alert('Success', 'Address deleted successfully');
          },
        },
      ]
    );
  };

  const handleSelectAddress = (id: string) => {
    setDefaultAddress(id)
    router.back()
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>My Addresses</Text>
        <TouchableOpacity onPress={() => router.push('/add-address')}>
          <Ionicons name="add" size={24} color="#88D2D9" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {addresses.length === 0 ? (
          <Text style={styles.noAddressesText}>No saved addresses found</Text>
        ) : (
          addresses.map(address => (
            <TouchableOpacity 
              key={address.id}
              style={[
                styles.addressCard,
                address.isDefault && styles.addressCardSelected
              ]}
              onPress={() => handleSelectAddress(address.id)}
            >
              <View style={styles.addressHeader}>
                <Text style={styles.addressTitle}>{address.title}</Text>
                {address.isDefault && (
                  <Text style={styles.defaultBadge}>Default</Text>
                )}
              </View>
              <Text style={styles.addressText}>{address.address}</Text>
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeleteAddress(address.id);
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                  <Text style={[styles.actionText, { color: '#FF6B6B' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
              <View style={[
                styles.radioButton,
                address.isDefault && styles.radioButtonSelected
              ]}>
                {address.isDefault && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))
        )}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/add-address')}
        >
          <Text style={styles.addButtonText}>Add New Address</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
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
  content: {
    flex: 1,
    padding: 16,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    position: 'relative',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  defaultBadge: {
    backgroundColor: '#E8F7F8',
    color: '#88D2D9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#88D2D9',
    fontSize: 14,
  },
  radioButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#88D2D9',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#88D2D9',
  },
  addButton: {
    backgroundColor: '#88D2D9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  noAddressesText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 32,
  },
  addressCardSelected: {
    borderColor: '#88D2D9',
    backgroundColor: '#F8FDFE',
  },
})

export default AddressesScreen 