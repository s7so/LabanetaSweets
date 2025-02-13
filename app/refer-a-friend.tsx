import { View, Text, StyleSheet, TouchableOpacity, Share, Clipboard, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const ReferFriendScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [copied, setCopied] = useState(false)
  
  // Temporary referral code - should come from API
  const referralCode = 'SWEET250'
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Use my referral code ${referralCode} to get 250 points on your first order at Labaneta Sweet!`,
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const handleCopy = () => {
    Clipboard.setString(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer a friend</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Referral Code Section */}
        <View style={styles.codeSection}>
          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>Your referral code</Text>
            <Text style={styles.code}>{referralCode}</Text>
            <TouchableOpacity 
              style={styles.copyButton}
              onPress={handleCopy}
            >
              <Ionicons 
                name={copied ? "checkmark" : "copy-outline"} 
                size={20} 
                color="#88D2D9" 
              />
              <Text style={styles.copyButtonText}>
                {copied ? 'Copied!' : 'Copy Code'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Ionicons name="share-social-outline" size={24} color="#fff" />
            <Text style={styles.shareButtonText}>Share with friends</Text>
          </TouchableOpacity>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <View style={styles.benefitIcon}>
            <Ionicons name="gift" size={32} color="#88D2D9" />
          </View>
          <Text style={styles.benefitsTitle}>How it works</Text>
          <Text style={styles.benefitsText}>
            Share your referral code with friends and family. When they make their first order using your code, you'll both receive 250 points that can be used for discounts on future orders!
          </Text>
        </View>

        {/* Bottom padding for better scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
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
  codeSection: {
    padding: 20,
    alignItems: 'center',
  },
  codeContainer: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  codeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  code: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 2,
    marginBottom: 16,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyButtonText: {
    color: '#88D2D9',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  shareButton: {
    backgroundColor: '#88D2D9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  benefitsSection: {
    padding: 20,
    alignItems: 'center',
  },
  benefitIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#E8F7F8',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  benefitsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 20,
  },
})

export default ReferFriendScreen 