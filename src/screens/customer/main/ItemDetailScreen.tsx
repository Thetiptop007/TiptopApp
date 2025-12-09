import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, StatusBar, ActivityIndicator, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MenuItem, PortionSize } from '../../../types';
import { useCart } from '../../../contexts/CartContext';
import { useSwipeNavigation } from '../../../contexts/SwipeNavigationContext';
import { menuAPI } from '../../../api/menu.api';
import { adaptBackendMenuItems } from '../../../utils/menuAdapter';

const { width: screenWidth } = Dimensions.get('window');

interface ItemDetailScreenProps {
    item: MenuItem;
    onClose: () => void;
    onSelectItem?: (item: MenuItem) => void;
}

const ItemDetailScreen: React.FC<ItemDetailScreenProps> = ({ item, onClose, onSelectItem }) => {
    const { addToCart, cartItems, updateQuantity, getItemQuantity } = useCart();
    const { navigateToOrder } = useSwipeNavigation();
    
    // State for related items
    const [relatedItems, setRelatedItems] = useState<MenuItem[]>([]);
    const [loadingRelated, setLoadingRelated] = useState(true);
    
    // Get available portions from priceVariants or use default
    const availablePortions = useMemo(() => {
        if (item.priceVariants && item.priceVariants.length > 0) {
            return item.priceVariants;
        }
        // Fallback to single portion with item price
        return [{ quantity: (item.portion || 'Full') as PortionSize, price: item.price }];
    }, [item.priceVariants, item.price, item.portion]);

    const [selectedPortionIndex, setSelectedPortionIndex] = useState(0);
    const selectedPortion = availablePortions[selectedPortionIndex];
    
    // Get quantity for ONLY the currently selected portion
    const quantity = getItemQuantity(item.id, selectedPortion.quantity);

    // Fetch related items from the same category
    useEffect(() => {
        const fetchRelatedItems = async () => {
            try {
                setLoadingRelated(true);
                const response = await menuAPI.getMenuItems({
                    category: item.category,
                    isAvailable: true,
                    limit: 10,
                    page: 1,
                    sort: '-rating'
                });
                
                // Adapt and filter out current item
                const adapted = adaptBackendMenuItems(response.data.menuItems);
                const filtered = adapted.filter(i => i.id !== item.id);
                setRelatedItems(filtered);
            } catch (error) {
                console.error('Error fetching related items:', error);
                setRelatedItems([]);
            } finally {
                setLoadingRelated(false);
            }
        };

        fetchRelatedItems();
    }, [item.category, item.id]);

    // Handle hardware back button press
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            onClose();
            return true; // Prevent default behavior (app exit)
        });

        return () => backHandler.remove();
    }, [onClose]);

    const handleAddToCart = () => {
        if (quantity === 0) {
            // Create a new item with selected portion and price
            const itemToAdd: MenuItem = {
                ...item,
                portion: selectedPortion.quantity,
                price: selectedPortion.price,
            };
            addToCart(itemToAdd);
        }
    };

    const handleQuantityChange = (newQuantity: number) => {
        // Update quantity for the SPECIFIC portion selected
        updateQuantity(item.id, newQuantity, selectedPortion.quantity);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Header Image */}
            <View style={styles.imageContainer}>
                {item.image ? (
                    <Image
                        source={{ uri: item.image }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="restaurant" size={80} color="#8E8E93" />
                    </View>
                )}
                
                {/* Gradient Overlay */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.imageGradient}
                />
                
                {/* Back Button */}
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={onClose}
                    activeOpacity={0.8}
                >
                    <View style={styles.backButtonInner}>
                        <Ionicons name="chevron-back" size={24} color="#1C1C1E" />
                    </View>
                </TouchableOpacity>

                {/* Cart Button */}
                <TouchableOpacity 
                    style={styles.cartButton}
                    onPress={() => {
                        onClose();
                        navigateToOrder('Cart');
                    }}
                    activeOpacity={0.8}
                >
                    <View style={styles.cartButtonInner}>
                        <Ionicons name="bag-outline" size={24} color="#1C1C1E" />
                        {cartItems.length > 0 && (
                            <View style={styles.cartBadge}>
                                <Text style={styles.cartBadgeText}>
                                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                                </Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>

                {/* Rating Badge */}
                {item.rating && (
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                        {item.reviews && (
                            <Text style={styles.reviewsText}>({item.reviews})</Text>
                        )}
                    </View>
                )}
            </View>

            {/* Content */}
            <ScrollView 
                style={styles.content}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* Item Name and Category */}
                <View style={styles.headerSection}>
                    <View style={styles.nameContainer}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{item.category}</Text>
                        </View>
                    </View>
                    
                    {!item.available && (
                        <View style={styles.unavailableBadge}>
                            <Text style={styles.unavailableText}>Currently Unavailable</Text>
                        </View>
                    )}
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </View>

                {/* Portion Selection */}
                {availablePortions.length > 1 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Choose Portion</Text>
                        <View style={styles.portionContainer}>
                            {availablePortions.map((variant, index) => (
                                <TouchableOpacity
                                    key={variant.quantity}
                                    style={[
                                        styles.portionButton,
                                        selectedPortionIndex === index && styles.portionButtonActive
                                    ]}
                                    onPress={() => setSelectedPortionIndex(index)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.portionButtonText,
                                        selectedPortionIndex === index && styles.portionButtonTextActive
                                    ]}>
                                        {variant.quantity}
                                    </Text>
                                    <Text style={[
                                        styles.portionPrice,
                                        selectedPortionIndex === index && styles.portionPriceActive
                                    ]}>
                                        ₹{variant.price.toFixed(0)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* You Might Also Like */}
                {relatedItems.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>You Might Also Like</Text>
                        {loadingRelated ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#e36057ff" />
                            </View>
                        ) : (
                            <ScrollView 
                                horizontal 
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.suggestionsContainer}
                            >
                                {relatedItems.map((suggestedItem) => {
                                    // Get lowest price for display
                                    const displayPrice = suggestedItem.priceVariants && suggestedItem.priceVariants.length > 0
                                        ? Math.min(...suggestedItem.priceVariants.map(v => v.price))
                                        : suggestedItem.price;

                                    return (
                                        <TouchableOpacity
                                            key={suggestedItem.id}
                                            style={styles.suggestionCard}
                                            activeOpacity={0.8}
                                            onPress={() => onSelectItem?.(suggestedItem)}
                                        >
                                            {suggestedItem.image ? (
                                                <Image
                                                    source={{ uri: suggestedItem.image }}
                                                    style={styles.suggestionImage}
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View style={styles.suggestionImagePlaceholder}>
                                                    <Ionicons name="restaurant" size={24} color="#8E8E93" />
                                                </View>
                                            )}
                                            <View style={styles.suggestionInfo}>
                                                <Text style={styles.suggestionName} numberOfLines={1}>
                                                    {suggestedItem.name}
                                                </Text>
                                                <View style={styles.suggestionPriceRow}>
                                                    <Text style={styles.suggestionPrice}>
                                                        ₹{displayPrice?.toFixed(0) || '0'}
                                                    </Text>
                                                    {suggestedItem.priceVariants && suggestedItem.priceVariants.length > 1 && (
                                                        <Text style={styles.suggestionOnwards}>onwards</Text>
                                                    )}
                                                </View>
                                                {suggestedItem.rating && (
                                                    <View style={styles.suggestionRating}>
                                                        <Ionicons name="star" size={10} color="#FFD700" />
                                                        <Text style={styles.suggestionRatingText}>{suggestedItem.rating}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        )}
                    </View>
                )}

                {/* Spacing for bottom button */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.priceSection}>
                    <Text style={styles.priceLabel}>Total Price</Text>
                    <Text style={styles.priceValue}>
                        ₹{(selectedPortion.price * Math.max(quantity, 1)).toFixed(0)}
                    </Text>
                </View>

                {quantity === 0 ? (
                    <TouchableOpacity
                        style={[styles.addButton, !item.available && styles.addButtonDisabled]}
                        onPress={handleAddToCart}
                        activeOpacity={0.8}
                        disabled={!item.available}
                    >
                        <LinearGradient
                            colors={['#e36057ff', '#e36057ff']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.addButtonGradient}
                        >
                            <Ionicons name="bag-add" size={20} color="#FFFFFF" />
                            <Text style={styles.addButtonText}>Add to Cart</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.quantityContainer}>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleQuantityChange(quantity - 1)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="remove" size={20} color="#e36057ff" />
                        </TouchableOpacity>
                        <Text style={styles.quantity}>{quantity}</Text>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleQuantityChange(quantity + 1)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="add" size={20} color="#e36057ff" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    imageContainer: {
        width: screenWidth,
        height: 280,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F5F5F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    backButton: {
        position: 'absolute',
        top: 25,
        left: 20,
        zIndex: 10,
    },
    backButtonInner: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cartButton: {
        position: 'absolute',
        top: 25,
        right: 20,
        zIndex: 10,
    },
    cartButtonInner: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cartBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#e36057ff',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    cartBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
        fontFamily: 'System',
    },
    ratingBadge: {
        position: 'absolute',
        bottom: 16,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 16,
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    ratingText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1C1C1E',
        marginLeft: 4,
        fontFamily: 'System',
    },
    reviewsText: {
        fontSize: 11,
        color: '#8E8E93',
        marginLeft: 4,
        fontFamily: 'System',
    },
    content: {
        flex: 1,
    },
    headerSection: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        flex: 1,
        marginRight: 12,
    },
    categoryBadge: {
        backgroundColor: '#FEF2F2',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e36057ff',
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#e36057ff',
        fontFamily: 'System',
    },
    unavailableBadge: {
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    unavailableText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FF9800',
    },
    section: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        marginBottom: 12,
    },
    description: {
        fontSize: 12,
        color: '#8E8E93',
        lineHeight: 18,
        fontFamily: 'System',
    },
    portionContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    portionButton: {
        flex: 1,
        backgroundColor: '#F5F5F7',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    portionButtonActive: {
        backgroundColor: '#FEF2F2',
        borderColor: '#e36057ff',
    },
    portionButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8E8E93',
        fontFamily: 'System',
        marginBottom: 4,
    },
    portionButtonTextActive: {
        color: '#e36057ff',
    },
    portionPrice: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
    },
    portionPriceActive: {
        color: '#e36057ff',
    },
    suggestionsContainer: {
        paddingRight: 20,
        gap: 12,
    },
    suggestionCard: {
        width: 140,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    suggestionImage: {
        width: '100%',
        height: 100,
    },
    suggestionImagePlaceholder: {
        width: '100%',
        height: 100,
        backgroundColor: '#F5F5F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    suggestionInfo: {
        padding: 10,
    },
    suggestionName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1C1C1E',
        fontFamily: 'System',
        marginBottom: 4,
    },
    suggestionPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    suggestionPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#e36057ff',
        fontFamily: 'System',
    },
    suggestionOnwards: {
        fontSize: 9,
        color: '#8E8E93',
        marginLeft: 3,
        fontStyle: 'italic',
    },
    suggestionRating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    suggestionRatingText: {
        fontSize: 10,
        color: '#8E8E93',
        marginLeft: 2,
        fontWeight: '600',
    },
    loadingContainer: {
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E7',
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 4,
    },
    priceSection: {
        flex: 1,
    },
    priceLabel: {
        fontSize: 11,
        color: '#8E8E93',
        fontFamily: 'System',
        marginBottom: 4,
    },
    price: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
    },
    addButton: {
        flex: 1,
        marginLeft: 16,
    },
    addButtonDisabled: {
        opacity: 0.5,
    },
    addButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    addButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: 'System',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 6,
        gap: 16,
        marginLeft: 16,
    },
    quantityButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
        elevation: 2,
    },
    quantity: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        minWidth: 30,
        textAlign: 'center',
    },
});

export default ItemDetailScreen;
