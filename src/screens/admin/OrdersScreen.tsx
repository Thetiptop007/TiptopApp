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
    Image
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

    // Enhanced Mock data with more realistic orders
    const orders: Order[] = [
        {
            id: '1234',
            customerId: 'cust1',
            items: [
                {
                    id: 'item1',
                    quantity: 2,
                    menuItem: {
                        id: 'menu1',
                        name: 'Chicken Dum Biryani',
                        description: 'Aromatic basmati rice cooked with tender chicken',
                        price: 12.99,
                        category: 'Main Course',
                        available: true
                    }
                },
                {
                    id: 'item2',
                    quantity: 1,
                    menuItem: {
                        id: 'menu2',
                        name: 'Butter Chicken',
                        description: 'Creamy tomato-based chicken curry',
                        price: 14.99,
                        category: 'Main Course',
                        available: true
                    }
                }
            ],
            total: 40.97,
            status: 'pending',
            customerAddress: '123 Main St, Downtown, Mumbai',
            customerPhone: '+91 98765 43210',
            createdAt: new Date(Date.now() - 10 * 60000),
            updatedAt: new Date(),
        },
        {
            id: '1235',
            customerId: 'cust2',
            items: [
                {
                    id: 'item3',
                    quantity: 1,
                    menuItem: {
                        id: 'menu3',
                        name: 'Paneer Butter Masala',
                        description: 'Rich and creamy paneer curry',
                        price: 11.99,
                        category: 'Main Course',
                        available: true
                    }
                }
            ],
            total: 18.99,
            status: 'preparing',
            customerAddress: '456 Oak Ave, Andheri, Mumbai',
            customerPhone: '+91 87654 32109',
            createdAt: new Date(Date.now() - 25 * 60000),
            updatedAt: new Date(),
        },
        {
            id: '1236',
            customerId: 'cust3',
            items: [
                {
                    id: 'item4',
                    quantity: 1,
                    menuItem: {
                        id: 'menu4',
                        name: 'Mutton Korma',
                        description: 'Tender mutton in aromatic spices',
                        price: 16.99,
                        category: 'Main Course',
                        available: true
                    }
                }
            ],
            total: 24.97,
            status: 'ready',
            customerAddress: '789 Pine St, Bandra, Mumbai',
            customerPhone: '+91 76543 21098',
            createdAt: new Date(Date.now() - 45 * 60000),
            updatedAt: new Date(),
        },
        {
            id: '1237',
            customerId: 'cust4',
            items: [
                {
                    id: 'item5',
                    quantity: 1,
                    menuItem: {
                        id: 'menu5',
                        name: 'Dal Tadka',
                        description: 'Traditional lentil curry',
                        price: 8.99,
                        category: 'Vegetarian',
                        available: true
                    }
                }
            ],
            total: 14.99,
            status: 'delivered',
            customerAddress: '321 Elm St, Powai, Mumbai',
            customerPhone: '+91 65432 10987',
            createdAt: new Date(Date.now() - 90 * 60000),
            updatedAt: new Date(),
        },
        {
            id: '1238',
            customerId: 'cust5',
            items: [
                {
                    id: 'item6',
                    quantity: 2,
                    menuItem: {
                        id: 'menu6',
                        name: 'Chicken Tikka Masala',
                        description: 'Grilled chicken in spiced curry sauce',
                        price: 13.99,
                        category: 'Main Course',
                        available: true
                    }
                }
            ],
            total: 27.98,
            status: 'confirmed',
            customerAddress: '654 Maple Ave, Worli, Mumbai',
            customerPhone: '+91 54321 09876',
            createdAt: new Date(Date.now() - 5 * 60000),
            updatedAt: new Date(),
        },
    ];

    // Filter orders based on status and search query
    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customerAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.items.some(item =>
                item.menuItem.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        return matchesStatus && matchesSearch;
    });

    // Get status statistics
    const statusStats = {
        all: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#FF9800';
            case 'confirmed': return '#2196F3';
            case 'preparing': return '#F44336';
            case 'ready': return '#4CAF50';
            case 'picked_up': return '#9C27B0';
            case 'delivered': return '#1C1C1E';
            case 'cancelled': return '#F44336';
            default: return '#8E8E93';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return 'time-outline';
            case 'confirmed': return 'checkmark-circle-outline';
            case 'preparing': return 'restaurant-outline';
            case 'ready': return 'checkmark-done-outline';
            case 'picked_up': return 'car-outline';
            case 'delivered': return 'checkmark-done-circle-outline';
            case 'cancelled': return 'close-circle-outline';
            default: return 'help-circle-outline';
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

    const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
        Alert.alert(
            'Update Order Status',
            `Are you sure you want to update order #${orderId} to ${newStatus}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Update',
                    onPress: () => {
                        console.log(`Updating order ${orderId} to ${newStatus}`);
                        setModalVisible(false);
                    }
                }
            ]
        );
    };

    const renderOrderCard = (order: Order) => (
        <TouchableOpacity
            key={order.id}
            style={styles.orderCard}
            onPress={() => handleOrderPress(order)}
        >
            <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>#{order.id}</Text>
                    <Text style={styles.orderTime}>{getTimeAgo(order.createdAt)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                    <Ionicons name={getStatusIcon(order.status) as any} size={12} color="#FFFFFF" />
                    <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.orderDetails}>
                <View style={styles.orderItems}>
                    <Text style={styles.itemsTitle}>Items:</Text>
                    {order.items.slice(0, 2).map((item, index) => (
                        <Text key={index} style={styles.itemText}>
                            {item.quantity}x {item.menuItem.name}
                        </Text>
                    ))}
                    {order.items.length > 2 && (
                        <Text style={styles.moreItems}>+{order.items.length - 2} more items</Text>
                    )}
                </View>

                <View style={styles.orderMeta}>
                    <Text style={styles.orderAmount}>₹{order.total.toFixed(2)}</Text>
                    <View style={styles.contactInfo}>
                        <View style={styles.addressContainer}>
                            <Ionicons name="location-outline" size={14} color="#8E8E93" />
                            <Text style={styles.orderAddress} numberOfLines={1}>
                                {order.customerAddress}
                            </Text>
                        </View>
                        <View style={styles.phoneContainer}>
                            <Ionicons name="call-outline" size={14} color="#8E8E93" />
                            <Text style={styles.orderPhone}>{order.customerPhone}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Action Buttons Section */}
            <View style={styles.actionSection}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.assignButton]}
                    onPress={() => {
                        Alert.alert('Assign Order', `Assign order #${order.id} to delivery partner?`);
                    }}
                >
                    <Ionicons name="person-add-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Assign Order</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.statusButton]}
                    onPress={() => handleOrderPress(order)}
                >
                    <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Update Status</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.callButton]}
                    onPress={() => {
                        Alert.alert('Call Customer', `Call ${order.customerPhone}?`);
                    }}
                >
                    <Ionicons name="call-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Call</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {/* Simple Header like Customer OrdersScreen */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Order Management</Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#8E8E93" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search orders"
                        placeholderTextColor="#8E8E93"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <Image
                        source={require('../../../assets/logo.png')}
                        style={styles.searchLogo}
                        resizeMode="contain"
                    />
                </View>

                {/* Status Filter Tabs */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterContainer}
                    contentContainerStyle={styles.filterContent}
                >
                    {Object.entries(statusStats).map(([status, count]) => (
                        <TouchableOpacity
                            key={status}
                            style={[
                                styles.filterTab,
                                filterStatus === status && styles.activeFilterTab
                            ]}
                            onPress={() => setFilterStatus(status)}
                        >
                            <Text style={[
                                styles.filterTabText,
                                filterStatus === status && styles.activeFilterTabText
                            ]}>
                                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </Text>
                            <View style={[
                                styles.filterTabBadge,
                                filterStatus === status && styles.activeFilterTabBadge
                            ]}>
                                <Text style={[
                                    styles.filterTabBadgeText,
                                    filterStatus === status && styles.activeFilterTabBadgeText
                                ]}>
                                    {count}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Orders List */}
                <View style={styles.ordersContainer}>
                    <Text style={styles.sectionTitle}>
                        {filteredOrders.length} Order{filteredOrders.length !== 1 ? 's' : ''} Found
                    </Text>

                    {filteredOrders.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="receipt-outline" size={64} color="#8E8E93" />
                            <Text style={styles.emptyStateTitle}>No Orders Found</Text>
                            <Text style={styles.emptyStateText}>
                                {searchQuery ? 'Try adjusting your search criteria' : 'No orders match the selected filter'}
                            </Text>
                        </View>
                    ) : (
                        filteredOrders.map(order => renderOrderCard(order))
                    )}
                </View>
            </ScrollView>

            {/* Order Detail Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedOrder && (
                            <>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Order #{selectedOrder.id}</Text>
                                    <TouchableOpacity
                                        onPress={() => setModalVisible(false)}
                                        style={styles.closeButton}
                                    >
                                        <Ionicons name="close" size={24} color="#8E8E93" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <View style={styles.orderDetailSection}>
                                        <Text style={styles.sectionLabel}>Order Information</Text>
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Status:</Text>
                                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status) }]}>
                                                <Ionicons name={getStatusIcon(selectedOrder.status) as any} size={12} color="#FFFFFF" />
                                                <Text style={styles.statusText}>{selectedOrder.status.toUpperCase()}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Total Amount:</Text>
                                            <Text style={styles.detailValue}>₹{selectedOrder.total.toFixed(2)}</Text>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Order Time:</Text>
                                            <Text style={styles.detailValue}>
                                                {selectedOrder.createdAt.toLocaleString()}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.orderDetailSection}>
                                        <Text style={styles.sectionLabel}>Customer Details</Text>
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Phone:</Text>
                                            <Text style={styles.detailValue}>{selectedOrder.customerPhone}</Text>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Address:</Text>
                                            <Text style={styles.detailValue}>{selectedOrder.customerAddress}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.orderDetailSection}>
                                        <Text style={styles.sectionLabel}>Order Items</Text>
                                        {selectedOrder.items.map((item, index) => (
                                            <View key={index} style={styles.itemDetailRow}>
                                                <Text style={styles.itemDetailName}>
                                                    {item.quantity}x {item.menuItem.name}
                                                </Text>
                                                <Text style={styles.itemDetailPrice}>
                                                    ₹{(item.quantity * item.menuItem.price).toFixed(2)}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>

                                    <View style={styles.orderDetailSection}>
                                        <Text style={styles.sectionLabel}>Update Status</Text>
                                        <View style={styles.statusActions}>
                                            {['confirmed', 'preparing', 'ready', 'delivered'].map((status) => (
                                                <TouchableOpacity
                                                    key={status}
                                                    style={[
                                                        styles.statusActionButton,
                                                        { backgroundColor: getStatusColor(status) },
                                                        selectedOrder.status === status && styles.disabledButton
                                                    ]}
                                                    onPress={() => updateOrderStatus(selectedOrder.id, status as Order['status'])}
                                                    disabled={selectedOrder.status === status}
                                                >
                                                    <Ionicons name={getStatusIcon(status) as any} size={16} color="#FFFFFF" />
                                                    <Text style={styles.statusActionText}>
                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </ScrollView>
                            </>
                        )}
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
    filterContainer: {
        marginBottom: 20,
        paddingVertical: 10,
    },
    filterContent: {
        paddingHorizontal: 20,
    },
    filterTab: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 12,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    activeFilterTab: {
        backgroundColor: '#e36057ff',
        borderColor: '#e36057ff',
        shadowColor: '#e36057ff',
        shadowOpacity: 0.25,
        elevation: 6,
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2C2C2E',
        fontFamily: 'System',
        marginRight: 8,
    },
    activeFilterTabText: {
        color: '#FFFFFF',
        fontWeight: '800',
    },
    filterTabBadge: {
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    activeFilterTabBadge: {
        backgroundColor: '#FFFFFF',
        borderColor: '#FFFFFF',
    },
    filterTabBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2C2C2E',
        fontFamily: 'System',
    },
    activeFilterTabBadgeText: {
        color: '#e36057ff',
        fontWeight: '800',
    },
    ordersContainer: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 16,
    },
    orderCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    orderInfo: {
        flex: 1,
    },
    orderId: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 2,
    },
    orderTime: {
        fontSize: 13,
        color: '#8E8E93',
        fontWeight: '500',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
        marginLeft: 4,
        letterSpacing: 0.3,
    },
    orderDetails: {
        flexDirection: 'column',
        marginBottom: 12,
    },
    orderItems: {
        marginBottom: 12,
    },
    itemsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 4,
    },
    itemText: {
        fontSize: 13,
        color: '#636366',
        marginBottom: 2,
        lineHeight: 18,
    },
    moreItems: {
        fontSize: 13,
        color: '#e36057ff',
        fontWeight: '600',
        marginTop: 2,
    },
    orderMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingVertical: 8,
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    orderAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#e36057ff',
    },
    contactInfo: {
        flex: 1,
        marginLeft: 16,
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    orderAddress: {
        fontSize: 12,
        color: '#636366',
        marginLeft: 4,
        flex: 1,
    },
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    orderPhone: {
        fontSize: 12,
        color: '#636366',
        marginLeft: 4,
    },
    orderSummary: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    actionSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 2,
        justifyContent: 'center',
    },
    assignButton: {
        backgroundColor: '#4CAF50',
    },
    statusButton: {
        backgroundColor: '#e36057ff',
    },
    callButton: {
        backgroundColor: '#2196F3',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
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
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
    },
    closeButton: {
        padding: 4,
    },
    orderDetailSection: {
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 12,
        fontFamily: 'System',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    detailLabel: {
        fontSize: 14,
        color: '#8E8E93',
        fontFamily: 'System',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        color: '#1C1C1E',
        fontFamily: 'System',
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
    },
    itemDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    itemDetailName: {
        fontSize: 14,
        color: '#1C1C1E',
        fontFamily: 'System',
        fontWeight: '500',
        flex: 1,
    },
    itemDetailPrice: {
        fontSize: 14,
        color: '#FF6659',
        fontFamily: 'System',
        fontWeight: '700',
    },
    statusActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 8,
    },
    disabledButton: {
        opacity: 0.5,
    },
    statusActionText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 4,
        fontFamily: 'System',
    },
});

export default AdminOrdersScreen;
