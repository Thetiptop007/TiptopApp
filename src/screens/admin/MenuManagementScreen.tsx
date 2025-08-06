import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MenuItem } from '../../types';

const MenuManagementScreen: React.FC = () => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([
        {
            id: '1',
            name: 'Chicken Biryani',
            description: 'Aromatic basmati rice with tender chicken',
            price: 12.99,
            category: 'Main Course',
            available: true,
        },
        {
            id: '2',
            name: 'Margherita Pizza',
            description: 'Classic pizza with fresh tomatoes and mozzarella',
            price: 10.99,
            category: 'Pizza',
            available: true,
        },
        {
            id: '3',
            name: 'Caesar Salad',
            description: 'Fresh romaine lettuce with caesar dressing',
            price: 7.99,
            category: 'Salads',
            available: false,
        },
    ]);

    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
    });

    const handleAddItem = () => {
        setEditingItem(null);
        setFormData({ name: '', description: '', price: '', category: '' });
        setModalVisible(true);
    };

    const handleEditItem = (item: MenuItem) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description,
            price: item.price.toString(),
            category: item.category,
        });
        setModalVisible(true);
    };

    const handleSaveItem = () => {
        if (!formData.name || !formData.description || !formData.price || !formData.category) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const newItem: MenuItem = {
            id: editingItem ? editingItem.id : Date.now().toString(),
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            category: formData.category,
            available: true,
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

    const renderMenuItem = ({ item }: { item: MenuItem }) => (
        <View style={styles.menuCard}>
            <View style={styles.menuHeader}>
                <Text style={styles.menuName}>{item.name}</Text>
                <TouchableOpacity
                    style={[styles.availabilityBadge, { backgroundColor: item.available ? '#4CAF50' : '#F44336' }]}
                    onPress={() => toggleAvailability(item.id)}
                >
                    <Text style={styles.availabilityText}>
                        {item.available ? 'Available' : 'Unavailable'}
                    </Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.menuDescription}>{item.description}</Text>
            <Text style={styles.menuPrice}>${item.price.toFixed(2)}</Text>
            <Text style={styles.menuCategory}>{item.category}</Text>

            <View style={styles.menuActions}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                    onPress={() => handleEditItem(item)}
                >
                    <Ionicons name="pencil" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                    onPress={() => handleDeleteItem(item.id)}
                >
                    <Ionicons name="trash" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Menu Management</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
                    <Ionicons name="add" size={24} color="#fff" />
                    <Text style={styles.addButtonText}>Add Item</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={menuItems}
                renderItem={renderMenuItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Item Name"
                            value={formData.name}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Description"
                            value={formData.description}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                            multiline
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Price"
                            value={formData.price}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                            keyboardType="numeric"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Category"
                            value={formData.category}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, category: text }))}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: '#666' }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: '#FF6B35' }]}
                                onPress={handleSaveItem}
                            >
                                <Text style={styles.modalButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF6B35',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    addButtonText: {
        color: '#fff',
        marginLeft: 5,
        fontWeight: 'bold',
    },
    menuCard: {
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
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    menuName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    availabilityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    availabilityText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    menuDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    menuPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF6B35',
        marginBottom: 5,
    },
    menuCategory: {
        fontSize: 12,
        color: '#999',
        marginBottom: 15,
    },
    menuActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
    },
    actionButtonText: {
        color: '#fff',
        marginLeft: 5,
        fontSize: 12,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '90%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    modalButton: {
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 5,
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MenuManagementScreen;
