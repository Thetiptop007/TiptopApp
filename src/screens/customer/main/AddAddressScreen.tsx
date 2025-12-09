import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfileNavigation } from '../../../hooks/useProfileNavigation';
import { addressAPI, Address, AddressRequest } from '../../../api/address.api';

interface AddAddressScreenProps {
  onClose?: () => void;
  onAddressAdded?: (address: Address) => void;
  editAddress?: Address | null;
}

const AddAddressScreen: React.FC<AddAddressScreenProps> = ({
  onClose,
  onAddressAdded,
  editAddress,
}) => {
  const { navigateToTab } = useProfileNavigation();
  const [formData, setFormData] = useState<AddressRequest>({
    type: 'home',
    label: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    landmark: '',
    isDefault: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<AddressRequest>>({});

  useEffect(() => {
    if (editAddress) {
      setFormData({
        type: editAddress.type,
        label: editAddress.label || '',
        street: editAddress.street,
        apartment: editAddress.apartment || '',
        city: editAddress.city,
        state: editAddress.state,
        zipCode: editAddress.zipCode,
        landmark: editAddress.landmark || '',
        isDefault: editAddress.isDefault,
      });
    }
  }, [editAddress]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (onClose) {
        onClose();
      } else {
        navigateToTab('Profile', { screen: 'SavedAddresses' });
      }
      return true;
    });

    return () => backHandler.remove();
  }, [navigateToTab, onClose]);

  const validateForm = (): boolean => {
    const newErrors: Partial<AddressRequest> = {};

    if (!formData.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'Zip code is required';
    } else if (!/^\d{6}$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Invalid zip code (6 digits required)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      if (editAddress) {
        response = await addressAPI.updateAddress(editAddress._id!, formData);
        Alert.alert('Success', 'Address updated successfully');
      } else {
        response = await addressAPI.addAddress(formData);
        Alert.alert('Success', 'Address added successfully');
      }

      if (onAddressAdded) {
        onAddressAdded(response.data.address);
      }
      
      // Navigate back to SavedAddresses with refresh flag
      if (onClose) {
        onClose();
      } else {
        navigateToTab('Profile', { screen: 'SavedAddresses', refresh: true });
      }
    } catch (error: any) {
      console.error('Error saving address:', error);
      Alert.alert(
        'Error',
        error?.message || 'Failed to save address. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof AddressRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => onClose ? onClose() : navigateToTab('Profile', { screen: 'SavedAddresses' })}
        >
          <Ionicons name="chevron-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {editAddress ? 'Edit Address' : 'Add New Address'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Address Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Address Type</Text>
          <View style={styles.typeContainer}>
            {(['home', 'work', 'other'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  formData.type === type && styles.typeButtonActive,
                ]}
                onPress={() => updateFormData('type', type)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={
                    type === 'home'
                      ? 'home'
                      : type === 'work'
                      ? 'briefcase'
                      : 'location'
                  }
                  size={20}
                  color={formData.type === type ? '#FFFFFF' : '#8E8E93'}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    formData.type === type && styles.typeButtonTextActive,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Label */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Label (Optional) <Text style={styles.optional}>e.g., My Home, Office HQ</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter label"
            placeholderTextColor="#8E8E93"
            value={formData.label}
            onChangeText={(text) => updateFormData('label', text)}
          />
        </View>

        {/* Apartment/Flat */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Flat / Apartment (Optional)
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Flat 101, Building A"
            placeholderTextColor="#8E8E93"
            value={formData.apartment}
            onChangeText={(text) => updateFormData('apartment', text)}
          />
        </View>

        {/* Street Address */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Street Address <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.street && styles.inputError]}
            placeholder="e.g., 123 Main Street"
            placeholderTextColor="#8E8E93"
            value={formData.street}
            onChangeText={(text) => updateFormData('street', text)}
            multiline
            numberOfLines={2}
          />
          {errors.street && <Text style={styles.errorText}>{errors.street}</Text>}
        </View>

        {/* Landmark */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Nearby Landmark (Optional)
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Near City Mall"
            placeholderTextColor="#8E8E93"
            value={formData.landmark}
            onChangeText={(text) => updateFormData('landmark', text)}
          />
        </View>

        {/* City & State */}
        <View style={styles.row}>
          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>
              City <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.city && styles.inputError]}
              placeholder="City"
              placeholderTextColor="#8E8E93"
              value={formData.city}
              onChangeText={(text) => updateFormData('city', text)}
            />
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
          </View>

          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>
              State <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.state && styles.inputError]}
              placeholder="State"
              placeholderTextColor="#8E8E93"
              value={formData.state}
              onChangeText={(text) => updateFormData('state', text)}
            />
            {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
          </View>
        </View>

        {/* Zip Code */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Zip Code <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.zipInput, errors.zipCode && styles.inputError]}
            placeholder="e.g., 400001"
            placeholderTextColor="#8E8E93"
            value={formData.zipCode}
            onChangeText={(text) => updateFormData('zipCode', text.replace(/\D/g, ''))}
            keyboardType="number-pad"
            maxLength={6}
          />
          {errors.zipCode && <Text style={styles.errorText}>{errors.zipCode}</Text>}
        </View>

        {/* Set as Default */}
        <TouchableOpacity
          style={styles.defaultCheckbox}
          onPress={() => updateFormData('isDefault', !formData.isDefault)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, formData.isDefault && styles.checkboxActive]}>
            {formData.isDefault && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkboxLabel}>Set as default address</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>
                {editAddress ? 'Update Address' : 'Save Address'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    fontFamily: 'System',
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
    fontFamily: 'System',
  },
  optional: {
    fontSize: 12,
    fontWeight: '400',
    color: '#8E8E93',
  },
  required: {
    color: '#e36057ff',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1C1C1E',
    fontFamily: 'System',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  zipInput: {
    maxWidth: 150,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
    fontFamily: 'System',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E7',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  typeButtonActive: {
    borderColor: '#e36057ff',
    backgroundColor: '#e36057ff',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    fontFamily: 'System',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  defaultCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D1D6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: '#e36057ff',
    borderColor: '#e36057ff',
  },
  checkboxLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
    fontFamily: 'System',
  },
  bottomSpacer: {
    height: 100,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e36057ff',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
});

export default AddAddressScreen;
