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
            color: '#2C2C2E',
            change: selectedPeriod === 'today' ? '+15%' : '+8.5%'
        },
        {
            title: selectedPeriod === 'today' ? 'Today Revenue' : 'Total Revenue',
            value: `₹${currentStats.revenue.toLocaleString()}`,
            icon: 'cash-outline',
            color: '#C62828',
            change: selectedPeriod === 'today' ? '+22%' : '+12.3%'
        },
        {
            title: selectedPeriod === 'today' ? 'Active Users' : 'Total Users',
            value: currentStats.users.toString(),
            icon: 'people-outline',
            color: '#424242',
            change: selectedPeriod === 'today' ? '+5%' : '+18.7%'
        },
        {
            title: selectedPeriod === 'today' ? 'Active Deliveries' : 'Total Deliveries',
            value: currentStats.deliveries.toString(),
            icon: 'bicycle-outline',
            color: '#616161',
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
        { id: 1, message: 'Payment received from Order #1234', amount: '₹450', time: '2 min ago', type: 'credit', status: 'completed' },
        { id: 2, message: 'Refund processed for Order #1230', amount: '₹280', time: '5 min ago', type: 'debit', status: 'completed' },
        { id: 3, message: 'Payment received from Order #1235', amount: '₹720', time: '8 min ago', type: 'credit', status: 'completed' },
        { id: 4, message: 'Delivery fee charged for Order #1233', amount: '₹50', time: '12 min ago', type: 'credit', status: 'completed' },
        { id: 5, message: 'Commission payment to delivery partner', amount: '₹150', time: '15 min ago', type: 'debit', status: 'pending' },
        { id: 6, message: 'Payment received from Order #1236', amount: '₹890', time: '18 min ago', type: 'credit', status: 'completed' },
    ];

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'credit': return 'arrow-down-circle-outline';
            case 'debit': return 'arrow-up-circle-outline';
            default: return 'card-outline';
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'credit': return '#4CAF50';
            case 'debit': return '#e36057ff';
            default: return '#9E9E9E';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#4CAF50';
            case 'pending': return '#FF9800';
            case 'failed': return '#e36057ff';
            default: return '#9E9E9E';
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
            <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Weekly Revenue Trend</Text>
            </View>
            <View style={styles.chartMetrics}>
                <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Avg Daily</Text>
                    <Text style={styles.metricValue}>₹{(weeklyData.reduce((sum, d) => sum + d.revenue, 0) / 7 / 1000).toFixed(1)}k</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Peak Day</Text>
                    <Text style={styles.metricValue}>₹{(Math.max(...weeklyData.map(d => d.revenue)) / 1000).toFixed(1)}k</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Growth</Text>
                    <Text style={styles.metricGrowth}>+12.5%</Text>
                </View>
            </View>
            <View style={styles.barChartContainer}>
                {weeklyData.map((data, index) => {
                    const barHeight = (data.revenue / maxRevenue) * 120;
                    const isHighest = data.revenue === maxRevenue;
                    const isLowest = data.revenue === Math.min(...weeklyData.map(d => d.revenue));
                    return (
                        <View key={data.day} style={styles.barContainer}>
                            <View style={styles.barWrapper}>
                                <View style={styles.barBackground}>
                                    <View
                                        style={[
                                            styles.bar,
                                            { height: barHeight },
                                            isHighest && styles.highlightBar,
                                            isLowest && styles.lowestBar
                                        ]}
                                    >
                                        <View style={styles.barGradientOverlay} />
                                    </View>
                                </View>
                            </View>
                            <Text style={[
                                styles.barLabel,
                                isHighest && styles.highlightLabel,
                                isLowest && styles.lowestLabel
                            ]}>{data.day}</Text>
                            <Text style={[
                                styles.barValue,
                                isHighest && styles.highlightValue,
                                isLowest && styles.lowestValue
                            ]}>₹{(data.revenue / 1000).toFixed(1)}k</Text>
                        </View>
                    );
                })}
            </View>
            <View style={styles.chartFooter}>
                <View style={styles.trendIndicator}>
                    <Ionicons name="trending-up" size={14} color="#4CAF50" />
                    <Text style={styles.trendText}>Revenue trending upward this week</Text>
                </View>
            </View>
        </View>
    );

    const renderDonutChart = () => {
        const total = popularItems.reduce((sum, item) => sum + item.orders, 0);
        const colors = ['#2C2C2E', '#4CAF50', '#e36057ff', '#FF9800', '#9C27B0'];

        return (
            <View style={styles.chartContainer}>
                <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>Popular Items Distribution</Text>
                </View>

                {/* Circular Progress Rings */}
                <View style={styles.circularProgressContainer}>
                    {popularItems.slice(0, 5).map((item, index) => {
                        const percentage = (item.orders / total) * 100;

                        return (
                            <View key={index} style={styles.circularItem}>
                                <View style={styles.circularProgressWrapper}>
                                    <View style={styles.circularProgressContainer2}>
                                        {/* Background Circle */}
                                        <View style={styles.circularProgressBackground} />

                                        {/* Progressive Arc */}
                                        <View style={styles.progressCircle}>
                                            {/* First Half (0-50%) */}
                                            <View style={[
                                                styles.progressFirstHalf,
                                                {
                                                    borderColor: colors[index],
                                                    transform: [
                                                        { rotate: '-90deg' },
                                                        { rotate: percentage <= 50 ? `${(percentage / 50) * 180}deg` : '180deg' }
                                                    ]
                                                }
                                            ]} />

                                            {/* Second Half (50-100%) */}
                                            {percentage > 50 && (
                                                <View style={[
                                                    styles.progressSecondHalf,
                                                    {
                                                        borderColor: colors[index],
                                                        transform: [
                                                            { rotate: '90deg' },
                                                            { rotate: `${((percentage - 50) / 50) * 180}deg` }
                                                        ]
                                                    }
                                                ]} />
                                            )}
                                        </View>

                                        {/* Inner content */}
                                        <View style={styles.circularProgressInner}>
                                            <Text style={styles.circularPercentage}>
                                                {percentage.toFixed(0)}%
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={[styles.rankBadge, { backgroundColor: colors[index] }]}>
                                        <Text style={styles.rankText}>#{index + 1}</Text>
                                    </View>
                                </View>
                                <View style={styles.circularItemInfo}>
                                    <Text style={styles.circularItemName} numberOfLines={2}>
                                        {item.name}
                                    </Text>
                                    <View style={styles.ordersBadge}>
                                        <Text style={styles.circularItemOrders}>
                                            {item.orders} orders
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Summary Stats */}
                <View style={styles.distributionSummary}>
                    <View style={styles.summaryHeader}>
                        <Text style={styles.summaryTitle}>Quick Insights</Text>
                        <View style={styles.summaryIcon}>
                            <Ionicons name="analytics-outline" size={16} color="#4CAF50" />
                        </View>
                    </View>
                    <View style={styles.summaryRow}>
                        <View style={[styles.summaryStatCard, styles.topItemCard]}>
                            <View style={styles.statCardIcon}>
                                <Ionicons name="trophy-outline" size={20} color="#FF9800" />
                            </View>
                            <Text style={styles.summaryStatValue} numberOfLines={1}>
                                {popularItems[0]?.name || 'N/A'}
                            </Text>
                            <Text style={styles.summaryStatLabel}>Top Item</Text>
                        </View>
                        <View style={[styles.summaryStatCard, styles.totalCard]}>
                            <View style={styles.statCardIcon}>
                                <Ionicons name="bar-chart-outline" size={20} color="#4CAF50" />
                            </View>
                            <Text style={styles.summaryStatValue}>
                                {popularItems.slice(0, 3).reduce((sum, item) => sum + item.orders, 0)}
                            </Text>
                            <Text style={styles.summaryStatLabel}>Top 3 Total</Text>
                        </View>
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
                                <Ionicons name="analytics-outline" size={24} color="#E53935" />
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
                        <View key={index} style={[
                            styles.statCard,
                            index === 0 && styles.statCardPrimary,
                            index === 1 && styles.statCardRevenue,
                            index === 2 && styles.statCardUsers,
                            index === 3 && styles.statCardDelivery
                        ]}>
                            <View style={styles.statHeader}>
                                <View style={[
                                    styles.statIconContainer,
                                    index === 1 && styles.revenueIconContainer,
                                    index === 0 && styles.primaryIconContainer
                                ]}>
                                    <Ionicons name={stat.icon as any} size={24} color={
                                        index === 1 ? '#FFFFFF' :
                                            index === 0 ? '#FFFFFF' :
                                                stat.color
                                    } />
                                </View>
                                <View style={[
                                    styles.changeContainer,
                                    (index === 0 || index === 1) && styles.whiteChangeContainer
                                ]}>
                                    <Text style={[
                                        styles.changeText,
                                        (index === 0 || index === 1) && styles.whiteChangeText
                                    ]}>{stat.change}</Text>
                                    <Ionicons name="trending-up" size={12} color={
                                        index === 0 || index === 1 ? 'rgba(255, 255, 255, 0.8)' : '#4CAF50'
                                    } />
                                </View>
                            </View>
                            <Text style={[
                                styles.statValue,
                                (index === 0 || index === 1) && styles.whiteStatValue
                            ]}>{stat.value}</Text>
                            <Text style={[
                                styles.statTitle,
                                (index === 0 || index === 1) && styles.whiteStatTitle
                            ]}>{stat.title}</Text>
                        </View>
                    ))}
                </View>

                {/* Charts Section */}
                {renderBarChart()}
                {renderDonutChart()}

                {/* Transaction Activities */}
                {/* Transaction Activities */}
                <View style={styles.transactionSection}>
                    <View style={styles.transactionHeader}>
                        <Text style={styles.transactionTitle}>Transaction Activities</Text>
                        <TouchableOpacity style={styles.seeAllButton}>
                            <Text style={styles.seeAllText}>See All</Text>
                            <Ionicons name="chevron-forward" size={16} color="#e36057ff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.transactionSummary}>
                        <View style={styles.summaryItem}>
                            <View style={styles.summaryIconContainer}>
                                <Ionicons name="trending-up" size={20} color="#4CAF50" />
                            </View>
                            <View style={styles.summaryContent}>
                                <Text style={styles.summaryLabel}>Total Inflow</Text>
                                <Text style={styles.summaryValue}>₹2,060</Text>
                            </View>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <View style={styles.summaryIconContainer}>
                                <Ionicons name="trending-down" size={20} color="#e36057ff" />
                            </View>
                            <View style={styles.summaryContent}>
                                <Text style={styles.summaryLabel}>Total Outflow</Text>
                                <Text style={styles.summaryValue}>₹430</Text>
                            </View>
                        </View>
                    </View>

                    {recentActivities.map((activity) => (
                        <View key={activity.id} style={styles.transactionItem}>
                            <View style={styles.transactionLeft}>
                                <View style={[
                                    styles.transactionIcon,
                                    { backgroundColor: `${getActivityColor(activity.type)}15` }
                                ]}>
                                    <Ionicons
                                        name={getActivityIcon(activity.type) as any}
                                        size={20}
                                        color={getActivityColor(activity.type)}
                                    />
                                </View>
                                <View style={styles.transactionContent}>
                                    <Text style={styles.transactionMessage} numberOfLines={2}>
                                        {activity.message}
                                    </Text>
                                    <View style={styles.transactionMeta}>
                                        <Text style={styles.transactionTime}>{activity.time}</Text>
                                        <View style={[
                                            styles.statusBadge,
                                            { backgroundColor: `${getStatusColor(activity.status)}15` }
                                        ]}>
                                            <View style={[
                                                styles.statusDot,
                                                { backgroundColor: getStatusColor(activity.status) }
                                            ]} />
                                            <Text style={[
                                                styles.statusText,
                                                { color: getStatusColor(activity.status) }
                                            ]}>
                                                {activity.status}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.transactionRight}>
                                <Text style={[
                                    styles.transactionAmount,
                                    {
                                        color: activity.type === 'credit' ? '#4CAF50' : '#e36057ff',
                                    }
                                ]}>
                                    {activity.type === 'credit' ? '+' : '-'}{activity.amount}
                                </Text>
                                <TouchableOpacity style={styles.transactionActionButton}>
                                    <Ionicons name="ellipsis-horizontal" size={16} color="#8E8E93" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    <View style={styles.transactionFooter}>
                        <TouchableOpacity style={styles.downloadButton}>
                            <Ionicons name="download-outline" size={16} color="#e36057ff" />
                            <Text style={styles.downloadText}>Download Report</Text>
                        </TouchableOpacity>
                    </View>
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
                                <Ionicons name="settings-outline" size={24} color="#FF6659" />
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
        backgroundColor: '#2C2C2E',
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
        backgroundColor: '#FFFFFF',
        width: '48%',
        padding: 20,
        margin: '1%',
        borderRadius: 20,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 12,
        borderWidth: 0.5,
        borderColor: '#E8E8E8',
        transform: [{ perspective: 1000 }],
    },
    statCardPrimary: {
        backgroundColor: '#2A2A2E',
        borderColor: '#3A3A3E',
        shadowColor: '#2A2A2E',
        shadowOffset: { width: -2, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
    },
    statCardRevenue: {
        backgroundColor: '#e36057ff',
        borderColor: '#e36057ff',
        shadowColor: '#e36057ff',
        shadowOffset: { width: -2, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
    },
    statCardUsers: {
        backgroundColor: '#F8FFFE',
        borderColor: '#E0F2F1',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 2, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
    },
    statCardDelivery: {
        backgroundColor: '#FAFAFA',
        borderColor: '#EEEEEE',
        shadowColor: '#9E9E9E',
        shadowOffset: { width: 2, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(60, 60, 67, 0.08)',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    primaryIconContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        shadowColor: 'rgba(255, 255, 255, 0.3)',
    },
    revenueIconContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        shadowColor: 'rgba(255, 255, 255, 0.3)',
    },
    changeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E8',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 14,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    whiteChangeContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        shadowColor: 'rgba(255, 255, 255, 0.4)',
    },
    changeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4CAF50',
        marginRight: 4,
        fontFamily: 'System',
    },
    whiteChangeText: {
        color: 'rgba(255, 255, 255, 0.9)',
    },
    statValue: {
        fontSize: 26,
        fontWeight: '800',
        color: '#2C2C2E',
        marginBottom: 6,
        fontFamily: 'System',
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    whiteStatValue: {
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
    },
    statTitle: {
        fontSize: 13,
        color: '#8E8E93',
        fontFamily: 'System',
        fontWeight: '500',
        textShadowColor: 'rgba(0, 0, 0, 0.05)',
        textShadowOffset: { width: 0, height: 0.5 },
        textShadowRadius: 1,
    },
    whiteStatTitle: {
        color: 'rgba(255, 255, 255, 0.85)',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
    },
    chartContainer: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 24,
        borderRadius: 20,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 0.5,
        borderColor: '#E8E8E8',
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2C2C2E',
        fontFamily: 'System',
    },
    totalOrdersBadge: {
        backgroundColor: '#F0F8FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E3F2FD',
    },
    totalOrdersText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2196F3',
        fontFamily: 'System',
    },
    chartPeriodIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F8FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E3F2FD',
    },
    periodDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#2196F3',
        marginRight: 6,
    },
    periodText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2196F3',
        fontFamily: 'System',
    },
    chartMetrics: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    metricItem: {
        alignItems: 'center',
        flex: 1,
    },
    metricDivider: {
        width: 1,
        height: 24,
        backgroundColor: '#E8E8E8',
        marginHorizontal: 8,
    },
    metricLabel: {
        fontSize: 11,
        color: '#8E8E93',
        fontFamily: 'System',
        fontWeight: '500',
        marginBottom: 4,
    },
    metricValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2C2C2E',
        fontFamily: 'System',
    },
    metricGrowth: {
        fontSize: 14,
        fontWeight: '700',
        color: '#4CAF50',
        fontFamily: 'System',
    },
    barChartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 160,
        paddingTop: 20,
        paddingHorizontal: 4,
    },
    barContainer: {
        alignItems: 'center',
        flex: 1,
        position: 'relative',
    },
    barWrapper: {
        height: 140,
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 12,
        position: 'relative',
    },
    barBackground: {
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        padding: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    bar: {
        backgroundColor: '#2C2C2E',
        width: 24,
        borderRadius: 6,
        minHeight: 8,
        position: 'relative',
        overflow: 'hidden',
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    highlightBar: {
        backgroundColor: '#4CAF50',
        shadowColor: '#4CAF50',
        shadowOpacity: 0.3,
        transform: [{ scale: 1.1 }],
    },
    lowestBar: {
        backgroundColor: '#e36057ff',
        shadowColor: '#e36057ff',
        shadowOpacity: 0.3,
        transform: [{ scale: 1.05 }],
    },
    barGradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '30%',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
    },
    peakIndicator: {
        position: 'absolute',
        top: -24,
        backgroundColor: '#4CAF50',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    peakText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
        fontFamily: 'System',
    },
    barLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2C2C2E',
        fontFamily: 'System',
        marginBottom: 3,
    },
    highlightLabel: {
        color: '#4CAF50',
        fontWeight: '700',
    },
    lowestLabel: {
        color: '#e36057ff',
        fontWeight: '700',
    },
    barValue: {
        fontSize: 10,
        color: '#8E8E93',
        fontFamily: 'System',
        fontWeight: '500',
    },
    highlightValue: {
        color: '#4CAF50',
        fontWeight: '700',
    },
    lowestValue: {
        color: '#e36057ff',
        fontWeight: '700',
    },
    chartFooter: {
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    trendIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    trendText: {
        fontSize: 13,
        color: '#4CAF50',
        fontFamily: 'System',
        fontWeight: '600',
        marginLeft: 6,
    },
    circularProgressContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    circularItem: {
        width: '18%',
        alignItems: 'center',
        marginBottom: 16,
    },
    circularProgressWrapper: {
        marginBottom: 8,
        position: 'relative',
    },
    circularProgressContainer2: {
        width: 50,
        height: 50,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    circularProgressBackground: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 4,
        borderColor: '#F0F0F0',
    },
    progressCircle: {
        position: 'absolute',
        width: 50,
        height: 50,
    },
    progressFirstHalf: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 4,
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent',
    },
    progressSecondHalf: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 4,
        borderTopColor: 'transparent',
        borderLeftColor: 'transparent',
        borderBottomColor: 'transparent',
    },
    rankBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    rankText: {
        fontSize: 8,
        fontWeight: '700',
        color: '#FFFFFF',
        fontFamily: 'System',
    },
    circularProgressInner: {
        position: 'absolute',
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    circularPercentage: {
        fontSize: 10,
        fontWeight: '700',
        color: '#2C2C2E',
        fontFamily: 'System',
    },
    circularItemInfo: {
        alignItems: 'center',
        width: '100%',
    },
    colorIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginBottom: 4,
    },
    circularItemName: {
        fontSize: 10,
        fontWeight: '600',
        color: '#2C2C2E',
        textAlign: 'center',
        marginBottom: 2,
        fontFamily: 'System',
    },
    circularItemOrders: {
        fontSize: 9,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: '600',
    },
    ordersBadge: {
        backgroundColor: '#2C2C2E',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        marginTop: 4,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    distributionSummary: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2C2C2E',
        fontFamily: 'System',
    },
    summaryIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#E8F5E8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryStatCard: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 16,
        alignItems: 'center',
        marginHorizontal: 6,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    topItemCard: {
        backgroundColor: '#FFF8E1',
        borderColor: '#FFE0B2',
    },
    totalCard: {
        backgroundColor: '#E8F5E8',
        borderColor: '#C8E6C9',
    },
    statCardIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    summaryStatValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2C2C2E',
        fontFamily: 'System',
        marginBottom: 4,
        textAlign: 'center',
    },
    summaryStatLabel: {
        fontSize: 10,
        color: '#8E8E93',
        fontFamily: 'System',
        fontWeight: '500',
        textAlign: 'center',
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
        backgroundColor: '#2C2C2E',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 11,
        color: '#8E8E93',
        fontFamily: 'System',
        fontWeight: '600',
    },
    transactionSection: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 24,
        borderRadius: 20,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 0.5,
        borderColor: '#E8E8E8',
    },
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    transactionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2C2C2E',
        fontFamily: 'System',
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF0F0',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FFE0E0',
    },
    seeAllText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#e36057ff',
        fontFamily: 'System',
        marginRight: 4,
    },
    transactionSummary: {
        flexDirection: 'row',
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    summaryIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    summaryContent: {
        flex: 1,
    },
    summaryLabel: {
        fontSize: 11,
        color: '#8E8E93',
        fontFamily: 'System',
        fontWeight: '500',
        marginBottom: 2,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2C2C2E',
        fontFamily: 'System',
    },
    summaryDivider: {
        width: 1,
        backgroundColor: '#E8E8E8',
        marginHorizontal: 16,
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FAFBFC',
        padding: 16,
        marginBottom: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    transactionIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
    },
    transactionContent: {
        flex: 1,
    },
    transactionMessage: {
        fontSize: 14,
        color: '#2C2C2E',
        fontFamily: 'System',
        fontWeight: '500',
        marginBottom: 6,
        lineHeight: 18,
    },
    transactionMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    transactionTime: {
        fontSize: 11,
        color: '#8E8E93',
        fontFamily: 'System',
        marginRight: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
    },
    statusDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginRight: 4,
    },
    statusText: {
        fontSize: 9,
        fontWeight: '600',
        fontFamily: 'System',
        textTransform: 'capitalize',
    },
    transactionRight: {
        alignItems: 'flex-end',
        minWidth: 80,
    },
    transactionAmount: {
        fontSize: 15,
        fontWeight: '700',
        fontFamily: 'System',
        marginBottom: 6,
    },
    transactionActionButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    transactionFooter: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        alignItems: 'center',
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8F8',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FFE8E8',
        shadowColor: '#e36057ff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    downloadText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#e36057ff',
        fontFamily: 'System',
        marginLeft: 8,
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
