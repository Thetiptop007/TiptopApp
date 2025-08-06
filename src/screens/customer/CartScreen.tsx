import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem, MenuItem } from '../../types';

const CustomerCartScreen: React.FC = () => {
    // Mock cart data
    const [cartItems, setCartItems] = useState<CartItem[]>([
        {
            id: '1',
            menuItem: {
                id: '1',
                name: 'Chicken Biryani',
                description: 'Aromatic basmati rice with tender chicken',
                price: 12.99,
                category: 'Main Course',
                available: true,
            },
            quantity: 2,
        },
        {
            id: '2',
            menuItem: {
                id: '2',
                name: 'Margherita Pizza',
                description: 'Classic pizza with fresh tomatoes and mozzarella',
                price: 10.99,
                category: 'Pizza',
                available: true,
            },
            quantity: 1,
        },
    ]);

    const [couponCode, setCouponCode] = useState('');

    const updateQuantity = (itemId: string, newQuantity: number) => {
        if (newQuantity === 0) {
            removeItem(itemId);
            return;
        }

        setCartItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
        ));
    };

    const removeItem = (itemId: string) => {
        setCartItems(prev => prev.filter(item => item.id !== itemId));
    };

    const applyCoupon = () => {
        if (couponCode.toLowerCase() === 'save20') {
            Alert.alert('Success', '20% discount applied!');
        } else {
            Alert.alert('Error', 'Invalid coupon code');
        }
    };

    const proceedToPayment = () => {
        if (cartItems.length === 0) {
            Alert.alert('Error', 'Your cart is empty');
            return;
        }
        Alert.alert('Success', 'Proceeding to payment...');
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    const deliveryFee = subtotal > 25 ? 0 : 2.99;
    const discount = couponCode.toLowerCase() === 'save20' ? subtotal * 0.2 : 0;
    const total = subtotal + deliveryFee - discount;

    const renderCartItem = ({ item }: { item: CartItem }) => (
        <View style={styles.cartItem}>
            <View style={styles.itemImagePlaceholder}>
                <Ionicons name="restaurant" size={30} color="#ccc" />
            </View>

            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.menuItem.name}</Text>
                <Text style={styles.itemPrice}>${item.menuItem.price.toFixed(2)}</Text>
            </View>

            <View style={styles.quantityControls}>
                <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                >
                    <Ionicons name="remove" size={16} color="#fff" />
                </TouchableOpacity>

                <Text style={styles.quantity}>{item.quantity}</Text>

                <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                >
                    <Ionicons name="add" size={16} color="#fff" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeItem(item.id)}
            >
                <Ionicons name="trash-outline" size={20} color="#F44336" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Cart</Text>

            {cartItems.length === 0 ? (
                <View style={styles.emptyCart}>
                    <Ionicons name="cart-outline" size={80} color="#ccc" />
                    <Text style={styles.emptyCartText}>Your cart is empty</Text>
                    <Text style={styles.emptyCartSubtext}>Add some delicious items!</Text>
                </View>
            ) : (
                <>
                    <FlatList
                        data={cartItems}
                        renderItem={renderCartItem}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        style={styles.cartList}
                    />

                    {/* Coupon Section */}
                    <View style={styles.couponSection}>
                        <View style={styles.couponInput}>
                            <Ionicons name="pricetag-outline" size={20} color="#666" />
                            <Text style={styles.couponText}>SAVE20</Text>
                        </View>
                        <TouchableOpacity style={styles.couponButton} onPress={applyCoupon}>
                            <Text style={styles.couponButtonText}>Apply</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Order Summary */}
                    <View style={styles.summary}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Delivery Fee</Text>
                            <Text style={styles.summaryValue}>
                                {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                            </Text>
                        </View>

                        {discount > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Discount</Text>
                                <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                                    -${discount.toFixed(2)}
                                </Text>
                            </View>
                        )}

                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.checkoutButton} onPress={proceedToPayment}>
                        <Text style={styles.checkoutButtonText}>Proceed to Payment</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        padding: 20,
        color: '#333',
    },
    emptyCart: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyCartText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 20,
    },
    emptyCartSubtext: {
        fontSize: 16,
        color: '#999',
        marginTop: 10,
    },
    cartList: {
        flex: 1,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        margin: 10,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemImagePlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    itemPrice: {
        fontSize: 14,
        color: '#FF6B35',
        fontWeight: 'bold',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    quantityButton: {
        backgroundColor: '#FF6B35',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantity: {
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: 15,
        color: '#333',
    },
    removeButton: {
        padding: 5,
    },
    couponSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 10,
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    couponInput: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 5,
    },
    couponText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#666',
    },
    couponButton: {
        backgroundColor: '#FF6B35',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
        marginLeft: 10,
    },
    couponButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    summary: {
        backgroundColor: '#fff',
        margin: 10,
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 16,
        color: '#666',
    },
    summaryValue: {
        fontSize: 16,
        color: '#333',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
        marginTop: 10,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF6B35',
    },
    checkoutButton: {
        backgroundColor: '#FF6B35',
        margin: 10,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CustomerCartScreen;
