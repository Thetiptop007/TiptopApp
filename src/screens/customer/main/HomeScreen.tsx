import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, NativeScrollEvent, NativeSyntheticEvent, Animated, Easing, Dimensions, UIManager, Platform, InteractionManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSwipeNavigation } from '../../../contexts/SwipeNavigationContext';
import { useCart } from '../../../contexts/CartContext';
import { MenuItem } from '../../../types';
import { menuData, categories, restaurantInfo } from '../../../data/menuData';
import { useTabBar } from '../../../contexts/TabBarContext';

const CustomerHomeScreen: React.FC = () => {
    const { navigateToTab, navigateToOrder } = useSwipeNavigation();
    const { addToCart, cartCount, cartItems, updateQuantity } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showStickySearch, setShowStickySearch] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
    const [itemAnimations, setItemAnimations] = useState<Record<string, Animated.Value>>({});
    const stickySearchAnimation = useRef(new Animated.Value(-150)); // Start off-screen with more buffer
    const searchLogoShakeAnimation = useRef(new Animated.Value(0)); // For logo shake animation
    const searchLogoJumpAnimation = useRef(new Animated.Value(0)); // For logo jump animation
    const searchPressAnimation = useRef(new Animated.Value(1)); // For search press animation
    const stickySearchPressAnimation = useRef(new Animated.Value(1)); // For sticky search press animation
    const slideAnimation = useRef(new Animated.Value(0)); // For screen slide animation
    const screenWidth = Dimensions.get('window').width;
    const { setTabBarVisible } = useTabBar();
    const lastScrollY = useRef(0);
    const scrollThreshold = 10; // Minimum scroll distance to trigger hide/show
    const headerHeight = 220; // Height of the header

    // Enable LayoutAnimation on Android
    useEffect(() => {
        if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }, []);

    // Custom navigation function with smooth right-to-left slide animation
    const navigateToMenu = () => {
        // Add a press animation first
        Animated.spring(searchPressAnimation.current, {
            toValue: 0.95,
            useNativeDriver: true,
            tension: 100,
            friction: 3,
        }).start(() => {
            Animated.spring(searchPressAnimation.current, {
                toValue: 1,
                useNativeDriver: true,
                tension: 100,
                friction: 3,
            }).start();
        });

        // Small delay for smooth transition feel
        InteractionManager.runAfterInteractions(() => {
            setTimeout(() => {
                navigateToTab('Menu', {
                    searchQuery: searchQuery,
                    fromSearch: true
                });
            }, 150);
        });
    };    // Search press animation
    const handleSearchPressIn = () => {
        Animated.spring(searchPressAnimation.current, {
            toValue: 0.98,
            useNativeDriver: true,
            tension: 300,
            friction: 20,
        }).start();
    };

    const handleSearchPressOut = () => {
        Animated.spring(searchPressAnimation.current, {
            toValue: 1,
            useNativeDriver: true,
            tension: 300,
            friction: 20,
        }).start();
    };

    // Sticky search press animation
    const handleStickySearchPressIn = () => {
        Animated.spring(stickySearchPressAnimation.current, {
            toValue: 0.98,
            useNativeDriver: true,
            tension: 300,
            friction: 20,
        }).start();
    };

    const handleStickySearchPressOut = () => {
        Animated.spring(stickySearchPressAnimation.current, {
            toValue: 1,
            useNativeDriver: true,
            tension: 300,
            friction: 20,
        }).start();
    };

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

    const handleAddToCart = (item: MenuItem) => {
        addToCart(item);
    };

    // Get quantity for an item from cart
    const getItemQuantity = (itemId: string): number => {
        const cartItem = cartItems.find(item => item.menuItem.id === itemId);
        return cartItem ? cartItem.quantity : 0;
    };

    // Get or create animation value for an item (optimized)
    const getItemAnimation = (itemId: string): Animated.Value => {
        if (!itemAnimations[itemId]) {
            // Return a static value instead of creating new ones during render
            const quantity = getItemQuantity(itemId);
            return new Animated.Value(quantity > 0 ? 1 : 0);
        }
        return itemAnimations[itemId];
    };

    // Ultra-fast add button with immediate response
    const handleAddButtonPress = (item: MenuItem) => {
        const quantity = getItemQuantity(item.id);

        if (quantity === 0) {
            // IMMEDIATE cart update - no delay
            addToCart(item);

            // IMMEDIATE state update - user sees change instantly
            setExpandedItems(prev => ({ ...prev, [item.id]: true }));

            // Simple fade-in animation (optional and non-blocking)
            const newAnimation = new Animated.Value(0);
            setItemAnimations(prev => ({ ...prev, [item.id]: newAnimation }));

            // Very fast animation that doesn't block UI
            Animated.timing(newAnimation, {
                toValue: 1,
                duration: 150, // Much faster
                useNativeDriver: true,
                easing: Easing.out(Easing.quad),
            }).start();
        }
    };

    // Ultra-responsive quantity change with zero delay
    const handleQuantityChange = (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            // INSTANT cart update - user sees result immediately
            updateQuantity(itemId, 0);
            setExpandedItems(prev => ({ ...prev, [itemId]: false }));

            // Clean up animation immediately
            setItemAnimations(prev => {
                const newAnimations = { ...prev };
                delete newAnimations[itemId];
                return newAnimations;
            });
        } else {
            // INSTANT quantity update - no delay
            updateQuantity(itemId, newQuantity);
        }
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
                    <TouchableOpacity
                        style={styles.addToCartButton}
                        onPress={() => handleAddToCart(item)}
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

    const renderMenuItem = React.useCallback(({ item }: { item: MenuItem }) => {
        const quantity = getItemQuantity(item.id);
        const isExpanded = quantity > 0; // Simplified check
        const animation = itemAnimations[item.id] || new Animated.Value(isExpanded ? 1 : 0);

        return (
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
                    <View style={styles.homePricePortionContainer}>
                        <Text style={styles.menuPrice}>₹{item.price.toFixed(0)}</Text>
                        {item.portion && (
                            <View style={styles.homePortionBadge}>
                                <Text style={styles.homePortionText}>{item.portion}</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    {!isExpanded ? (
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => handleAddButtonPress(item)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="add" size={20} color="#F9F9F9" />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.quantityControlsContainer}>
                            <View style={styles.homeQuantityControls}>
                                <TouchableOpacity
                                    style={styles.homeQuantityButton}
                                    onPress={() => handleQuantityChange(item.id, quantity - 1)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="remove" size={14} color="#e36057ff" />
                                </TouchableOpacity>

                                <Text style={styles.homeQuantity}>{quantity}</Text>

                                <TouchableOpacity
                                    style={styles.homeQuantityButton}
                                    onPress={() => handleQuantityChange(item.id, quantity + 1)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="add" size={14} color="#e36057ff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        );
    }, [cartItems]); // Simplified dependencies

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
                        <Animated.View
                            style={{
                                transform: [{ scale: stickySearchPressAnimation.current }],
                                flex: 1,
                            }}
                        >
                            <TouchableOpacity
                                style={styles.stickySearchContainer}
                                activeOpacity={0.9}
                                onPress={navigateToMenu}
                                onPressIn={handleStickySearchPressIn}
                                onPressOut={handleStickySearchPressOut}
                            >
                                <Ionicons name="search" size={20} color="#8E8E93" />
                                <View style={styles.stickySearchInput}>
                                    <Text style={styles.stickySearchPlaceholder}>Search delicious food...</Text>
                                </View>
                                <Image
                                    source={require('../../../../assets/logo.png')}
                                    style={styles.stickyLogo}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Sticky Cart Icon */}
                        <TouchableOpacity
                            style={styles.stickyCartButton}
                            onPress={() => navigateToOrder('Cart')}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="bag-outline" size={24} color="#1C1C1E" />
                            {cartCount > 0 && (
                                <View style={styles.cartBadge}>
                                    <Text style={styles.cartBadgeText}>
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
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
                        scrollEnabled={true}
                        nestedScrollEnabled={true}
                        keyboardShouldPersistTaps="handled"
                    />
                </Animated.View>
            )}

            <FlatList
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                data={[1]} // Dummy data to render once
                scrollEnabled={true}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
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
                                            source={require('../../../../assets/logo-full.png')}
                                            style={styles.headerLogo}
                                            resizeMode="contain"
                                        />
                                    </View>

                                    {/* Cart Icon */}
                                    <TouchableOpacity
                                        style={styles.cartButton}
                                        onPress={() => navigateToOrder('Cart')}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="bag-outline" size={24} color="#FFFFFF" />
                                        {cartCount > 0 && (
                                            <View style={styles.cartBadge}>
                                                <Text style={styles.cartBadgeText}>
                                                    {cartCount > 99 ? '99+' : cartCount}
                                                </Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </View>

                                {/* Search Bar */}
                                <Animated.View
                                    style={{
                                        transform: [{ scale: searchPressAnimation.current }],
                                    }}
                                >
                                    <TouchableOpacity
                                        style={styles.searchContainer}
                                        activeOpacity={0.9}
                                        onPress={navigateToMenu}
                                        onPressIn={handleSearchPressIn}
                                        onPressOut={handleSearchPressOut}
                                    >
                                        <Ionicons name="search" size={20} color="#8E8E93" />
                                        <View style={styles.searchInput}>
                                            <Text style={styles.searchPlaceholder}>Search delicious food...</Text>
                                        </View>
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
                                                source={require('../../../../assets/logo.png')}
                                                style={styles.searchLogo}
                                                resizeMode="contain"
                                            />
                                        </Animated.View>
                                    </TouchableOpacity>
                                </Animated.View>
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
                            scrollEnabled={true}
                            nestedScrollEnabled={true}
                            keyboardShouldPersistTaps="handled"
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
                            scrollEnabled={true}
                            nestedScrollEnabled={true}
                            keyboardShouldPersistTaps="handled"
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
    innerContainer: {
        flex: 1,
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
        justifyContent: 'center',
    },
    stickySearchPlaceholder: {
        fontSize: 15,
        color: '#8E8E93',
        fontFamily: 'System',
        fontWeight: '500',
    },
    stickyCartButton: {
        position: 'relative',
        padding: 8,
        marginLeft: 12,
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
        justifyContent: 'space-between',
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
        justifyContent: 'center',
    },
    searchPlaceholder: {
        fontSize: 15,
        color: '#8E8E93',
        fontFamily: 'System',
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
        color: '#e36057ff',
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
        backgroundColor: '#e36057ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        shadowColor: '#e36057ff',
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
        padding: 16,
        borderRadius: 12,
        alignItems: 'flex-start', // Changed to flex-start to align image to top
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 1,
        minHeight: 85,
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
    buttonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
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
        marginBottom: 2,
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
        color: '#e36057ff',
        fontFamily: 'System',
    },
    addButton: {
        backgroundColor: '#e36057ff',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#e36057ff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
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
        color: '#e36057ff',
        fontWeight: '600',
        fontFamily: 'System',
    },
    quantityControlsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    homeQuantityControls: {
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: '#E5E5E7',
    },
    homeQuantityButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        marginVertical: 3,
    },
    homeQuantity: {
        paddingVertical: 6,
        paddingHorizontal: 2,
        fontSize: 14,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        textAlign: 'center',
        minWidth: 24,
    },
    // Price and portion styles for HomeScreen
    homePricePortionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    homePortionBadge: {
        backgroundColor: '#F0F8FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e36057ff',
    },
    homePortionText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#e36057ff',
        fontFamily: 'System',
    },
});

export default CustomerHomeScreen;