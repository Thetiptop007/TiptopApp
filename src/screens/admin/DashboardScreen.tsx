import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTabBar } from '../../contexts/TabBarContext';
import { menuData } from '../../data/menuData';

const { width } = Dimensions.get('window');

const AdminDashboardScreen: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'total'>('today');
    const { setTabBarVisible } = useTabBar();
    const lastScrollY = useRef(0);
    const scrollThreshold = 10; // Minimum scroll distance to trigger hide/show

    // Mock analytics data - in real app, this would come from API
    const todayStats = {
        orders: 23,
        revenue: 2340,
        users: 18,
        deliveries: 5
    };

    const totalStats = {
        orders: 1247,
        revenue: 89250,
        users: 356,
        deliveries: 1189
    };

    const currentStats = selectedPeriod === 'today' ? todayStats : totalStats;

    const stats = [
        {
            title: selectedPeriod === 'today' ? 'Today Orders' : 'Total Orders',
            value: currentStats.orders.toString(),
            icon: 'receipt-outline',
            color: '#1C1C1E',
            change: selectedPeriod === 'today' ? '+15%' : '+8.5%'
        },
        {
            title: selectedPeriod === 'today' ? 'Today Revenue' : 'Total Revenue',
            value: `₹${currentStats.revenue.toLocaleString()}`,
            icon: 'cash-outline',
            color: '#FF6B35',
            change: selectedPeriod === 'today' ? '+22%' : '+12.3%'
        },
        {
            title: selectedPeriod === 'today' ? 'Active Users' : 'Total Users',
            value: currentStats.users.toString(),
            icon: 'people-outline',
            color: '#2C2C2E',
            change: selectedPeriod === 'today' ? '+5%' : '+18.7%'
        },
        {
            title: selectedPeriod === 'today' ? 'Active Deliveries' : 'Total Deliveries',
            value: currentStats.deliveries.toString(),
            icon: 'bicycle-outline',
            color: '#636366',
            change: selectedPeriod === 'today' ? '+8%' : '+15.2%'
        },
    ];

    // Popular items based on mock order data
    const popularItems = [
        { name: 'Chicken Dum Biryani', orders: 45, percentage: 35 },
        { name: 'Butter Chicken', orders: 38, percentage: 30 },
        { name: 'Paneer Butter Masala', orders: 32, percentage: 25 },
        { name: 'Mutton Korma', orders: 25, percentage: 20 },
        { name: 'Palak Paneer', orders: 18, percentage: 15 },
    ];

    // Weekly revenue data for chart
    const weeklyData = [
        { day: 'Mon', revenue: 4200 },
        { day: 'Tue', revenue: 3800 },
        { day: 'Wed', revenue: 5100 },
        { day: 'Thu', revenue: 4600 },
        { day: 'Fri', revenue: 6200 },
        { day: 'Sat', revenue: 7800 },
        { day: 'Sun', revenue: 6500 },
    ];

    const maxRevenue = Math.max(...weeklyData.map(d => d.revenue));

    const recentActivities = [
        { id: 1, message: 'New order #1234 received', time: '2 min ago', type: 'order' },
        { id: 2, message: 'Order #1233 delivered', time: '5 min ago', type: 'delivery' },
        { id: 3, message: 'New customer registered', time: '10 min ago', type: 'user' },
        { id: 4, message: 'Menu item updated: Chicken Biryani', time: '15 min ago', type: 'menu' },
        { id: 5, message: 'Payment received: ₹450', time: '18 min ago', type: 'payment' },
    ];

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'order': return 'receipt-outline';
            case 'delivery': return 'bicycle-outline';
            case 'user': return 'person-add-outline';
            case 'menu': return 'restaurant-outline';
            case 'payment': return 'card-outline';
            default: return 'information-circle-outline';
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'order': return '#1C1C1E';
            case 'delivery': return '#2C2C2E';
            case 'user': return '#636366';
            case 'menu': return '#8E8E93';
            case 'payment': return '#FF6B35';
            default: return '#8E8E93';
        }
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const scrollDifference = currentScrollY - lastScrollY.current;

        // Always show tab bar when at the top of the screen
        if (currentScrollY <= 50) {
            setTabBarVisible(true);
            lastScrollY.current = currentScrollY;
            return;
        }

        // Only trigger when scroll difference is significant enough
        if (Math.abs(scrollDifference) > scrollThreshold) {
            if (scrollDifference > 0) {
                // Scrolling down - hide tab bar
                setTabBarVisible(false);
            } else {
                // Scrolling up - show tab bar
                setTabBarVisible(true);
            }
            lastScrollY.current = currentScrollY;
        }
    };

    const renderBarChart = () => (
        <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Weekly Revenue Trend</Text>
            <View style={styles.barChartContainer}>
                {weeklyData.map((data, index) => {
                    const barHeight = (data.revenue / maxRevenue) * 120;
                    return (
                        <View key={data.day} style={styles.barContainer}>
                            <View style={styles.barWrapper}>
                                <View
                                    style={[
                                        styles.bar,
                                        { height: barHeight }
                                    ]}
                                />
                            </View>
                            <Text style={styles.barLabel}>{data.day}</Text>
                            <Text style={styles.barValue}>₹{(data.revenue / 1000).toFixed(1)}k</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );

    const renderDonutChart = () => {
        const total = popularItems.reduce((sum, item) => sum + item.orders, 0);
        const colors = ['#1C1C1E', '#FF6B35', '#2C2C2E', '#636366', '#8E8E93'];

        return (
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Popular Items Distribution</Text>
                <View style={styles.donutContainer}>
                    <View style={styles.donutChartWrapper}>
                        <View style={styles.donutCenter}>
                            <Text style={styles.donutCenterValue}>{total}</Text>
                            <Text style={styles.donutCenterLabel}>Total Orders</Text>
                        </View>
                        <View style={styles.donutRings}>
                            {popularItems.slice(0, 4).map((item, index) => {
                                const percentage = (item.orders / total) * 100;
                                return (
                                    <View key={index} style={styles.donutSegment}>
                                        <View
                                            style={[
                                                styles.donutBar,
                                                {
                                                    backgroundColor: colors[index],
                                                    width: `${percentage}%`
                                                }
                                            ]}
                                        />
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    <View style={styles.legendContainer}>
                        {popularItems.slice(0, 4).map((item, index) => (
                            <View key={index} style={styles.legendItem}>
                                <View style={[styles.legendColor, { backgroundColor: colors[index] }]} />
                                <Text style={styles.legendText} numberOfLines={1}>
                                    {item.name}
                                </Text>
                                <Text style={styles.legendValue}>
                                    {item.orders}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {/* Header with Background Image */}
                <View style={styles.headerContainer}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
                        style={styles.headerBackgroundImage}
                        resizeMode="cover"
                    />
                    <View style={styles.headerOverlay}>
                        <View style={styles.header}>
                            <View style={styles.locationContainer}>
                                <Ionicons name="analytics-outline" size={24} color="#FF6B35" />
                                <Text style={styles.locationText}>Analytics Dashboard</Text>
                            </View>
                            <TouchableOpacity style={styles.filterButton}>
                                <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>Restaurant Analytics</Text>
                            <Text style={styles.subtitle}>Track your performance & insights</Text>
                        </View>
                    </View>
                </View>

                {/* Period Toggle */}
                <View style={styles.periodToggle}>
                    <TouchableOpacity
                        style={[
                            styles.periodButton,
                            selectedPeriod === 'today' && styles.activePeriodButton
                        ]}
                        onPress={() => setSelectedPeriod('today')}
                    >
                        <Text style={[
                            styles.periodButtonText,
                            selectedPeriod === 'today' && styles.activePeriodButtonText
                        ]}>
                            Today
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.periodButton,
                            selectedPeriod === 'total' && styles.activePeriodButton
                        ]}
                        onPress={() => setSelectedPeriod('total')}
                    >
                        <Text style={[
                            styles.periodButtonText,
                            selectedPeriod === 'total' && styles.activePeriodButtonText
                        ]}>
                            Total
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    {stats.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <View style={styles.statHeader}>
                                <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}15` }]}>
                                    <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                                </View>
                                <View style={styles.changeContainer}>
                                    <Text style={styles.changeText}>{stat.change}</Text>
                                    <Ionicons name="trending-up" size={12} color="#4CAF50" />
                                </View>
                            </View>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statTitle}>{stat.title}</Text>
                        </View>
                    ))}
                </View>

                {/* Charts Section */}
                {renderBarChart()}
                {renderDonutChart()}

                {/* Popular Items List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Most Ordered Items</Text>
                    {popularItems.map((item, index) => (
                        <View key={index} style={styles.popularItem}>
                            <View style={styles.popularItemInfo}>
                                <Text style={styles.popularItemRank}>#{index + 1}</Text>
                                <View style={styles.popularItemDetails}>
                                    <Text style={styles.popularItemName} numberOfLines={1}>
                                        {item.name}
                                    </Text>
                                    <Text style={styles.popularItemOrders}>
                                        {item.orders} orders
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.popularItemProgress}>
                                <View style={styles.progressBar}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            { width: `${item.percentage}%` }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.progressText}>{item.percentage}%</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Recent Activities */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Activities</Text>
                    {recentActivities.map((activity) => (
                        <View key={activity.id} style={styles.activityItem}>
                            <View style={[
                                styles.activityIcon,
                                { backgroundColor: `${getActivityColor(activity.type)}15` }
                            ]}>
                                <Ionicons
                                    name={getActivityIcon(activity.type) as any}
                                    size={16}
                                    color={getActivityColor(activity.type)}
                                />
                            </View>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityMessage}>{activity.message}</Text>
                                <Text style={styles.activityTime}>{activity.time}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity style={styles.actionButton}>
                            <View style={styles.actionIconContainer}>
                                <Ionicons name="add-circle-outline" size={24} color="#1C1C1E" />
                            </View>
                            <Text style={styles.actionText}>Add Menu Item</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <View style={styles.actionIconContainer}>
                                <Ionicons name="people-outline" size={24} color="#2C2C2E" />
                            </View>
                            <Text style={styles.actionText}>Manage Staff</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <View style={styles.actionIconContainer}>
                                <Ionicons name="analytics-outline" size={24} color="#636366" />
                            </View>
                            <Text style={styles.actionText}>View Reports</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <View style={styles.actionIconContainer}>
                                <Ionicons name="settings-outline" size={24} color="#FF6B35" />
                            </View>
                            <Text style={styles.actionText}>Settings</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    headerContainer: {
        position: 'relative',
        height: 240,
        overflow: 'hidden',
    },
    headerBackgroundImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
    },
    headerOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
        fontFamily: 'System',
    },
    filterButton: {
        padding: 8,
    },
    titleContainer: {
        paddingHorizontal: 20,
        marginTop: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        fontFamily: 'System',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        fontFamily: 'System',
    },
    periodToggle: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F7',
        marginHorizontal: 20,
        marginTop: 30,
        marginBottom: 20,
        borderRadius: 25,
        padding: 4,
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    periodButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 20,
    },
    activePeriodButton: {
        backgroundColor: '#1C1C1E',
    },
    periodButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8E8E93',
        fontFamily: 'System',
    },
    activePeriodButtonText: {
        color: '#FFFFFF',
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    statCard: {
        backgroundColor: '#F5F5F7',
        width: '48%',
        padding: 20,
        margin: '1%',
        borderRadius: 15,
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    changeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E8',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    changeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4CAF50',
        marginRight: 4,
        fontFamily: 'System',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 4,
        fontFamily: 'System',
    },
    statTitle: {
        fontSize: 13,
        color: '#8E8E93',
        fontFamily: 'System',
        fontWeight: '500',
    },
    chartContainer: {
        backgroundColor: '#F5F5F7',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 15,
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 20,
        fontFamily: 'System',
    },
    barChartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 150,
        paddingTop: 20,
    },
    barContainer: {
        alignItems: 'center',
        flex: 1,
    },
    barWrapper: {
        height: 120,
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 8,
    },
    bar: {
        backgroundColor: '#1C1C1E',
        width: 20,
        borderRadius: 2,
        minHeight: 4,
    },
    barLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: '#1C1C1E',
        fontFamily: 'System',
        marginBottom: 2,
    },
    barValue: {
        fontSize: 9,
        color: '#8E8E93',
        fontFamily: 'System',
    },
    donutChartWrapper: {
        width: 140,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    donutCenter: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F8F9FA',
        borderWidth: 2,
        borderColor: '#F0F0F0',
    },
    donutCenterValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
    },
    donutCenterLabel: {
        fontSize: 10,
        color: '#8E8E93',
        fontFamily: 'System',
        textAlign: 'center',
    },
    donutRings: {
        width: 140,
        height: 140,
        borderRadius: 70,
        padding: 20,
        justifyContent: 'center',
    },
    donutSegment: {
        marginBottom: 4,
    },
    donutBar: {
        height: 8,
        borderRadius: 4,
        marginBottom: 2,
    },
    donutContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendContainer: {
        marginLeft: 20,
        flex: 1,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendText: {
        fontSize: 13,
        color: '#1C1C1E',
        fontFamily: 'System',
        flex: 1,
        fontWeight: '500',
    },
    legendValue: {
        fontSize: 13,
        color: '#8E8E93',
        fontFamily: 'System',
        fontWeight: '600',
    },
    section: {
        backgroundColor: '#F5F5F7',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 15,
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
        marginBottom: 20,
        fontFamily: 'System',
    },
    popularItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    popularItemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    popularItemRank: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1E',
        width: 30,
        fontFamily: 'System',
    },
    popularItemDetails: {
        marginLeft: 12,
        flex: 1,
    },
    popularItemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1C1C1E',
        fontFamily: 'System',
    },
    popularItemOrders: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
        fontFamily: 'System',
    },
    popularItemProgress: {
        alignItems: 'flex-end',
        marginLeft: 12,
    },
    progressBar: {
        width: 60,
        height: 6,
        backgroundColor: '#F0F0F0',
        borderRadius: 3,
        marginBottom: 4,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#1C1C1E',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 11,
        color: '#8E8E93',
        fontFamily: 'System',
        fontWeight: '600',
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    activityIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityMessage: {
        fontSize: 14,
        color: '#1C1C1E',
        fontFamily: 'System',
        fontWeight: '500',
    },
    activityTime: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
        fontFamily: 'System',
    },
    actionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionButton: {
        width: '48%',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        marginBottom: 12,
    },
    actionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
    },
    actionText: {
        fontSize: 13,
        color: '#1C1C1E',
        fontFamily: 'System',
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default AdminDashboardScreen;
