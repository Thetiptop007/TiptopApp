import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfileNavigation } from '../../hooks/useProfileNavigation';
import deliveryAPI from '../../api/delivery.api';

interface Settings {
  contactEmail: string;
  contactPhone: string;
  businessAddress: string;
}

const PrivacyPolicyScreen: React.FC = () => {
  const { navigateToTab } = useProfileNavigation();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigateToTab('Profile', {});
      return true;
    });

    return () => backHandler.remove();
  }, [navigateToTab]);

  const fetchSettings = async () => {
    try {
      const response = await deliveryAPI.getSettings();
      if (response.status === 'success') {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContactSection = () => {
    if (!settings) {
      return `If you have questions about this privacy policy, please contact us:

Email: privacy@thetiptop.com
Phone: +33 1 23 45 67 89
Address: 123 Restaurant Street, Paris, France

Last updated: December 9, 2025`;
    }

    return `If you have questions about this privacy policy, please contact us:

Email: ${settings.contactEmail}
Phone: ${settings.contactPhone}
Address: ${settings.businessAddress}

Last updated: December 9, 2025`;
  };

  const sections = [
    {
      title: '1. Information We Collect',
      content: `We collect information you provide directly to us, including:
      
• Personal information (name, email, phone number)
• Delivery addresses
• Payment information
• Order history and preferences
• Device information and usage data`,
    },
    {
      title: '2. How We Use Your Information',
      content: `We use the information we collect to:

• Process and deliver your orders
• Communicate with you about orders and services
• Improve our services and user experience
• Send promotional communications (with your consent)
• Detect and prevent fraud`,
    },
    {
      title: '3. Information Sharing',
      content: `We may share your information with:

• Delivery partners to fulfill your orders
• Payment processors to process transactions
• Service providers who assist in our operations
• Law enforcement when required by law

We do not sell your personal information to third parties.`,
    },
    {
      title: '4. Data Security',
      content: `We implement appropriate security measures to protect your personal information:

• Encrypted data transmission (SSL/TLS)
• Secure payment processing
• Regular security audits
• Access controls and authentication
• Data backup and recovery procedures`,
    },
    {
      title: '5. Your Rights',
      content: `You have the right to:

• Access your personal data
• Request correction of inaccurate data
• Request deletion of your data
• Opt-out of marketing communications
• Export your data
• Withdraw consent at any time`,
    },
    {
      title: '6. Cookies and Tracking',
      content: `We use cookies and similar technologies to:

• Remember your preferences
• Analyze usage patterns
• Improve app functionality
• Provide personalized content

You can manage cookie preferences in your device settings.`,
    },
    {
      title: '7. Data Retention',
      content: `We retain your information for as long as necessary to:

• Provide our services
• Comply with legal obligations
• Resolve disputes
• Enforce our agreements

You can request deletion of your account and data at any time.`,
    },
    {
      title: '8. Children\'s Privacy',
      content: `Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.`,
    },
    {
      title: '9. Changes to This Policy',
      content: `We may update this privacy policy from time to time. We will notify you of any changes by:

• Posting the new policy in the app
• Sending an email notification
• Displaying a prominent notice

Continued use of our services after changes constitutes acceptance.`,
    },
    {
      title: '10. Contact Us',
      content: getContactSection(),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateToTab('Profile', {})} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
        )}
        
        {/* Intro Section */}
        <View style={styles.introSection}>
          <View style={styles.introIcon}>
            <Ionicons name="shield-checkmark" size={48} color="#34C759" />
          </View>
          <Text style={styles.introTitle}>Your Privacy Matters</Text>
          <Text style={styles.introText}>
            At The Tip Top Restaurant, we are committed to protecting your privacy and ensuring the security of your personal information. This policy explains how we collect, use, and safeguard your data.
          </Text>
        </View>

        {/* Policy Sections */}
        <View style={styles.sectionsContainer}>
          {sections.map((section, index) => (
            <View key={index} style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionContent}>{section.content}</Text>
            </View>
          ))}
        </View>

        {/* Footer Note */}
        <View style={styles.footerSection}>
          <View style={styles.footerIcon}>
            <Ionicons name="lock-closed" size={20} color="#007AFF" />
          </View>
          <Text style={styles.footerText}>
            Your data is encrypted and stored securely. We comply with all applicable data protection regulations including GDPR.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  introSection: {
    backgroundColor: '#fff',
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
  },
  introIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E6F7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 12,
    textAlign: 'center',
  },
  introText: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionsContainer: {
    paddingHorizontal: 20,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#2C2C2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 22,
  },
  footerSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F7FF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  footerIcon: {
    marginTop: 2,
  },
  footerText: {
    flex: 1,
    fontSize: 13,
    color: '#007AFF',
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PrivacyPolicyScreen;
