import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfileNavigation } from '../../hooks/useProfileNavigation';
import { addressAPI } from '../../api/address.api';

interface Address {
  _id?: string;
  type: string;
  label?: string;
  apartment?: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

const SavedAddressesScreen: React.FC = () => {
  const { navigateToTab, getTabParams } = useProfileNavigation();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigateToTab('Profile', {});
      return true;
    });

    return () => backHandler.remove();
  }, [navigateToTab]);

  // Watch for screen changes to detect return from AddAddress
  useEffect(() => {
    const profileParams = getTabParams('Profile') || {};
    if (profileParams.screen === 'SavedAddresses' && profileParams.refresh) {
      fetchAddresses();
      // Clear refresh flag
      navigateToTab('Profile', { screen: 'SavedAddresses' });
    }
  }, [getTabParams('Profile')]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressAPI.getAddresses();
      if (response.status === 'success') {
        setAddresses(response.data.addresses);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await addressAPI.setDefaultAddress(addressId);
      Alert.alert('Success', 'Default address updated');
      fetchAddresses();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to set default address');
    }
  };

  const handleDelete = async (addressId: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await addressAPI.deleteAddress(addressId);
              Alert.alert('Success', 'Address deleted successfully');
              fetchAddresses();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete address');
            }
          },
        },
      ]
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'home':
        return 'home';
      case 'work':
        return 'briefcase';
      default:
        return 'location';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateToTab('Profile', {})} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <TouchableOpacity onPress={() => navigateToTab('Profile', { screen: 'AddAddress' })} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e36057ff" />
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="location-outline" size={64} color="#8E8E93" />
          </View>
          <Text style={styles.emptyText}>No Saved Addresses</Text>
          <Text style={styles.emptySubtext}>Add your delivery addresses to make checkout faster</Text>
          <TouchableOpacity style={styles.addAddressButton} onPress={() => navigateToTab('Profile', { screen: 'AddAddress' })}>
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.addAddressButtonText}>Add Address</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {addresses.map((address) => (
            <View key={address._id} style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <View style={styles.addressTypeContainer}>
                  <View style={styles.typeIcon}>
                    <Ionicons name={getTypeIcon(address.type) as any} size={18} color="#007AFF" />
                  </View>
                  <View>
                    <Text style={styles.addressType}>
                      {address.label || address.type.toUpperCase()}
                    </Text>
                    {address.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>Default</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.actionButtons}>
                  {!address.isDefault && (
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => address._id && handleSetDefault(address._id)}
                    >
                      <Ionicons name="checkmark-circle-outline" size={20} color="#34C759" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => address._id && handleDelete(address._id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.addressContent}>
                <Text style={styles.addressText}>
                  {address.apartment && `${address.apartment}, `}
                  {address.street}
                </Text>
                <Text style={styles.addressText}>
                  {address.city}, {address.state} {address.zipCode}
                </Text>
                {address.landmark && (
                  <Text style={styles.landmarkText}>Near: {address.landmark}</Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
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
  addButton: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#8E8E93',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  addAddressButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#2C2C2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  defaultBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressContent: {
    gap: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
  },
  landmarkText: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
  },
});

export default SavedAddressesScreen;
