import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface CashTransaction {
    id: string;
    orderId: string;
    customerName: string;
    amount: number;
    status: 'COLLECTED' | 'PENDING';
    collectionTime?: Date;
    deliveryBoy: string;
}

const CashManagementScreen: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showSettlement, setShowSettlement] = useState(false);

    // Mock cash data following README flow
    const todayCashData = {
        changeFund: 500,
        totalExpected: 18450,
        totalCollected: 15230,
        pending: 3220,
        deliveryBoy: 'Ravi Kumar',
        currentCashWithBoy: 9150,
    };

    const cashTransactions: CashTransaction[] = [
        {
            id: '1',
            orderId: 'ORD_COD_1234567',
            customerName: 'Rahul Kumar',
            amount: 1409,
            status: 'COLLECTED',
            collectionTime: new Date(Date.now() - 30 * 60000),
            deliveryBoy: 'Ravi'
        },
        {
            id: '2',
            orderId: 'ORD_COD_1234570',
            customerName: 'Anjali Verma',
            amount: 569,
            status: 'COLLECTED',
            collectionTime: new Date(Date.now() - 60 * 60000),
            deliveryBoy: 'Ravi'
        },
        {
            id: '3',
            orderId: 'ORD_COD_1234571',
            customerName: 'Suresh Patel',
            amount: 890,
            status: 'PENDING',
            deliveryBoy: 'Ravi'
        },
        {
            id: '4',
            orderId: 'ORD_COD_1234572',
            customerName: 'Meera Shah',
            amount: 1330,
            status: 'PENDING',
            deliveryBoy: 'Ravi'
        },
    ];

    const handleDailySettlement = () => {
        Alert.alert(
            'Daily Cash Settlement',
            `Settle all cash collections for today?\n\nExpected: ₹${todayCashData.currentCashWithBoy}\nDelivery Boy: ${todayCashData.deliveryBoy}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Start Settlement',
                    style: 'default',
                    onPress: () => setShowSettlement(true)
                }
            ]
        );
    };

    const handleCashDrop = () => {
        Alert.alert(
            'Emergency Cash Drop',
            `Instruct ${todayCashData.deliveryBoy} to return cash immediately?\n\nCurrent cash with delivery boy exceeds safety limit.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Request Cash Drop',
                    style: 'default',
                    onPress: () => {
                        // Here you would send notification to delivery boy
                        Alert.alert('Cash Drop Requested', `${todayCashData.deliveryBoy} has been notified to return cash immediately.`);
                    }
                }
            ]
        );
    };

    const handleVerifyCashCollection = (transactionId: string, orderId: string, amount: number) => {
        Alert.alert(
            'Verify Cash Collection',
            `Confirm cash collection for Order ${orderId}?\n\nAmount: ₹${amount}`,
            [
                { text: 'Not Collected', style: 'cancel' },
                {
                    text: 'Cash Collected',
                    style: 'default',
                    onPress: () => {
                        console.log(`Cash verified for ${orderId}: ₹${amount}`);
                        Alert.alert('Success', 'Cash collection verified and recorded.');
                    }
                }
            ]
        );
    };

    const getTimeAgo = (date: Date) => {
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        return `${Math.floor(diffInHours / 24)}d ago`;
    };

    const renderCashSummaryCard = () => (
        <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>💰 Today's Cash Summary</Text>
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: todayCashData.currentCashWithBoy > 5000 ? '#F44336' : '#4CAF50' }
                ]}>
                    <Text style={styles.statusText}>
                        {todayCashData.currentCashWithBoy > 5000 ? 'OVER LIMIT' : 'SAFE'}
                    </Text>
                </View>
            </View>

            <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>COD Orders</Text>
                    <Text style={styles.summaryValue}>{cashTransactions.length}</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total Expected</Text>
                    <Text style={styles.summaryValue}>₹{todayCashData.totalExpected.toLocaleString()}</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Cash Collected</Text>
                    <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>₹{todayCashData.totalCollected.toLocaleString()}</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Pending</Text>
                    <Text style={[styles.summaryValue, { color: '#FF9800' }]}>₹{todayCashData.pending.toLocaleString()}</Text>
                </View>
            </View>

            <View style={styles.deliveryBoyInfo}>
                <View style={styles.deliveryBoyDetails}>
                    <Ionicons name="person-circle" size={24} color="#2C2C2E" />
                    <View style={styles.deliveryBoyText}>
                        <Text style={styles.deliveryBoyName}>{todayCashData.deliveryBoy}</Text>
                        <Text style={styles.currentCashText}>
                            Current Cash: ₹{todayCashData.currentCashWithBoy.toLocaleString()}
                        </Text>
                    </View>
                </View>
                {todayCashData.currentCashWithBoy > 5000 && (
                    <TouchableOpacity style={styles.emergencyButton} onPress={handleCashDrop}>
                        <Ionicons name="warning" size={16} color="#FFFFFF" />
                        <Text style={styles.emergencyButtonText}>Cash Drop</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const renderTransactionCard = (transaction: CashTransaction) => (
        <View key={transaction.id} style={styles.transactionCard}>
            <View style={styles.transactionHeader}>
                <View style={styles.transactionInfo}>
                    <Text style={styles.orderId}>#{transaction.orderId}</Text>
                    <Text style={styles.customerName}>{transaction.customerName}</Text>
                </View>
                <View style={styles.transactionAmount}>
                    <Text style={styles.amountText}>₹{transaction.amount.toLocaleString()}</Text>
                    <View style={[
                        styles.transactionStatus,
                        { backgroundColor: transaction.status === 'COLLECTED' ? '#4CAF50' : '#FF9800' }
                    ]}>
                        <Text style={styles.transactionStatusText}>
                            {transaction.status === 'COLLECTED' ? 'COLLECTED' : 'PENDING'}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.transactionDetails}>
                <View style={styles.transactionMeta}>
                    <Ionicons name="person" size={14} color="#8E8E93" />
                    <Text style={styles.deliveryBoyLabel}>By {transaction.deliveryBoy}</Text>
                </View>
                {transaction.collectionTime && (
                    <View style={styles.transactionMeta}>
                        <Ionicons name="time" size={14} color="#8E8E93" />
                        <Text style={styles.timeText}>{getTimeAgo(transaction.collectionTime)}</Text>
                    </View>
                )}
            </View>

            {transaction.status === 'PENDING' && (
                <TouchableOpacity
                    style={styles.verifyButton}
                    onPress={() => handleVerifyCashCollection(transaction.id, transaction.orderId, transaction.amount)}
                >
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.verifyButtonText}>Mark as Collected</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderSettlementModal = () => {
        if (!showSettlement) return null;

        return (
            <View style={styles.settlementOverlay}>
                <View style={styles.settlementModal}>
                    <Text style={styles.settlementTitle}>End of Day Settlement</Text>

                    <View style={styles.settlementDetails}>
                        <Text style={styles.settlementLabel}>Delivery Boy: {todayCashData.deliveryBoy}</Text>

                        <View style={styles.settlementRow}>
                            <Text style={styles.settlementItemLabel}>Morning Change Fund:</Text>
                            <Text style={styles.settlementItemValue}>₹{todayCashData.changeFund}</Text>
                        </View>

                        <View style={styles.settlementRow}>
                            <Text style={styles.settlementItemLabel}>Today's Collections:</Text>
                            <Text style={styles.settlementItemValue}>₹{todayCashData.totalCollected}</Text>
                        </View>

                        <View style={[styles.settlementRow, styles.settlementTotal]}>
                            <Text style={styles.settlementTotalLabel}>Total to Return:</Text>
                            <Text style={styles.settlementTotalValue}>₹{todayCashData.currentCashWithBoy}</Text>
                        </View>
                    </View>

                    <View style={styles.settlementActions}>
                        <TouchableOpacity
                            style={[styles.settlementButton, styles.cancelButton]}
                            onPress={() => setShowSettlement(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.settlementButton, styles.confirmButton]}
                            onPress={() => {
                                setShowSettlement(false);
                                Alert.alert('Settlement Complete', 'Daily cash settlement recorded successfully!');
                            }}
                        >
                            <Text style={styles.confirmButtonText}>Complete Settlement</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Cash Management</Text>
                <Text style={styles.headerSubtitle}>COD Orders & Daily Settlement</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Cash Summary Card */}
                {renderCashSummaryCard()}

                {/* Actions */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                        onPress={handleDailySettlement}
                    >
                        <Ionicons name="calculator" size={20} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Daily Settlement</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                        onPress={() => Alert.alert('Cash Report', 'Weekly cash report will be generated and exported.')}
                    >
                        <Ionicons name="document-text" size={20} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Weekly Report</Text>
                    </TouchableOpacity>
                </View>

                {/* Transactions List */}
                <View style={styles.transactionsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Today's COD Transactions</Text>
                        <Text style={styles.transactionCount}>
                            {cashTransactions.filter(t => t.status === 'COLLECTED').length} of {cashTransactions.length} collected
                        </Text>
                    </View>

                    {cashTransactions.map(transaction => renderTransactionCard(transaction))}
                </View>

                {/* Safety Guidelines */}
                <View style={styles.guidelinesCard}>
                    <Text style={styles.guidelinesTitle}>💡 Cash Safety Guidelines</Text>
                    <View style={styles.guideline}>
                        <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
                        <Text style={styles.guidelineText}>Maximum cash limit: ₹5,000 per delivery boy</Text>
                    </View>
                    <View style={styles.guideline}>
                        <Ionicons name="time" size={16} color="#2196F3" />
                        <Text style={styles.guidelineText}>Mandatory cash drop when limit exceeded</Text>
                    </View>
                    <View style={styles.guideline}>
                        <Ionicons name="document" size={16} color="#FF9800" />
                        <Text style={styles.guidelineText}>Daily settlement at end of shift (10 PM)</Text>
                    </View>
                    <View style={styles.guideline}>
                        <Ionicons name="camera" size={16} color="#9C27B0" />
                        <Text style={styles.guidelineText}>Photo verification for large amounts</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Settlement Modal */}
            {renderSettlementModal()}
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
    content: {
        flex: 1,
        paddingTop: 20,
    },
    summaryCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2C2C2E',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    summaryItem: {
        width: '48%',
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#8E8E93',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2C2C2E',
    },
    deliveryBoyInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
    },
    deliveryBoyDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    deliveryBoyText: {
        marginLeft: 12,
    },
    deliveryBoyName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C2C2E',
    },
    currentCashText: {
        fontSize: 14,
        color: '#8E8E93',
    },
    emergencyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F44336',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    emergencyButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: 4,
    },
    actionsContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 20,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: 8,
    },
    transactionsSection: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2C2C2E',
    },
    transactionCount: {
        fontSize: 14,
        color: '#8E8E93',
    },
    transactionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    transactionInfo: {
        flex: 1,
    },
    orderId: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C2C2E',
        marginBottom: 4,
    },
    customerName: {
        fontSize: 14,
        color: '#8E8E93',
    },
    transactionAmount: {
        alignItems: 'flex-end',
    },
    amountText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2C2C2E',
        marginBottom: 4,
    },
    transactionStatus: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    transactionStatusText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    transactionDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    transactionMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deliveryBoyLabel: {
        fontSize: 12,
        color: '#8E8E93',
        marginLeft: 4,
    },
    timeText: {
        fontSize: 12,
        color: '#8E8E93',
        marginLeft: 4,
    },
    verifyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8F5E8',
        paddingVertical: 10,
        borderRadius: 8,
    },
    verifyButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4CAF50',
        marginLeft: 6,
    },
    guidelinesCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    guidelinesTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2C2C2E',
        marginBottom: 16,
    },
    guideline: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    guidelineText: {
        fontSize: 14,
        color: '#666666',
        marginLeft: 12,
        flex: 1,
    },
    settlementOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    settlementModal: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        marginHorizontal: 40,
        width: width - 80,
    },
    settlementTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2C2C2E',
        textAlign: 'center',
        marginBottom: 20,
    },
    settlementDetails: {
        marginBottom: 24,
    },
    settlementLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C2C2E',
        marginBottom: 16,
        textAlign: 'center',
    },
    settlementRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    settlementItemLabel: {
        fontSize: 14,
        color: '#8E8E93',
    },
    settlementItemValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2C2C2E',
    },
    settlementTotal: {
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 12,
        marginTop: 12,
    },
    settlementTotalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C2C2E',
    },
    settlementTotalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2C2C2E',
    },
    settlementActions: {
        flexDirection: 'row',
        gap: 12,
    },
    settlementButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 12,
    },
    cancelButton: {
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8E8E93',
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default CashManagementScreen;
