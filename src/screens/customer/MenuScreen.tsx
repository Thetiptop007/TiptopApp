import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, NativeScrollEvent, NativeSyntheticEvent, Animated, Easing, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSwipeNavigation } from '../../contexts/SwipeNavigationContext';
import { MenuItem } from '../../types';
import { menuData, categories, restaurantInfo } from '../../data/menuData';
import { useTabBar } from '../../contexts/TabBarContext';

const CustomerMenuScreen: React.FC = () => {
    const { getTabParams } = useSwipeNavigation();
    const params = getTabParams('Menu');
    const searchInputRef = useRef<TextInput>(null);
    const mainSearchInputRef = useRef<TextInput>(null);
    const [searchQuery, setSearchQuery] = useState(params?.searchQuery || '');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showStickyHeader, setShowStickyHeader] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [cartItemCount, setCartItemCount] = useState(0); // Cart item count state
    const stickyHeaderAnimation = useRef(new Animated.Value(-150));
    const searchLogoShakeAnimation = useRef(new Animated.Value(0)); // For logo shake animation
    const searchLogoJumpAnimation = useRef(new Animated.Value(0)); // For logo jump animation
    const slideInAnimation = useRef(new Animated.Value(Dimensions.get('window').width)); // Start off-screen to the right
    const { setTabBarVisible } = useTabBar();
    const lastScrollY = useRef(0);
    const scrollThreshold = 10;
    const headerHeight = 180;

    // Auto-focus search input when navigated from HomeScreen
    useEffect(() => {
        if (params?.fromSearch) {
            // Start slide-in animation
            Animated.timing(slideInAnimation.current, {
                toValue: 0,
                duration: 300,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start();

            // Focus search input after animation
            setTimeout(() => {
                if (showStickyHeader && searchInputRef.current) {
                    searchInputRef.current.focus();
                } else if (mainSearchInputRef.current) {
                    mainSearchInputRef.current.focus();
                }
            }, 350);
        } else {
            // If not from search, start with screen in normal position
            slideInAnimation.current.setValue(0);
        }
    }, [params?.fromSearch, showStickyHeader]);

    // Smooth animation effect
    useEffect(() => {
        Animated.timing(stickyHeaderAnimation.current, {
            toValue: showStickyHeader ? 0 : -150,
            duration: 300,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
            useNativeDriver: true,
        }).start();
    }, [showStickyHeader]);

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

    const menuItems: MenuItem[] = menuData;

    const filteredAndSortedItems = menuItems
        .filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
            return matchesSearch && matchesCategory && item.available;
        });

    const addToCart = (item: MenuItem) => {
        console.log('Added to cart:', item.name);
        setCartItemCount(prev => prev + 1); // Increment cart count
        // Add haptic feedback or toast notification here
    };

    const toggleFavorite = (item: MenuItem) => {
        console.log('Toggle favorite:', item.name);
        // Add favorite logic here
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const scrollDifference = currentScrollY - lastScrollY.current;

        // Show sticky header when scrolled past main header
        if (currentScrollY > headerHeight) {
            if (!showStickyHeader) {
                setShowStickyHeader(true);
                // Auto-focus sticky search if user was navigated from HomeScreen and main search was focused
                if (params?.fromSearch) {
                    setTimeout(() => {
                        searchInputRef.current?.focus();
                    }, 350); // Wait for sticky header animation
                }
            }
        } else {
            if (showStickyHeader) {
                setShowStickyHeader(false);
                // Re-focus main search if user was navigated from HomeScreen
                if (params?.fromSearch) {
                    setTimeout(() => {
                        mainSearchInputRef.current?.focus();
                    }, 100);
                }
            }
        }

        // Tab bar visibility logic
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

    const renderCategory = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.categoryContainer}
            onPress={() => setSelectedCategory(item.name)}
            activeOpacity={0.7}
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

    const renderListItem = ({ item }: { item: MenuItem }) => (
        <View style={styles.listCard}>
            <View style={styles.listImageContainer}>
                {item.image ? (
                    <Image
                        source={{ uri: item.image }}
                        style={styles.listImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.listImagePlaceholder}>
                        <Ionicons name="restaurant" size={40} color="#8E8E93" />
                    </View>
                )}
                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(item)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="heart-outline" size={16} color="#e36057ff" />
                </TouchableOpacity>
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={10} color="#1C1C1E" />
                    <Text style={styles.ratingBadgeText}>{item.rating}</Text>
                </View>
            </View>
            <View style={styles.listInfo}>
                <View style={styles.listHeader}>
                    <Text style={styles.listName} numberOfLines={1}>{item.name}</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => addToCart(item)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.listDescription} numberOfLines={2}>{item.description}</Text>
                <View style={styles.listFooter}>
                    <Text style={styles.listPrice}>₹{item.price}</Text>
                    <Text style={styles.reviewsText}>({item.reviews} reviews)</Text>
                </View>
            </View>
        </View>
    );

    const renderGridItem = ({ item }: { item: MenuItem }) => (
        <View style={styles.gridCard}>
            <View style={styles.gridImageContainer}>
                {item.image ? (
                    <Image
                        source={{ uri: item.image }}
                        style={styles.gridImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.gridImagePlaceholder}>
                        <Ionicons name="restaurant" size={40} color="#8E8E93" />
                    </View>
                )}
                <TouchableOpacity
                    style={styles.gridFavoriteButton}
                    onPress={() => toggleFavorite(item)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="heart-outline" size={14} color="#e36057ff" />
                </TouchableOpacity>
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={10} color="#1C1C1E" />
                    <Text style={styles.ratingBadgeText}>{item.rating}</Text>
                </View>
            </View>
            <View style={styles.gridInfo}>
                <Text style={styles.gridName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.gridDescription} numberOfLines={2}>{item.description}</Text>
                <View style={styles.gridFooter}>
                    <Text style={styles.gridPrice}>₹{item.price}</Text>
                    <TouchableOpacity
                        style={styles.gridAddButton}
                        onPress={() => addToCart(item)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <Animated.View style={[
            styles.container,
            {
                transform: [{ translateX: slideInAnimation.current }]
            }
        ]}>
            <View style={styles.innerContainer}>
                {/* Animated Sticky Header */}
                {showStickyHeader && (
                    <Animated.View
                        style={[
                            styles.stickyHeader,
                            {
                                transform: [{ translateY: stickyHeaderAnimation.current }]
                            }
                        ]}
                    >
                        <View style={styles.stickyHeaderRow}>
                            <View style={styles.stickySearchContainer}>
                                <Ionicons name="search" size={20} color="#8E8E93" />
                                <TextInput
                                    ref={searchInputRef}
                                    style={styles.stickySearchInput}
                                    placeholder="Search delicious food..."
                                    placeholderTextColor="#8E8E93"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                                <Image
                                    source={require('../../../assets/logo.png')}
                                    style={styles.stickyLogo}
                                    resizeMode="contain"
                                />
                            </View>

                            {/* Sticky Cart Icon */}
                            <TouchableOpacity style={styles.stickyCartButton} activeOpacity={0.7}>
                                <Ionicons name="bag-outline" size={24} color="#1C1C1E" />
                                {cartItemCount > 0 && (
                                    <View style={styles.cartBadge}>
                                        <Text style={styles.cartBadgeText}>
                                            {cartItemCount > 99 ? '99+' : cartItemCount}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                )}

                <FlatList
                    showsVerticalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    data={[1]}
                    renderItem={() => (
                        <View>
                            {/* Menu Title */}
                            <View style={styles.titleContainer}>
                                <Text style={styles.menuTitle}>Our Menu</Text>

                                {/* Cart Icon */}
                                <TouchableOpacity style={styles.cartButton} activeOpacity={0.7}>
                                    <Ionicons name="bag-outline" size={24} color="#1C1C1E" />
                                    {cartItemCount > 0 && (
                                        <View style={styles.cartBadge}>
                                            <Text style={styles.cartBadgeText}>
                                                {cartItemCount > 99 ? '99+' : cartItemCount}
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Search Bar */}
                            <View style={styles.searchContainer}>
                                <Ionicons name="search" size={20} color="#8E8E93" />
                                <TextInput
                                    ref={mainSearchInputRef}
                                    style={styles.searchInput}
                                    placeholder="Search delicious food..."
                                    placeholderTextColor="#8E8E93"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                                <Animated.Image
                                    source={require('../../../assets/logo.png')}
                                    style={[
                                        styles.searchLogo,
                                        {
                                            transform: [
                                                {
                                                    rotate: searchLogoShakeAnimation.current.interpolate({
                                                        inputRange: [-5, 5],
                                                        outputRange: ['-5deg', '5deg']
                                                    })
                                                },
                                                { translateY: searchLogoJumpAnimation.current }
                                            ]
                                        }
                                    ]}
                                    resizeMode="contain"
                                />
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

                            {/* Menu Items */}
                            <View style={styles.menuContainer}>
                                {filteredAndSortedItems.length > 0 ? (
                                    viewMode === 'list' ? (
                                        <FlatList
                                            data={filteredAndSortedItems}
                                            renderItem={renderListItem}
                                            keyExtractor={(item) => item.id}
                                            scrollEnabled={false}
                                            showsVerticalScrollIndicator={false}
                                            contentContainerStyle={styles.listContainer}
                                        />
                                    ) : (
                                        <FlatList
                                            data={filteredAndSortedItems}
                                            renderItem={renderGridItem}
                                            keyExtractor={(item) => item.id}
                                            numColumns={2}
                                            scrollEnabled={false}
                                            showsVerticalScrollIndicator={false}
                                            contentContainerStyle={styles.gridContainer}
                                            columnWrapperStyle={styles.gridRow}
                                        />
                                    )
                                ) : (
                                    <View style={styles.emptyContainer}>
                                        <Ionicons name="restaurant-outline" size={64} color="#8E8E93" />
                                        <Text style={styles.emptyTitle}>No items found</Text>
                                        <Text style={styles.emptySubtitle}>
                                            Try adjusting your search or category filter
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}
                    keyExtractor={() => 'menu'}
                />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    innerContainer: {
        flex: 1,
    },
    stickyHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#F8F9FA',
        paddingTop: 50,
        paddingBottom: 15,
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
        width: 30,
        height: 30,
        marginLeft: 8,
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
    stickyCartButton: {
        position: 'relative',
        padding: 8,
        marginLeft: 12,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 15,
    },
    menuTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        textAlign: 'left',
    },
    cartButton: {
        position: 'relative',
        padding: 8,
    },
    cartBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: '#e36057ff',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    cartBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        fontFamily: 'System',
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
        color: '#e36057ff',
        fontWeight: '600',
        fontFamily: 'System',
    },
    menuContainer: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    listContainer: {
        paddingBottom: 20,
    },
    listCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        marginBottom: 15,
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    listImageContainer: {
        position: 'relative',
        height: 180,
        width: '100%',
    },
    listImage: {
        width: '100%',
        height: '100%',
    },
    listImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F5F5F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    listInfo: {
        padding: 15,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    listName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        flex: 1,
        marginRight: 10,
    },
    priceContainer: {
        backgroundColor: '#e36057ff',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    listPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#e36057ff',
        fontFamily: 'System',
    },
    listDescription: {
        fontSize: 12,
        color: '#8E8E93',
        lineHeight: 16,
        fontFamily: 'System',
        marginBottom: 12,
    },
    listFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1C1C1E',
        marginLeft: 4,
        fontFamily: 'System',
    },
    reviewsText: {
        fontSize: 12,
        color: '#8E8E93',
        fontFamily: 'System',
    },
    addButton: {
        backgroundColor: '#e36057ff',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridContainer: {
        paddingBottom: 20,
    },
    gridRow: {
        justifyContent: 'space-between',
    },
    gridCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        marginBottom: 15,
        width: '48%',
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    gridImageContainer: {
        position: 'relative',
        height: 120,
    },
    gridImage: {
        width: '100%',
        height: '100%',
    },
    gridImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F5F5F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridFavoriteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    ratingBadge: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 8,
    },
    ratingBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#1C1C1E',
        marginLeft: 2,
        fontFamily: 'System',
    },
    gridInfo: {
        padding: 12,
    },
    gridName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        marginBottom: 4,
    },
    gridDescription: {
        fontSize: 12,
        color: '#8E8E93',
        lineHeight: 16,
        fontFamily: 'System',
        marginBottom: 8,
    },
    gridFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    gridPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#e36057ff',
        fontFamily: 'System',
    },
    gridAddButton: {
        backgroundColor: '#e36057ff',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 12,
        color: '#8E8E93',
        fontFamily: 'System',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});

export default CustomerMenuScreen;
