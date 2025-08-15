import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    FlatList,
    Image,
    TextInput,
    Modal,
    Alert,
    Animated,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { MenuItem } from '../../types';
import { categories } from '../../data/menuData';

const MenuManagementScreen: React.FC = () => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([
        {
            id: '1',
            name: 'Chicken Dum Biryani',
            description: 'Aromatic basmati rice cooked with tender chicken pieces, slow-cooked with traditional spices',
            price: 12.99,
            category: 'Biryani',
            available: true,
            image: 'https://images.unsplash.com/photo-1563379091339-03246963d29c?w=400',
            rating: 4.5,
            reviews: 128
        },
        {
            id: '2',
            name: 'Butter Chicken',
            description: 'Creamy tomato-based chicken curry with rich butter and aromatic spices',
            price: 14.99,
            category: 'Main Course Non-Veg',
            available: true,
            image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400',
            rating: 4.7,
            reviews: 95
        },
        {
            id: '3',
            name: 'Paneer Butter Masala',
            description: 'Rich and creamy paneer curry with tomatoes, butter, and traditional Indian spices',
            price: 11.99,
            category: 'Main Course Veg',
            available: false,
            image: 'https://images.unsplash.com/photo-1631292784640-2b24be784d5d?w=400',
            rating: 4.3,
            reviews: 67
        },
        {
            id: '4',
            name: 'Veg Thali',
            description: 'Complete meal with sabzi, dal fry, 2 tandoori roti, rice and salad',
            price: 8.99,
            category: 'Thali',
            available: true,
            image: 'https://images.unsplash.com/photo-1694844618864-8d4fd3fb8d91?w=400',
            rating: 4.4,
            reviews: 89
        },
        {
            id: '5',
            name: 'Tandoori Chicken',
            description: 'Marinated chicken cooked in traditional tandoor oven with aromatic spices',
            price: 16.99,
            category: 'Tandoori Snacks',
            available: true,
            image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
            rating: 4.6,
            reviews: 156
        },
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        portion: '',
        rating: '',
    });

    const searchLogoShakeAnimation = useRef(new Animated.Value(0)); // For logo shake animation
    const searchLogoJumpAnimation = useRef(new Animated.Value(0)); // For logo jump animation

    // Logo shake and jump animation effect
    useEffect(() => {
        const startShakeAndJumpAnimation = () => {
            Animated.parallel([
                // Shake animation (rotation)
                Animated.sequence([
                    Animated.timing(searchLogoShakeAnimation.current, {
                        toValue: -5,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    Animated.timing(searchLogoShakeAnimation.current, {
                        toValue: 5,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    Animated.timing(searchLogoShakeAnimation.current, {
                        toValue: -3,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    Animated.timing(searchLogoShakeAnimation.current, {
                        toValue: 3,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    Animated.timing(searchLogoShakeAnimation.current, {
                        toValue: 0,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                ]),
                // Jump animation (vertical translation)
                Animated.sequence([
                    Animated.timing(searchLogoJumpAnimation.current, {
                        toValue: -8,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                    Animated.timing(searchLogoJumpAnimation.current, {
                        toValue: -12,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    Animated.timing(searchLogoJumpAnimation.current, {
                        toValue: -5,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    Animated.timing(searchLogoJumpAnimation.current, {
                        toValue: 0,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();
        };

        // Start the animation immediately
        startShakeAndJumpAnimation();

        // Set up interval to repeat every 5 seconds
        const animationInterval = setInterval(startShakeAndJumpAnimation, 5000);

        // Cleanup interval on component unmount
        return () => clearInterval(animationInterval);
    }, []);

    // Filter items based on search and category
    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleAddItem = () => {
        setEditingItem(null);
        setFormData({ name: '', description: '', price: '', category: '', image: '', portion: '', rating: '' });
        setModalVisible(true);
    };

    const handleEditItem = (item: MenuItem) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description,
            price: item.price.toString(),
            category: item.category,
            image: item.image || '',
            portion: item.portion || '',
            rating: item.rating ? item.rating.toString() : '',
        });
        setModalVisible(true);
    };

    const handleSaveItem = () => {
        if (!formData.name || !formData.description || !formData.price || !formData.category) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        const newItem: MenuItem = {
            id: editingItem ? editingItem.id : Date.now().toString(),
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            category: formData.category,
            available: editingItem ? editingItem.available : true,
            image: formData.image || undefined,
            rating: formData.rating ? parseFloat(formData.rating) : (editingItem ? editingItem.rating : 4.0),
            reviews: editingItem ? editingItem.reviews : 0,
            portion: formData.portion ? formData.portion as "Quarter" | "Half" | "Full" : undefined,
        };

        if (editingItem) {
            setMenuItems(prev => prev.map(item =>
                item.id === editingItem.id ? newItem : item
            ));
        } else {
            setMenuItems(prev => [...prev, newItem]);
        }

        setModalVisible(false);
    };

    const handleDeleteItem = (itemId: string) => {
        Alert.alert(
            'Delete Item',
            'Are you sure you want to delete this item?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => setMenuItems(prev => prev.filter(item => item.id !== itemId)),
                },
            ]
        );
    };

    const toggleAvailability = (itemId: string) => {
        setMenuItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, available: !item.available } : item
        ));
    };

    const pickImageFromGallery = () => {
        const options = {
            mediaType: 'photo' as MediaType,
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
        };

        launchImageLibrary(options, (response: ImagePickerResponse) => {
            if (response.didCancel || response.errorMessage) {
                return;
            }
            if (response.assets && response.assets[0]) {
                setFormData(prev => ({ ...prev, image: response.assets![0].uri! }));
            }
        });
    };

    const takePhotoFromCamera = () => {
        const options = {
            mediaType: 'photo' as MediaType,
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
        };

        launchCamera(options, (response: ImagePickerResponse) => {
            if (response.didCancel || response.errorMessage) {
                return;
            }
            if (response.assets && response.assets[0]) {
                setFormData(prev => ({ ...prev, image: response.assets![0].uri! }));
            }
        });
    };

    const showImagePickerOptions = () => {
        if (formData.image) {
            Alert.alert(
                'Image Options',
                'Choose an option',
                [
                    { text: 'Change Image', onPress: showImageSelectorOptions },
                    { text: 'Remove Image', onPress: () => setFormData(prev => ({ ...prev, image: '' })), style: 'destructive' },
                    { text: 'Cancel', style: 'cancel' },
                ]
            );
        } else {
            showImageSelectorOptions();
        }
    };

    const showImageSelectorOptions = () => {
        Alert.alert(
            'Select Image',
            'Choose how you want to select an image',
            [
                { text: 'Camera', onPress: takePhotoFromCamera },
                { text: 'Gallery', onPress: pickImageFromGallery },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const renderCategoryFilter = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.categoryContainer}
            onPress={() => setSelectedCategory(item.name)}
            activeOpacity={0.7}
        >
            <View style={[
                styles.categoryIcon,
                selectedCategory === item.name && styles.selectedCategoryIcon
            ]}>
                <Text style={styles.categoryEmoji}>{item.icon}</Text>
            </View>
            <Text style={[
                styles.categoryText,
                selectedCategory === item.name && styles.selectedCategoryText
            ]}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    const renderMenuItem = ({ item }: { item: MenuItem }) => (
        <View style={styles.menuCard}>
            <View style={styles.menuImageContainer}>
                {item.image ? (
                    <Image
                        source={{ uri: item.image }}
                        style={styles.menuImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.menuImagePlaceholder}>
                        <Ionicons name="restaurant" size={40} color="#8E8E93" />
                    </View>
                )}
                <TouchableOpacity
                    style={[
                        styles.availabilityBadge,
                        { backgroundColor: item.available ? '#4CAF50' : '#F44336' }
                    ]}
                    onPress={() => toggleAvailability(item.id)}
                >
                    <Ionicons
                        name={item.available ? 'checkmark-circle' : 'close-circle'}
                        size={12}
                        color="#FFFFFF"
                    />
                    <Text style={styles.availabilityText}>
                        {item.available ? 'Available' : 'Unavailable'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.menuInfo}>
                <View style={styles.menuHeader}>
                    <Text style={styles.menuName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.menuPrice}>₹{item.price.toFixed(2)}</Text>
                </View>

                <Text style={styles.menuDescription} numberOfLines={2}>{item.description}</Text>

                <View style={styles.menuMeta}>
                    <View style={styles.categoryTagContainer}>
                        <Ionicons name="pricetag" size={12} color="#8E8E93" />
                        <Text style={styles.menuCategory}>{item.category}</Text>
                    </View>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={12} color="#e36057ff" />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                        <Text style={styles.reviewsText}>({item.reviews})</Text>
                    </View>
                </View>

                <View style={styles.menuActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => handleEditItem(item)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="pencil" size={16} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteItem(item.id)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="trash" size={16} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Menu Management</Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#8E8E93" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search menu items..."
                        placeholderTextColor="#8E8E93"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <Animated.Image
                        source={require('../../../assets/logo.png')}
                        style={[
                            styles.searchLogo,
                            {
                                transform: [
                                    {
                                        rotate: searchLogoShakeAnimation.current.interpolate({
                                            inputRange: [-5, 5],
                                            outputRange: ['-5deg', '5deg']
                                        })
                                    },
                                    { translateY: searchLogoJumpAnimation.current }
                                ]
                            }
                        ]}
                        resizeMode="contain"
                    />
                </View>

                {/* Categories */}
                <View style={styles.categoriesContainer}>
                    <FlatList
                        data={categories}
                        renderItem={renderCategoryFilter}
                        keyExtractor={(item) => item.name}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoriesContainer}
                        contentContainerStyle={styles.categoriesContent}
                    />
                </View>

                {/* Menu Items List */}
                <View style={styles.menuContainer}>
                    <View style={styles.menuHeaderRow}>
                        <Text style={styles.sectionTitle}>
                            {selectedCategory === 'All' ? 'All Items' : selectedCategory} ({filteredItems.length})
                        </Text>
                        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
                            <Ionicons name="add" size={20} color="#FFFFFF" />
                            <Text style={styles.addButtonText}>Add Item</Text>
                        </TouchableOpacity>
                    </View>

                    {filteredItems.length > 0 ? (
                        <FlatList
                            data={filteredItems}
                            renderItem={renderMenuItem}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.menuList}
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="restaurant-outline" size={64} color="#8E8E93" />
                            <Text style={styles.emptyStateTitle}>No items found</Text>
                            <Text style={styles.emptyStateText}>
                                {searchQuery ? 'Try adjusting your search criteria' : 'Add your first menu item to get started'}
                            </Text>
                            {!searchQuery && (
                                <TouchableOpacity
                                    style={[styles.addButton, { marginTop: 20 }]}
                                    onPress={handleAddItem}
                                >
                                    <Ionicons name="add" size={20} color="#FFFFFF" />
                                    <Text style={styles.addButtonText}>Add First Item</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Enhanced Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalTitleContainer}>
                                <Ionicons 
                                    name={editingItem ? "pencil" : "add-circle"} 
                                    size={24} 
                                    color="#e36057ff" 
                                />
                                <Text style={styles.modalTitle}>
                                    {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Ionicons name="close" size={24} color="#8E8E93" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Item Name Input */}
                            <View style={styles.inputGroup}>
                                <View style={styles.labelContainer}>
                                    <Text style={styles.inputLabel}>Item Name</Text>
                                    <Text style={styles.requiredIndicator}>*</Text>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter item name"
                                    placeholderTextColor="#8E8E93"
                                    value={formData.name}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                                />
                            </View>

                            {/* Description Input */}
                            <View style={styles.inputGroup}>
                                <View style={styles.labelContainer}>
                                    <Text style={styles.inputLabel}>Description</Text>
                                    <Text style={styles.requiredIndicator}>*</Text>
                                </View>
                                <TextInput
                                    style={[styles.input, styles.textAreaInput]}
                                    placeholder="Describe the dish, ingredients, and preparation..."
                                    placeholderTextColor="#8E8E93"
                                    value={formData.description}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>

                            {/* Price and Rating Row */}
                            <View style={styles.inputRow}>
                                <View style={[styles.inputGroup, styles.halfInput]}>
                                    <View style={styles.labelContainer}>
                                        <Text style={styles.inputLabel}>Price (₹)</Text>
                                        <Text style={styles.requiredIndicator}>*</Text>
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0.00"
                                        placeholderTextColor="#8E8E93"
                                        value={formData.price}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={[styles.inputGroup, styles.halfInput]}>
                                    <Text style={styles.inputLabel}>Rating (1-5)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="4.0"
                                        placeholderTextColor="#8E8E93"
                                        value={formData.rating}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, rating: text }))}
                                        keyboardType="decimal-pad"
                                    />
                                </View>
                            </View>

                            {/* Portion Size */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Portion Size (Optional)</Text>
                                <View style={styles.portionButtonsContainer}>
                                    {['Quarter', 'Half', 'Full'].map((portion) => (
                                        <TouchableOpacity
                                            key={portion}
                                            style={[
                                                styles.portionButton,
                                                formData.portion === portion && styles.selectedPortionButton
                                            ]}
                                            onPress={() => setFormData(prev => ({ ...prev, portion }))}
                                        >
                                            <Text style={[
                                                styles.portionButtonText,
                                                formData.portion === portion && styles.selectedPortionButtonText
                                            ]}>
                                                {portion}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Category Selection */}
                            <View style={styles.inputGroup}>
                                <View style={styles.labelContainer}>
                                    <Text style={styles.inputLabel}>Category</Text>
                                    <Text style={styles.requiredIndicator}>*</Text>
                                </View>
                                <View style={styles.categoryRadioContainer}>
                                    {categories.filter(cat => cat.name !== 'All').map((category) => (
                                        <TouchableOpacity
                                            key={category.name}
                                            style={[
                                                styles.categoryRadioButton,
                                                formData.category === category.name && styles.selectedCategoryRadioButton
                                            ]}
                                            onPress={() => setFormData(prev => ({ ...prev, category: category.name }))}
                                        >
                                            <View style={[
                                                styles.radioCircle,
                                                formData.category === category.name && styles.selectedRadioCircle
                                            ]}>
                                                {formData.category === category.name && (
                                                    <View style={styles.radioDot} />
                                                )}
                                            </View>
                                            <Text style={styles.categoryEmoji}>{category.icon}</Text>
                                            <Text style={[
                                                styles.categoryRadioText,
                                                formData.category === category.name && styles.selectedCategoryRadioText
                                            ]}>
                                                {category.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Image Selection */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Item Image (Optional)</Text>
                                <TouchableOpacity
                                    style={styles.imageUploadButton}
                                    onPress={showImagePickerOptions}
                                >
                                    <Ionicons name="camera" size={24} color="#e36057ff" />
                                    <Text style={styles.imageUploadButtonText}>
                                        {formData.image ? 'Change Image' : 'Select from Gallery or Camera'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Image Preview */}
                            {formData.image ? (
                                <View style={styles.imagePreviewContainer}>
                                    <Text style={styles.imagePreviewLabel}>Image Preview:</Text>
                                    <View style={styles.imagePreviewWrapper}>
                                        <Image
                                            source={{ uri: formData.image }}
                                            style={styles.imagePreview}
                                            resizeMode="cover"
                                        />
                                        <TouchableOpacity
                                            style={styles.removeImageButton}
                                            onPress={() => setFormData(prev => ({ ...prev, image: '' }))}
                                        >
                                            <Ionicons name="close-circle" size={24} color="#F44336" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <Ionicons name="image-outline" size={48} color="#8E8E93" />
                                    <Text style={styles.imagePlaceholderText}>No image selected</Text>
                                </View>
                            )}

                            {/* Modal Actions */}
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.saveButton]}
                                    onPress={handleSaveItem}
                                >
                                    <Ionicons name={editingItem ? "checkmark" : "add"} size={18} color="#FFFFFF" />
                                    <Text style={styles.modalButtonText}>
                                        {editingItem ? 'Update Item' : 'Add Item'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    titleContainer: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        textAlign: 'left',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 20,
        paddingHorizontal: 15,
        paddingVertical: 2,
        borderRadius: 25,
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 6,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    searchLogo: {
        width: 30,
        height: 30,
        marginLeft: 10,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        paddingVertical: 16,
        fontFamily: 'System',
        color: '#1C1C1E',
        fontWeight: '500',
    },
    categoryFilterContainer: {
        marginBottom: 20,
        marginTop: 15,
    },
    categoryFilterContent: {
        paddingHorizontal: 20,
    },
    categoriesContainer: {
        marginBottom: 20,
        marginTop: 5,
    },
    categoriesContent: {
        paddingHorizontal: 20,
    },
    categoryContainer: {
        alignItems: 'center',
        marginRight: 30,
    },
    categoryIcon: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        backgroundColor: '#F5F5F7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    selectedCategoryIcon: {
        backgroundColor: '#343435ff',
        shadowColor: '#e36057ff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 2,
        borderColor: 'rgba(227, 96, 87, 0.3)',
    },
    categoryEmoji: {
        fontSize: 20,
    },
    categoryText: {
        fontSize: 12,
        color: '#8E8E93',
        textAlign: 'center',
        fontWeight: '500',
        fontFamily: 'System',
        marginTop: 2,
    },
    selectedCategoryText: {
        color: '#e36057ff',
        fontWeight: '700',
        fontFamily: 'System',
        fontSize: 13,
    },
    menuContainer: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    menuHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e36057ff',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 25,
        shadowColor: '#e36057ff',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 0.5,
        borderColor: 'rgba(227, 96, 87, 0.3)',
    },
    addButtonText: {
        color: '#FFFFFF',
        marginLeft: 8,
        fontWeight: '700',
        fontFamily: 'System',
        fontSize: 15,
        letterSpacing: 0.5,
    },
    menuList: {
        paddingBottom: 20,
    },
    menuCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginBottom: 18,
        shadowColor: '#1C1C1E',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 12,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: '#F0F0F0',
        // Add subtle gradient effect
        position: 'relative',
    },
    menuImageContainer: {
        position: 'relative',
        height: 180,
        width: '100%',
        backgroundColor: '#F8F9FA',
    },
    menuImage: {
        width: '100%',
        height: '100%',
    },
    menuImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F5F5F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    availabilityBadge: {
        position: 'absolute',
        top: 15,
        right: 15,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#1C1C1E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    availabilityText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
        marginLeft: 4,
        fontFamily: 'System',
    },
    menuInfo: {
        padding: 20,
        backgroundColor: '#FFFFFF',
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    menuName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        flex: 1,
        marginRight: 12,
    },
    menuPrice: {
        fontSize: 20,
        fontWeight: '800',
        color: '#e36057ff',
        fontFamily: 'System',
        letterSpacing: 0.5,
    },
    menuDescription: {
        fontSize: 14,
        color: '#8E8E93',
        lineHeight: 20,
        fontFamily: 'System',
        marginBottom: 12,
    },
    menuMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    categoryTagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E5E7',
    },
    menuCategory: {
        fontSize: 12,
        color: '#2C2C2E',
        fontFamily: 'System',
        fontWeight: '600',
        marginLeft: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8F5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e36057ff',
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#e36057ff',
        marginLeft: 4,
        fontFamily: 'System',
    },
    reviewsText: {
        fontSize: 11,
        color: '#e36057ff',
        fontFamily: 'System',
        marginLeft: 2,
        opacity: 0.8,
    },
    menuActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 4,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 16,
        shadowColor: '#1C1C1E',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    editButton: {
        backgroundColor: '#1C1C1E',
    },
    deleteButton: {
        backgroundColor: '#e36057ff',
    },
    actionButtonText: {
        color: '#FFFFFF',
        marginLeft: 8,
        fontSize: 13,
        fontWeight: '700',
        fontFamily: 'System',
        letterSpacing: 0.3,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
        marginTop: 16,
        marginBottom: 8,
        fontFamily: 'System',
    },
    emptyStateText: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
        fontFamily: 'System',
        paddingHorizontal: 40,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 40,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        marginLeft: 10,
    },
    closeButton: {
        padding: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E5EA',
        padding: 16,
        borderRadius: 14,
        marginBottom: 0,
        fontSize: 16,
        fontFamily: 'System',
        backgroundColor: '#FAFAFA',
        color: '#1C1C1E',
        shadowColor: '#1C1C1E',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    textAreaInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
    },
    halfInput: {
        flex: 1,
        marginBottom: 0,
    },
    imagePreviewContainer: {
        marginBottom: 20,
    },
    imagePreviewLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 8,
        fontFamily: 'System',
    },
    imagePreview: {
        width: '100%',
        height: 160,
        borderRadius: 16,
        backgroundColor: '#F5F5F7',
        borderWidth: 1,
        borderColor: '#E5E5E7',
        shadowColor: '#1C1C1E',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F5F5F7',
    },
    saveButton: {
        backgroundColor: '#e36057ff',
        shadowColor: '#e36057ff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        fontFamily: 'System',
    },
    cancelButtonText: {
        color: '#8E8E93',
    },
    // New styles for enhanced modal
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 8,
        fontFamily: 'System',
    },
    categorySuggestions: {
        marginBottom: 20,
    },
    suggestionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8E8E93',
        marginBottom: 10,
        fontFamily: 'System',
    },
    suggestionButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    suggestionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 22,
        borderWidth: 1.5,
        borderColor: '#E5E5E7',
        marginBottom: 8,
        shadowColor: '#1C1C1E',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    selectedSuggestionButton: {
        backgroundColor: '#e36057ff',
        borderColor: '#e36057ff',
        shadowColor: '#e36057ff',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
        transform: [{ scale: 1.02 }],
    },
    suggestionButtonText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#2C2C2E',
        marginLeft: 4,
        fontFamily: 'System',
    },
    selectedSuggestionButtonText: {
        color: '#FFFFFF',
    },
    imagePlaceholder: {
        width: '100%',
        height: 140,
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E5E7',
        borderStyle: 'dashed',
        marginBottom: 20,
        shadowColor: '#1C1C1E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    imagePlaceholderText: {
        fontSize: 13,
        color: '#8E8E93',
        marginTop: 8,
        fontFamily: 'System',
        fontWeight: '500',
    },
    portionButtonsContainer: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 8,
    },
    portionButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: '#F8F9FA',
        borderWidth: 1.5,
        borderColor: '#E5E5E7',
        alignItems: 'center',
        shadowColor: '#1C1C1E',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    selectedPortionButton: {
        backgroundColor: '#e36057ff',
        borderColor: '#e36057ff',
        shadowColor: '#e36057ff',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
        transform: [{ scale: 1.02 }],
    },
    portionButtonText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#2C2C2E',
        fontFamily: 'System',
    },
    selectedPortionButtonText: {
        color: '#FFFFFF',
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    requiredIndicator: {
        fontSize: 14,
        color: '#e36057ff',
        fontWeight: '700',
        marginLeft: 4,
    },
    // Category radio buttons
    categoryRadioContainer: {
        flexDirection: 'column',
        gap: 8,
    },
    categoryRadioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E5E5E7',
    },
    selectedCategoryRadioButton: {
        backgroundColor: '#FFF8F5',
        borderColor: '#e36057ff',
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#E5E5E7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    selectedRadioCircle: {
        borderColor: '#e36057ff',
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#e36057ff',
    },
    categoryRadioText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2C2C2E',
        fontFamily: 'System',
        marginLeft: 8,
    },
    selectedCategoryRadioText: {
        color: '#e36057ff',
        fontWeight: '600',
    },
    // Image upload styles
    imageUploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        borderWidth: 2,
        borderColor: '#e36057ff',
        borderStyle: 'dashed',
        gap: 8,
    },
    imageUploadButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#e36057ff',
        fontFamily: 'System',
    },
    imagePreviewWrapper: {
        position: 'relative',
    },
    removeImageButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 12,
    },
});

export default MenuManagementScreen;
