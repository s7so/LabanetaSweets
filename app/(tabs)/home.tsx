import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform, SafeAreaView, Image } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import ProductCard from '@/components/ProductCard'
import CategoryItem from '@/components/CategoryItem'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// Temporary data - should come from API
const categories = [
  { id: '1', icon: 'ice-cream-outline', label: 'Cheesecake' },
  { id: '2', icon: 'cafe-outline', label: 'Rice Milk' },
  { id: '3', icon: 'wine-outline', label: 'Farghaly Juice' },
  { id: '4', icon: 'restaurant-outline', label: 'Breakfast' },
  { id: '5', icon: 'fast-food-outline', label: 'Ashtoota' },
]

const bestSellingData = [
  {
    id: '1',
    icon: 'cafe',
    name: 'Rice Milk Sahleb',
    description: 'With Nuts',
    price: 16,
  },
  {
    id: '2',
    icon: 'ice-cream',
    name: 'Kunafa',
    description: 'Egyptian Style',
    price: 17,
  },
]

const offersData = [
  {
    id: '1',
    icon: 'pizza',
    name: 'Ashta Nutella',
    description: 'With Pistachios',
    price: 14,
  },
  {
    id: '2',
    icon: 'restaurant',
    name: 'Um Ali Original',
    description: 'Egyptian Style',
    price: 10,
  },
]

const HomeScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('1')
  const [searchText, setSearchText] = useState('')
  const insets = useSafeAreaInsets()

  const bestSelling = bestSellingData.filter(product => {
    return product.name.toLowerCase().includes(searchText.toLowerCase()) ||
           product.description.toLowerCase().includes(searchText.toLowerCase())
  })

  const offers = offersData.filter(product => {
    return product.name.toLowerCase().includes(searchText.toLowerCase()) ||
           product.description.toLowerCase().includes(searchText.toLowerCase())
  })

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Platform.OS === 'android' ? insets.top : 0,
            paddingBottom: insets.bottom,
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Location */}
        <View style={styles.locationWrapper}>
          <TouchableOpacity style={styles.locationButton}>
            <Ionicons name="location-outline" size={24} color="#333" />
            <Text style={styles.locationText}>Al Ain, UAE</Text>
            <Ionicons name="chevron-down" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={24} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Store"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categories}
        >
          {categories.map(category => (
            <CategoryItem
              key={category.id}
              iconName={category.icon}
              label={category.label}
              selected={category.id === selectedCategory}
              onPress={() => setSelectedCategory(category.id)}
            />
          ))}
        </ScrollView>

        {/* Discount Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.banner}>
            <Ionicons name="gift" size={40} color="#88D2D9" />
            <Text style={styles.bannerText}>End of Year Discount</Text>
          </View>
        </View>

        {/* Best Selling */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Best Selling</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
          >
            {bestSelling.map(product => (
              <ProductCard
                key={product.id}
                iconName={product.icon}
                name={product.name}
                description={product.description}
                price={product.price}
                onAddToCart={() => {}}
              />
            ))}
          </ScrollView>
        </View>

        {/* Offers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Offers</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
          >
            {offers.map(product => (
              <ProductCard
                key={product.id}
                iconName={product.icon}
                name={product.name}
                description={product.description}
                price={product.price}
                onAddToCart={() => {}}
                small
              />
            ))}
          </ScrollView>
        </View>

        {/* New Arrival Banner */}
        <View style={styles.bannerContainer}>
          <View style={[styles.banner, styles.newArrivalBanner]}>
            <Ionicons name="star" size={40} color="#88D2D9" />
            <Text style={styles.bannerText}>New Arrivals</Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
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
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 5,
    width: '100%',
  },
  logoContainer: {
    width: '100%',
    height: 100,
    paddingHorizontal: 0,
    overflow: 'hidden',
    marginBottom: 0,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    transform: [{scale: 0.5}],
  },
  locationWrapper: {
    paddingHorizontal: 20,
    marginBottom: 15,
    marginTop: 0,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 5,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    marginHorizontal: 8,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categories: {
    paddingHorizontal: 20,
  },
  bannerContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  banner: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  bannerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  newArrivalBanner: {
    backgroundColor: '#E8F7F8',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#88D2D9',
  },
  productList: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  bottomSpacing: {
    height: 20,
  },
})

export default HomeScreen 