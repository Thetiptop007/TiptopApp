import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MenuItem } from '../../types';

const CustomerHomeScreen: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Mock data
    const menuItems: MenuItem[] = [
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
            available: true,
        },
        {
            id: '4',
            name: 'Chocolate Cake',
            description: 'Rich chocolate cake with vanilla frosting',
            price: 5.99,
            category: 'Desserts',
            available: true,
        },
    ];

    const categories = ['All', 'Main Course', 'Pizza', 'Salads', 'Desserts'];

    const banners = [
        { id: 1, title: '20% Off Today!', subtitle: 'On all main courses' },
        { id: 2, title: 'Free Delivery', subtitle: 'Orders above $25' },
    ];

    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesCategory && item.available;
    });

    const addToCart = (item: MenuItem) => {
        // In real app, add to cart context/state
        console.log('Added to cart:', item.name);
    };

    const renderBanner = ({ item }: { item: any }) => (
        <View style={styles.banner}>
            <Text style={styles.bannerTitle}>{item.title}</Text>
            <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
        </View>
    );

    const renderCategory = ({ item }: { item: string }) => (
        <TouchableOpacity
            style={[
                styles.categoryButton,
                selectedCategory === item && styles.selectedCategory,
            ]}
            onPress={() => setSelectedCategory(item)}
        >
            <Text
                style={[
                    styles.categoryText,
                    selectedCategory === item && styles.selectedCategoryText,
                ]}
            >
                {item}
            </Text>
        </TouchableOpacity>
    );

    const renderMenuItem = ({ item }: { item: MenuItem }) => (
        <View style={styles.menuCard}>
            <View style={styles.menuImagePlaceholder}>
                <Ionicons name="restaurant" size={40} color="#ccc" />
            </View>

            <View style={styles.menuInfo}>
                <Text style={styles.menuName}>{item.name}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
                <Text style={styles.menuPrice}>${item.price.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => addToCart(item)}
            >
                <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>TipTop Restaurant</Text>
                <TouchableOpacity>
                    <Ionicons name="notifications-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for food..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Banners */}
            <FlatList
                data={banners}
                renderItem={renderBanner}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.bannersContainer}
            />

            {/* Categories */}
            <FlatList
                data={categories}
                renderItem={renderCategory}
                keyExtractor={(item) => item}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesContainer}
            />

            {/* Menu Items */}
            <FlatList
                data={filteredItems}
                renderItem={renderMenuItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.menuList}
            />
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
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    bannersContainer: {
        paddingLeft: 10,
        marginVertical: 10,
    },
    banner: {
        backgroundColor: '#FF6B35',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 10,
        marginRight: 10,
        width: 200,
    },
    bannerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    bannerSubtitle: {
        color: '#fff',
        fontSize: 14,
        marginTop: 5,
    },
    categoriesContainer: {
        paddingLeft: 10,
        marginBottom: 10,
    },
    categoryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedCategory: {
        backgroundColor: '#FF6B35',
        borderColor: '#FF6B35',
    },
    categoryText: {
        color: '#666',
        fontSize: 14,
    },
    selectedCategoryText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    menuList: {
        paddingHorizontal: 10,
    },
    menuCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginVertical: 5,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    menuImagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuInfo: {
        flex: 1,
    },
    menuName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    menuDescription: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    menuPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF6B35',
    },
    addButton: {
        backgroundColor: '#FF6B35',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CustomerHomeScreen;
