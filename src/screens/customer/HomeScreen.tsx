import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, NativeScrollEvent, NativeSyntheticEvent, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MenuItem } from '../../types';
import { menuData, categories, restaurantInfo } from '../../data/menuData';
import { useTabBar } from '../../contexts/TabBarContext';

const CustomerHomeScreen: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showStickySearch, setShowStickySearch] = useState(false);
    const stickySearchAnimation = useRef(new Animated.Value(-150)); // Start off-screen with more buffer
    const searchLogoShakeAnimation = useRef(new Animated.Value(0)); // For logo shake animation
    const searchLogoJumpAnimation = useRef(new Animated.Value(0)); // For logo jump animation
    const { setTabBarVisible } = useTabBar();
    const lastScrollY = useRef(0);
    const scrollThreshold = 10; // Minimum scroll distance to trigger hide/show
    const headerHeight = 220; // Height of the header

    // Smooth animation effect similar to CustomTabBar
    useEffect(() => {
        Animated.timing(stickySearchAnimation.current, {
            toValue: showStickySearch ? 0 : -150,
            duration: 300,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), // Same smooth easing as CustomTabBar
            useNativeDriver: true,
        }).start();
    }, [showStickySearch]);

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

    // Use imported menu data
    const menuItems: MenuItem[] = menuData;

    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesCategory && item.available;
    });

    const addToCart = (item: MenuItem) => {
        console.log('Added to cart:', item.name);
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const scrollDifference = currentScrollY - lastScrollY.current;

        // Show sticky search when header is completely hidden
        if (currentScrollY > headerHeight) {
            if (!showStickySearch) {
                setShowStickySearch(true);
            }
        } else {
            if (showStickySearch) {
                setShowStickySearch(false);
            }
        }

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

    const renderCategory = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.categoryContainer}
            onPress={() => setSelectedCategory(item.name)}
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

    const getPopularItems = () => {
        // Select 3 specific popular items
        const popularItemIds = ['nonveg_1', 'veg_1', 'biryani_1']; // Butter Chicken, Paneer Butter Masala, Chicken Dum Biryani
        return menuItems.filter(item => popularItemIds.includes(item.id));
    };

    const renderFeaturedItem = ({ item }: { item: MenuItem }) => (
        <View style={styles.featuredCard}>
            {item.image && (
                <Image
                    source={{ uri: item.image }}
                    style={styles.featuredBackgroundImage}
                    resizeMode="cover"
                />
            )}
            <View style={styles.featuredGradientOverlay}>
                <View style={styles.featuredBadgeContainer}>
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color="#1C1C1E" />
                        <Text style={styles.ratingBadgeText}>{item.rating}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addToCartButton}
                        onPress={() => addToCart(item)}
                    >
                        <Ionicons name="add" size={18} color="#F9F9F9" />
                    </TouchableOpacity>
                </View>
                <View style={styles.featuredInfoCard}>
                    <View style={styles.titlePriceContainer}>
                        <Text style={styles.featuredCardTitle} numberOfLines={1}>{item.name}</Text>
                        <View style={styles.priceTag}>
                            <Text style={styles.featuredCardPrice}>₹{item.price}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
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
            </View>
            <View style={styles.menuInfo}>
                <Text style={styles.menuName}>{item.name}</Text>
                <Text style={styles.menuDescription} numberOfLines={2}>{item.description}</Text>
                <View style={styles.ratingRow}>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={styles.menuRatingText}>{item.rating} ({item.reviews})</Text>
                    </View>
                </View>
                <Text style={styles.menuPrice}>₹{item.price.toFixed(0)}</Text>
            </View>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => addToCart(item)}
            >
                <Ionicons name="add" size={20} color="#F9F9F9" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Animated Sticky Search Bar */}
            {showStickySearch && (
                <Animated.View
                    style={[
                        styles.stickySearchBar,
                        {
                            transform: [{ translateY: stickySearchAnimation.current }]
                        }
                    ]}
                >
                    <View style={styles.stickyHeaderRow}>
                        <Image
                            source={require('../../../assets/logo.png')}
                            style={styles.stickyLogo}
                            resizeMode="contain"
                        />
                        <View style={styles.stickySearchContainer}>
                            <Ionicons name="search" size={20} color="#8E8E93" />
                            <TextInput
                                style={styles.stickySearchInput}
                                placeholder="Search delicious food..."
                                placeholderTextColor="#8E8E93"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    </View>

                    {/* Sticky Categories */}
                    <FlatList
                        data={categories}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.stickyCategoryContainer}
                                onPress={() => setSelectedCategory(item.name)}
                            >
                                <View style={[
                                    styles.stickyCategoryIcon,
                                    selectedCategory === item.name && styles.selectedStickyCategoryIcon
                                ]}>
                                    <Text style={styles.stickyCategoryEmoji}>{item.icon}</Text>
                                </View>
                                <Text style={[
                                    styles.stickyCategoryText,
                                    selectedCategory === item.name && styles.selectedStickyCategoryText
                                ]}>
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item.name}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.stickyCategoriesContainer}
                        contentContainerStyle={styles.stickyCategoriesContent}
                    />
                </Animated.View>
            )}

            <FlatList
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                data={[1]} // Dummy data to render once
                renderItem={() => (
                    <View>
                        {/* Header with Background Image */}
                        <View style={styles.headerContainer}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
                                style={styles.headerBackgroundImage}
                                resizeMode="cover"
                            />
                            <View style={styles.headerOverlay}>
                                <View style={styles.header}>
                                    <View style={styles.headerLogoContainer}>
                                        <Image
                                            source={require('../../../assets/logo4.png')}
                                            style={styles.headerLogo}
                                            resizeMode="contain"
                                        />
                                    </View>
                                </View>

                                {/* Search Bar */}
                                <View style={styles.searchContainer}>
                                    <Ionicons name="search" size={20} color="#8E8E93" />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Search delicious food..."
                                        placeholderTextColor="#8E8E93"
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                    />
                                    <Animated.View
                                        style={{
                                            transform: [
                                                {
                                                    translateY: searchLogoJumpAnimation.current,
                                                },
                                                {
                                                    rotate: searchLogoShakeAnimation.current.interpolate({
                                                        inputRange: [-5, 5],
                                                        outputRange: ['-5deg', '5deg'],
                                                    }),
                                                },
                                            ],
                                            transformOrigin: 'bottom',
                                        }}
                                    >
                                        <Image
                                            source={require('../../../assets/logo.png')}
                                            style={styles.searchLogo}
                                            resizeMode="contain"
                                        />
                                    </Animated.View>
                                </View>
                            </View>
                        </View>

                        {/* Categories */}
                        <FlatList
                            data={categories}
                            renderItem={renderCategory}
                            keyExtractor={(item) => item.name}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.categoriesContainer}
                            contentContainerStyle={styles.categoriesContent}
                        />

                        {/* Popular Items Section */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Popular items</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAllText}>See All</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Featured Items */}
                        <FlatList
                            data={getPopularItems()}
                            renderItem={renderFeaturedItem}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.featuredListContainer}
                            decelerationRate="fast"
                            snapToInterval={296}
                            snapToAlignment="start"
                        />

                        {/* Delicious Items Section */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Delicious items</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAllText}>See All</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Menu Items */}
                        {filteredItems.map((item) => (
                            <View key={item.id} style={styles.menuItemContainer}>
                                {renderMenuItem({ item })}
                            </View>
                        ))}
                    </View>
                )}
                keyExtractor={() => 'main'}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    stickySearchBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#F8F9FA',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        zIndex: 1000,
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    stickyHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    stickySearchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
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
    stickyLogo: {
        width: 32,
        height: 32,
        marginRight: 4,
    },
    stickySearchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        paddingVertical: 16,
        fontFamily: 'System',
        color: '#1C1C1E',
        fontWeight: '500',
    },
    headerContainer: {
        position: 'relative',
        height: 280,
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
        backgroundColor: 'rgba(0, 0, 0, 0.61)',
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerLogoContainer: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    headerLogo: {
        width: 120,
        height: 50,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        marginLeft: 5,
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '600',
        fontFamily: 'System',
    },
    filterButton: {
        padding: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        marginHorizontal: 20,
        marginTop: 15,
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
    categoriesContainer: {
        marginBottom: 20,
        marginTop: 15,
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
        color: '#FF6B35',
        fontWeight: '600',
        fontFamily: 'System',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
    },
    seeAllText: {
        fontSize: 12,
        color: '#FF6B35',
        fontWeight: '600',
        fontFamily: 'System',
    },
    featuredCard: {
        marginHorizontal: 8,
        marginBottom: 20,
        borderRadius: 20,
        width: 280,
        height: 200,
        overflow: 'hidden',
        position: 'relative',
        elevation: 8,
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    featuredBackgroundImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
    },
    featuredGradientOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        padding: 16,
        justifyContent: 'space-between',
    },
    featuredBadgeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    ratingBadgeText: {
        color: '#1C1C1E',
        fontSize: 11,
        fontWeight: '700',
        marginLeft: 2,
        fontFamily: 'System',
    },
    categoryBadge: {
        backgroundColor: 'rgba(255, 107, 53, 0.9)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryBadgeText: {
        color: '#F9F9F9',
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontFamily: 'System',
    },
    featuredListContainer: {
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    featuredInfoCard: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopRightRadius: 25,
        borderBottomLeftRadius: 20,
        minWidth: 180,
        maxWidth: '75%',
        borderWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
    },
    titlePriceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    featuredCardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        lineHeight: 20,
        flex: 1,
        marginRight: 8,
    },
    priceTag: {
        backgroundColor: '#FF6B35',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    featuredCardPrice: {
        fontSize: 13,
        fontWeight: '800',
        color: '#FFFFFF',
        fontFamily: 'System',
        letterSpacing: -0.3,
    },
    featuredContent: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    featuredTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#F9F9F9',
        marginBottom: 4,
        fontFamily: 'System',
        letterSpacing: -0.3,
    },
    featuredDescription: {
        fontSize: 12,
        color: 'rgba(249, 249, 249, 0.8)',
        marginBottom: 12,
        fontFamily: 'System',
        lineHeight: 16,
    },
    featuredFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceContainer: {
        flex: 1,
    },
    featuredPrice: {
        fontSize: 20,
        fontWeight: '800',
        color: '#F9F9F9',
        fontFamily: 'System',
        letterSpacing: -0.5,
    },
    reviewsText: {
        fontSize: 10,
        color: 'rgba(249, 249, 249, 0.7)',
        fontFamily: 'System',
        marginTop: 2,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    ratingText: {
        color: '#F9F9F9',
        marginLeft: 5,
        fontSize: 12,
        fontFamily: 'System',
        fontWeight: '500',
    },
    addToCartButton: {
        backgroundColor: '#1C1C1E',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#1C1C1E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    addToCartText: {
        color: '#F9F9F9',
        fontWeight: '600',
        fontSize: 12,
        fontFamily: 'System',
    },
    featuredImageContainer: {
        marginLeft: 15,
    },
    featuredImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    featuredImagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 107, 53, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuItemContainer: {
        paddingHorizontal: 20,
        marginBottom: 5,
    },
    menuCard: {
        flexDirection: 'row',
        backgroundColor: '#FAFAFA',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 1,
    },
    menuImageContainer: {
        width: 65,
        height: 65,
        borderRadius: 8,
        marginRight: 12,
        overflow: 'hidden',
    },
    menuImage: {
        width: '100%',
        height: '100%',
    },
    menuImagePlaceholder: {
        width: 65,
        height: 65,
        borderRadius: 8,
        backgroundColor: '#F5F5F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuInfo: {
        flex: 1,
    },
    menuName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 4,
        fontFamily: 'System',
    },
    menuDescription: {
        fontSize: 12,
        color: '#8E8E93',
        marginBottom: 4,
        lineHeight: 16,
        fontFamily: 'System',
    },
    ratingRow: {
        marginBottom: 4,
    },
    menuRatingText: {
        color: '#8E8E93',
        marginLeft: 4,
        fontSize: 10,
        fontFamily: 'System',
        fontWeight: '500',
    },
    menuPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FF6B35',
        fontFamily: 'System',
    },
    addButton: {
        backgroundColor: '#FF6B35',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stickyCategoriesContainer: {
        paddingTop: 15,
        marginBottom: 0,
    },
    stickyCategoriesContent: {
        paddingHorizontal: 20,
    },
    stickyCategoryContainer: {
        alignItems: 'center',
        marginRight: 25,
    },
    stickyCategoryIcon: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#F5F5F7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    selectedStickyCategoryIcon: {
        backgroundColor: '#343435ff',
    },
    stickyCategoryEmoji: {
        fontSize: 16,
    },
    stickyCategoryText: {
        fontSize: 11,
        color: '#8E8E93',
        textAlign: 'center',
        fontWeight: '500',
        fontFamily: 'System',
    },
    selectedStickyCategoryText: {
        color: '#FF6B35',
        fontWeight: '600',
        fontFamily: 'System',
    },
});

export default CustomerHomeScreen;