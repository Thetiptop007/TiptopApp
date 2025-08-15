import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    Dimensions,
    NativeSyntheticEvent,
    NativeScrollEvent,
    TextInput,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTabBar } from '../../contexts/TabBarContext';
import { Order } from '../../types';

const { width } = Dimensions.get('window');

const AdminOrdersScreen: React.FC = () => {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const { setTabBarVisible } = useTabBar();
    const lastScrollY = useRef(0);
    const scrollThreshold = 10;

    // Mock data following README flow - Small Restaurant Orders
    const orders: Order[] = [
        {
            id: 'ORD_COD_1234567',
            customerId: 'cust1',
            customerName: 'Rahul Kumar',
            items: [
                {
                    id: 'item1',
                    quantity: 2,
                    menuItem: {
                        id: 'menu1',
                        name: 'Palak Chaap (Half)',
                        description: 'Traditional cottage cheese in spinach gravy',
                        price: 299,
                        category: 'North Indian',
                        available: true,
                        portion: 'Half'
                    }
                },
                {
                    id: 'item2',
                    quantity: 1,
                    menuItem: {
                        id: 'menu2',
                        name: 'Chaap Masala (Full)',
                        description: 'Spicy and flavorful chaap curry',
                        price: 399,
                        category: 'North Indian',
                        available: true,
                        portion: 'Full'
                    }
                },
                {
                    id: 'item3',
                    quantity: 2,
                    menuItem: {
                        id: 'menu3',
                        name: 'Garlic Naan',
                        description: 'Fresh baked garlic flavored naan bread',
                        price: 89,
                        category: 'Breads',
                        available: true
                    }
                }
            ],
            total: 1409,
            status: 'PENDING',
            paymentStatus: 'PENDING',
            paymentMethod: 'COD',
            customerAddress: '123 Main St, Bandra West, Mumbai - 400050',
            customerPhone: '+91 98765 43210',
            codAmount: 1409,
            codHandlingFee: 20,
            deliveryFee: 49,
            platformFee: 25,
            cashToCollect: 1409,
            createdAt: new Date(Date.now() - 2 * 60000), // 2 minutes ago
            updatedAt: new Date(),
        },
        {
            id: 'ORD_1234568',
            customerId: 'cust2',
            customerName: 'Priya Sharma',
            items: [
                {
                    id: 'item4',
                    quantity: 1,
                    menuItem: {
                        id: 'menu4',
                        name: 'Chicken Dum Biryani',
                        description: 'Aromatic basmati rice with tender chicken',
                        price: 450,
                        category: 'Rice & Biryani',
                        available: true,
                        portion: 'Full'
                    }
                },
                {
                    id: 'item5',
                    quantity: 1,
                    menuItem: {
                        id: 'menu5',
                        name: 'Raita',
                        description: 'Fresh yogurt with cucumber and spices',
                        price: 89,
                        category: 'Accompaniments',
                        available: true
                    }
                }
            ],
            total: 583,
            status: 'PREPARING',
            paymentStatus: 'PAID',
            paymentMethod: 'ONLINE',
            customerAddress: '456 Oak Avenue, Andheri West, Mumbai - 400058',
            customerPhone: '+91 87654 32109',
            discount: 29, // 5% online discount
            deliveryFee: 49,
            platformFee: 25,
            createdAt: new Date(Date.now() - 15 * 60000), // 15 minutes ago
            updatedAt: new Date(Date.now() - 5 * 60000),
        },
        {
            id: 'ORD_1234569',
            customerId: 'cust3',
            customerName: 'Vikash Singh',
            items: [
                {
                    id: 'item6',
                    quantity: 2,
                    menuItem: {
                        id: 'menu6',
                        name: 'Butter Paneer',
                        description: 'Cottage cheese in rich tomato gravy',
                        price: 320,
                        category: 'North Indian',
                        available: true,
                        portion: 'Full'
                    }
                },
                {
                    id: 'item7',
                    quantity: 3,
                    menuItem: {
                        id: 'menu7',
                        name: 'Roti',
                        description: 'Fresh wheat flatbread',
                        price: 25,
                        category: 'Breads',
                        available: true
                    }
                }
            ],
            total: 715,
            status: 'OUT_FOR_DELIVERY',
            paymentStatus: 'PAID',
            paymentMethod: 'ONLINE',
            customerAddress: '789 Park Street, Bandra East, Mumbai - 400051',
            customerPhone: '+91 76543 21098',
            deliveryPersonId: 'delivery1',
            discount: 36, // 5% online discount
            deliveryFee: 49,
            platformFee: 25,
            createdAt: new Date(Date.now() - 45 * 60000), // 45 minutes ago
            updatedAt: new Date(Date.now() - 10 * 60000),
        },
        {
            id: 'ORD_COD_1234570',
            customerId: 'cust4',
            customerName: 'Anjali Verma',
            items: [
                {
                    id: 'item8',
                    quantity: 1,
                    menuItem: {
                        id: 'menu8',
                        name: 'Dal Makhani',
                        description: 'Creamy black lentils slow cooked overnight',
                        price: 280,
                        category: 'North Indian',
                        available: true,
                        portion: 'Full'
                    }
                },
                {
                    id: 'item9',
                    quantity: 2,
                    menuItem: {
                        id: 'menu9',
                        name: 'Jeera Rice',
                        description: 'Basmati rice flavored with cumin',
                        price: 120,
                        category: 'Rice & Biryani',
                        available: true
                    }
                }
            ],
            total: 569,
            status: 'DELIVERED',
            paymentStatus: 'COLLECTED',
            paymentMethod: 'COD',
            customerAddress: '321 Hill Road, Bandra West, Mumbai - 400050',
            customerPhone: '+91 65432 10987',
            deliveryPersonId: 'delivery1',
            codAmount: 569,
            codHandlingFee: 20,
            deliveryFee: 49,
            platformFee: 25,
            cashToCollect: 569,
            cashCollected: 569,
            cashCollectionTime: new Date(Date.now() - 5 * 60000),
            createdAt: new Date(Date.now() - 60 * 60000), // 1 hour ago
            updatedAt: new Date(Date.now() - 5 * 60000),
        }
    ];

    // Filter orders based on status and search query
    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customerAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.items.some(item =>
                item.menuItem.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        return matchesStatus && matchesSearch;
    });

    // Get status statistics - Updated for README flow
    const statusStats = {
        all: orders.length,
        PENDING: orders.filter(o => o.status === 'PENDING').length,
        PREPARING: orders.filter(o => o.status === 'PREPARING').length,
        OUT_FOR_DELIVERY: orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length,
        DELIVERED: orders.filter(o => o.status === 'DELIVERED').length,
        CANCELLED: orders.filter(o => o.status === 'CANCELLED').length,
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return '#FF9800'; // Orange for new orders
            case 'PREPARING': return '#2196F3'; // Blue for preparation
            case 'OUT_FOR_DELIVERY': return '#9C27B0'; // Purple for delivery
            case 'DELIVERED': return '#4CAF50'; // Green for completed
            case 'CANCELLED': return '#F44336'; // Red for cancelled
            default: return '#8E8E93';
        }
    };

    const getStatusDisplay = (status: string) => {
        switch (status) {
            case 'PENDING': return 'New Order';
            case 'PREPARING': return 'Preparing';
            case 'OUT_FOR_DELIVERY': return 'Out for Delivery';
            case 'DELIVERED': return 'Delivered';
            case 'CANCELLED': return 'Cancelled';
            default: return status;
        }
    };

    const getPaymentStatusColor = (paymentStatus: string, paymentMethod: string) => {
        if (paymentMethod === 'COD') {
            switch (paymentStatus) {
                case 'PENDING': return '#FF9800'; // Orange for COD pending
                case 'COLLECTED': return '#4CAF50'; // Green for cash collected
                default: return '#8E8E93';
            }
        } else {
            return paymentStatus === 'PAID' ? '#4CAF50' : '#FF9800';
        }
    };

    // Order Action Functions - Following README Flow
    const handleAcceptAndPrepare = (orderId: string) => {
        Alert.alert(
            'Accept & Prepare Order',
            'This will mark the order as accepted and start preparation. Kitchen will receive the order details.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Accept & Prepare',
                    style: 'default',
                    onPress: () => {
                        console.log(`Order ${orderId} accepted and preparation started`);
                        // Here you would update the order status to PREPARING
                        // updateOrderStatus(orderId, 'PREPARING');
                        Alert.alert('Success', 'Order accepted! Kitchen has been notified.');
                    }
                }
            ]
        );
    };

    const handleSendForDelivery = (orderId: string) => {
        Alert.alert(
            'Send for Delivery',
            'Mark this order as ready and assign to delivery boy?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Send for Delivery',
                    style: 'default',
                    onPress: () => {
                        console.log(`Order ${orderId} sent for delivery`);
                        // Here you would update the order status to OUT_FOR_DELIVERY
                        // updateOrderStatus(orderId, 'OUT_FOR_DELIVERY');
                        // assignToDeliveryBoy(orderId);
                        Alert.alert('Success', 'Order assigned to delivery boy Ravi!');
                    }
                }
            ]
        );
    };

    const handleCancelOrder = (orderId: string, paymentMethod: string) => {
        Alert.alert(
            'Cancel Order',
            `Are you sure you want to cancel this order?${paymentMethod === 'ONLINE' ? ' Refund will be processed automatically.' : ''}`,
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: () => {
                        console.log(`Order ${orderId} cancelled`);
                        // Here you would update the order status to CANCELLED
                        // updateOrderStatus(orderId, 'CANCELLED');
                        // if (paymentMethod === 'ONLINE') processRefund(orderId);
                        Alert.alert('Order Cancelled', paymentMethod === 'ONLINE' ? 'Refund will be processed within 3-5 business days.' : 'Order has been cancelled.');
                    }
                }
            ]
        );
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return 'time-outline';
            case 'PREPARING': return 'restaurant-outline';
            case 'OUT_FOR_DELIVERY': return 'bicycle-outline';
            case 'DELIVERED': return 'checkmark-done-circle-outline';
            case 'CANCELLED': return 'close-circle-outline';
            default: return 'help-circle-outline';
        }
    };

    const getActionButton = (order: Order) => {
        switch (order.status) {
            case 'PENDING':
                return (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                        onPress={() => handleAcceptAndPrepare(order.id)}
                    >
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Accept & Prepare</Text>
                    </TouchableOpacity>
                );
            case 'PREPARING':
                return (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                        onPress={() => handleSendForDelivery(order.id)}
                    >
                        <Ionicons name="bicycle" size={16} color="#FFFFFF" />
                        <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Send for Delivery</Text>
                    </TouchableOpacity>
                );
            case 'OUT_FOR_DELIVERY':
                return (
                    <View style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}>
                        <Ionicons name="bicycle" size={16} color="#FFFFFF" />
                        <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>With Ravi</Text>
                    </View>
                );
            case 'DELIVERED':
                return (
                    <View style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}>
                        <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
                        <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Completed</Text>
                    </View>
                );
            default:
                return null;
        }
    };

    const getTimeAgo = (date: Date) => {
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const scrollDifference = currentScrollY - lastScrollY.current;

        if (currentScrollY <= 50) {
            setTabBarVisible(true);
            lastScrollY.current = currentScrollY;
            return;
        }

        if (Math.abs(scrollDifference) > scrollThreshold) {
            if (scrollDifference > 0) {
                setTabBarVisible(false);
            } else {
                setTabBarVisible(true);
            }
            lastScrollY.current = currentScrollY;
        }
    };

    const handleOrderPress = (order: Order) => {
        setSelectedOrder(order);
        setModalVisible(true);
    };

    const renderOrderCard = (order: Order) => (
        <TouchableOpacity
            key={order.id}
            style={[
                styles.orderCard,
                order.status === 'PENDING' && styles.pendingOrderCard,
                order.paymentMethod === 'COD' && order.status === 'PENDING' && styles.codOrderCard
            ]}
            onPress={() => handleOrderPress(order)}
        >
            {/* Order Header */}
            <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>#{order.id}</Text>
                    <Text style={styles.orderTime}>{getTimeAgo(order.createdAt)}</Text>
                </View>
                <View style={styles.statusContainer}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                        <Ionicons name={getStatusIcon(order.status) as any} size={12} color="#FFFFFF" />
                        <Text style={styles.statusText}>{getStatusDisplay(order.status)}</Text>
                    </View>
                </View>
            </View>

            {/* Payment Method & Status */}
            <View style={styles.paymentRow}>
                <View style={[
                    styles.paymentBadge,
                    { backgroundColor: order.paymentMethod === 'COD' ? '#FF9800' : '#4CAF50' }
                ]}>
                    <Ionicons
                        name={order.paymentMethod === 'COD' ? 'cash-outline' : 'card-outline'}
                        size={14}
                        color="#FFFFFF"
                    />
                    <Text style={styles.paymentText}>
                        {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid Online'}
                    </Text>
                </View>

                {order.paymentMethod === 'COD' && order.status === 'PENDING' && (
                    <View style={styles.codAlert}>
                        <Text style={styles.codAlertText}>💰 Collect: ₹{order.cashToCollect}</Text>
                    </View>
                )}
            </View>

            {/* Customer Info */}
            <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{order.customerName}</Text>
                <View style={styles.contactRow}>
                    <View style={styles.addressContainer}>
                        <Ionicons name="location-outline" size={14} color="#8E8E93" />
                        <Text style={styles.orderAddress} numberOfLines={1}>
                            {order.customerAddress}
                        </Text>
                    </View>
                    <View style={styles.phoneContainer}>
                        <Ionicons name="call-outline" size={14} color="#8E8E93" />
                        <Text style={styles.phoneText}>{order.customerPhone}</Text>
                    </View>
                </View>
            </View>

            {/* Order Items */}
            <View style={styles.orderDetails}>
                <Text style={styles.itemsTitle}>Items ({order.items.length}):</Text>
                {order.items.slice(0, 3).map((item, index) => (
                    <Text key={index} style={styles.itemText}>
                        {item.quantity}x {item.menuItem.name} - ₹{(item.quantity * item.menuItem.price).toFixed(0)}
                    </Text>
                ))}
                {order.items.length > 3 && (
                    <Text style={styles.moreItems}>+{order.items.length - 3} more items</Text>
                )}
            </View>

            {/* Order Total & Action */}
            <View style={styles.orderFooter}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalAmount}>₹{order.total.toFixed(0)}</Text>
                </View>
                {getActionButton(order)}
            </View>

            {/* Cancel Button for Pending Orders */}
            {order.status === 'PENDING' && (
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleCancelOrder(order.id, order.paymentMethod)}
                >
                    <Ionicons name="close" size={14} color="#F44336" />
                    <Text style={styles.cancelButtonText}>Cancel Order</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );

    const renderFilterButton = (status: string, label: string, count: number) => (
        <TouchableOpacity
            key={status}
            style={[
                styles.filterButton,
                filterStatus === status && styles.activeFilterButton
            ]}
            onPress={() => setFilterStatus(status)}
        >
            <Text style={[
                styles.filterButtonText,
                filterStatus === status && styles.activeFilterButtonText
            ]}>
                {label} ({count})
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Orders Management</Text>
                <Text style={styles.headerSubtitle}>Rajesh Da Dhaba</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#8E8E93" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search orders, customers, items..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#8E8E93"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color="#8E8E93" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Status Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filtersContainer}
                contentContainerStyle={styles.filtersContent}
            >
                {renderFilterButton('all', 'All', statusStats.all)}
                {renderFilterButton('PENDING', 'New Orders', statusStats.PENDING)}
                {renderFilterButton('PREPARING', 'Preparing', statusStats.PREPARING)}
                {renderFilterButton('OUT_FOR_DELIVERY', 'Out for Delivery', statusStats.OUT_FOR_DELIVERY)}
                {renderFilterButton('DELIVERED', 'Delivered', statusStats.DELIVERED)}
            </ScrollView>

            {/* Orders List */}
            <ScrollView
                style={styles.ordersList}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => renderOrderCard(order))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="receipt-outline" size={64} color="#8E8E93" />
                        <Text style={styles.emptyStateText}>No orders found</Text>
                        <Text style={styles.emptyStateSubtext}>
                            {searchQuery ? 'Try adjusting your search' : 'Orders will appear here when customers place them'}
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Order Details Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Order Details</Text>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={styles.modalCloseButton}
                        >
                            <Ionicons name="close" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {selectedOrder && (
                        <ScrollView style={styles.modalContent}>
                            {/* Order Info */}
                            <View style={styles.modalSection}>
                                <Text style={styles.modalSectionTitle}>Order Information</Text>
                                <Text style={styles.modalText}>Order ID: {selectedOrder.id}</Text>
                                <Text style={styles.modalText}>Customer: {selectedOrder.customerName}</Text>
                                <Text style={styles.modalText}>Phone: {selectedOrder.customerPhone}</Text>
                                <Text style={styles.modalText}>Address: {selectedOrder.customerAddress}</Text>
                                <Text style={styles.modalText}>
                                    Payment: {selectedOrder.paymentMethod}
                                    ({selectedOrder.paymentStatus})
                                </Text>
                            </View>

                            {/* Items */}
                            <View style={styles.modalSection}>
                                <Text style={styles.modalSectionTitle}>Items Ordered</Text>
                                {selectedOrder.items.map((item, index) => (
                                    <View key={index} style={styles.modalItemRow}>
                                        <Text style={styles.modalItemName}>
                                            {item.quantity}x {item.menuItem.name}
                                        </Text>
                                        <Text style={styles.modalItemPrice}>
                                            ₹{(item.quantity * item.menuItem.price).toFixed(0)}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {/* Total */}
                            <View style={styles.modalSection}>
                                <Text style={styles.modalSectionTitle}>Order Summary</Text>
                                <View style={styles.modalTotalRow}>
                                    <Text style={styles.modalTotalLabel}>Total Amount:</Text>
                                    <Text style={styles.modalTotalAmount}>₹{selectedOrder.total.toFixed(0)}</Text>
                                </View>
                                {selectedOrder.paymentMethod === 'COD' && (
                                    <View style={styles.codSummary}>
                                        <Text style={styles.codSummaryText}>
                                            💰 Cash to Collect: ₹{selectedOrder.cashToCollect}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Actions */}
                            <View style={styles.modalActions}>
                                {getActionButton(selectedOrder)}
                                {selectedOrder.status === 'PENDING' && (
                                    <TouchableOpacity
                                        style={[styles.modalActionButton, { backgroundColor: '#F44336' }]}
                                        onPress={() => {
                                            setModalVisible(false);
                                            handleCancelOrder(selectedOrder.id, selectedOrder.paymentMethod);
                                        }}
                                    >
                                        <Text style={styles.modalActionButtonText}>Cancel Order</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </ScrollView>
                    )}
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
    header: {
        backgroundColor: '#2C2C2E',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginTop: 20,
        paddingHorizontal: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        paddingLeft: 12,
        fontSize: 16,
        color: '#2C2C2E',
    },
    filtersContainer: {
        marginTop: 20,
    },
    filtersContent: {
        paddingHorizontal: 20,
        paddingRight: 40,
    },
    filterButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    activeFilterButton: {
        backgroundColor: '#2C2C2E',
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8E8E93',
    },
    activeFilterButtonText: {
        color: '#FFFFFF',
    },
    ordersList: {
        flex: 1,
        paddingTop: 20,
    },
    orderCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    pendingOrderCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#FF9800',
    },
    codOrderCard: {
        backgroundColor: '#FFF8F0',
        borderColor: '#FFE0B2',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    orderInfo: {
        flex: 1,
    },
    orderId: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2C2C2E',
        marginBottom: 4,
    },
    orderTime: {
        fontSize: 14,
        color: '#8E8E93',
    },
    statusContainer: {
        alignItems: 'flex-end',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: 4,
    },
    paymentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    paymentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    paymentText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: 4,
    },
    codAlert: {
        backgroundColor: '#FF9800',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    codAlertText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    customerInfo: {
        marginBottom: 12,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C2C2E',
        marginBottom: 6,
    },
    contactRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    orderAddress: {
        fontSize: 12,
        color: '#8E8E93',
        marginLeft: 4,
        flex: 1,
    },
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    phoneText: {
        fontSize: 12,
        color: '#8E8E93',
        marginLeft: 4,
    },
    orderDetails: {
        marginBottom: 16,
    },
    itemsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2C2C2E',
        marginBottom: 8,
    },
    itemText: {
        fontSize: 12,
        color: '#666666',
        marginBottom: 2,
    },
    moreItems: {
        fontSize: 12,
        color: '#8E8E93',
        fontStyle: 'italic',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    totalContainer: {
        alignItems: 'flex-start',
    },
    totalLabel: {
        fontSize: 12,
        color: '#8E8E93',
        marginBottom: 2,
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2C2C2E',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 6,
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        marginTop: 8,
    },
    cancelButtonText: {
        fontSize: 12,
        color: '#F44336',
        marginLeft: 4,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2C2C2E',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2C2C2E',
    },
    modalCloseButton: {
        padding: 8,
    },
    modalContent: {
        flex: 1,
    },
    modalSection: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2C2C2E',
        marginBottom: 12,
    },
    modalText: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 8,
        lineHeight: 20,
    },
    modalItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F8F9FA',
    },
    modalItemName: {
        fontSize: 14,
        color: '#2C2C2E',
        flex: 1,
    },
    modalItemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2C2C2E',
    },
    modalTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    modalTotalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C2C2E',
    },
    modalTotalAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2C2C2E',
    },
    codSummary: {
        backgroundColor: '#FFF8F0',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    codSummaryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF9800',
    },
    modalActions: {
        padding: 20,
        gap: 12,
    },
    modalActionButton: {
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 12,
    },
    modalActionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default AdminOrdersScreen;
