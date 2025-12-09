/**
 * Optimized Customer Menu Screen
 * Features:
 * - Backend integration with caching
 * - Debounced search
 * - Optimized rendering with React.memo
 * - FlatList optimization
 * - Pull-to-refresh
 * - Pagination
 * - Error handling with retry
 * - Loading skeletons
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Animated,
  Easing,
  Dimensions,
  Modal,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSwipeNavigation } from '../../../contexts/SwipeNavigationContext';
import { useCart } from '../../../contexts/CartContext';
import { MenuItem, PortionSize } from '../../../types';
import { useTabBar } from '../../../contexts/TabBarContext';
import ItemDetailScreen from './ItemDetailScreen';
import { useMenu } from '../../../hooks/useMenu';
import { useDebounce } from '../../../hooks/useDebounce';
import { adaptBackendMenuItems } from '../../../utils/menuAdapter';
import MenuSkeleton from '../../../components/MenuSkeleton';
import { fuzzySearchItems } from '../../../utils/fuzzySearch';
import { menuAPI } from '../../../api/menu.api';

// Optimized category item with React.memo
const CategoryItem = React.memo(({
  item,
  isSelected,
  onPress,
}: {
  item: { name: string; icon: string };
  isSelected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.categoryContainer}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[
      styles.categoryIcon,
      isSelected && styles.selectedCategoryIcon
    ]}>
      <Text style={styles.categoryEmoji}>{item.icon}</Text>
    </View>
    <Text style={[
      styles.categoryText,
      isSelected && styles.selectedCategoryText
    ]}>
      {item.name}
    </Text>
  </TouchableOpacity>
));

// Optimized menu item with React.memo
const MenuListItem = React.memo(({
  item,
  quantity,
  onPress,
  onUpdateQuantity,
}: {
  item: MenuItem;
  quantity: number;
  onPress: () => void;
  onUpdateQuantity: (newQty: number) => void;
}) => {
  return (
    <TouchableOpacity
      style={styles.listCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
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
      </View>
      <View style={styles.listInfo}>
        <Text style={styles.listName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.listDescription} numberOfLines={2}>{item.description}</Text>
        
        {/* Show available portions if there are price variants */}
        {item.priceVariants && item.priceVariants.length > 0 && (
          <Text style={styles.portionInfo} numberOfLines={1}>
            Available in{' '}
            {item.priceVariants.map((variant, index) => (
              <Text key={variant.quantity}>
                <Text style={styles.portionHighlight}>{variant.quantity}</Text>
                {index < item.priceVariants!.length - 1 ? ', ' : ''}
              </Text>
            ))}
          </Text>
        )}
        
        <View style={styles.listFooter}>
          <View style={styles.priceContainer}>
            {/* Show lowest price from variants */}
            {item.priceVariants && item.priceVariants.length > 0 ? (
              <>
                <Text style={styles.listPrice}>
                  ₹{Math.min(...item.priceVariants.map(v => v.price)).toFixed(0)}
                </Text>
                <Text style={styles.startsFromText}>onwards</Text>
              </>
            ) : (
              <Text style={styles.listPrice}>₹{item.price?.toFixed(0) || '0'}</Text>
            )}
          </View>
          
          {quantity > 0 && (
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onUpdateQuantity(quantity - 1);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={16} color="#e36057ff" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onUpdateQuantity(quantity + 1);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={16} color="#e36057ff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const CustomerMenuScreen: React.FC = () => {
  const { getTabParams, navigateToOrder } = useSwipeNavigation();
  const { addToCart, cartCount, cartItems, updateQuantity, getItemQuantity } = useCart();
  const params = getTabParams('Menu');
  const { setTabBarVisible } = useTabBar();

  // Menu data hook
  const {
    items: backendItems,
    categories: backendCategories,
    loading,
    refreshing,
    loadingMore,
    error,
    loadMore,
    refresh,
    setCategory,
    setSearch,
    retryFetch,
  } = useMenu();

  // Local state
  const [searchQuery, setSearchQuery] = useState(params?.searchQuery || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Refs
  const searchInputRef = useRef<TextInput>(null);
  const mainSearchInputRef = useRef<TextInput>(null);
  const stickyHeaderAnimation = useRef(new Animated.Value(-150));
  const searchLogoShakeAnimation = useRef(new Animated.Value(0));
  const searchLogoJumpAnimation = useRef(new Animated.Value(0));
  const slideInAnimation = useRef(new Animated.Value(params?.fromSearch ? Dimensions.get('window').width : 0));
  const lastScrollY = useRef(0);
  const scrollThreshold = 10;
  const headerHeight = 180;

  // Debounced search for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  // Send search query to backend
  useEffect(() => {
    setSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, setSearch]);

  // Convert backend items to app format
  const menuItems = useMemo(() => 
    adaptBackendMenuItems(backendItems),
    [backendItems]
  );

  // Create categories with icons - using backend categories from database
  const categories = useMemo(() => {
    const categoryIcons: Record<string, string> = {
      'All': '🍽️',
      'Appetizers': '🥗',
      'Starters': '🥟',
      'Main Course': '🍛',
      'Mains': '🍜',
      'Desserts': '🍰',
      'Dessert': '🧁',
      'Beverages': '🥤',
      'Drinks': '☕',
      'Pizza': '🍕',
      'Burger': '🍔',
      'Burgers': '🍔',
      'Chinese': '🥡',
      'Indian': '🍛',
      'Continental': '🍽️',
      'Italian': '🍝',
      'Mexican': '🌮',
      'Thai': '🍜',
      'Japanese': '🍱',
      'Korean': '🍲',
      'Biryani': '🍚',
      'Rolls': '🌯',
      'Wraps': '🌯',
      'Sandwiches': '🥪',
      'Salads': '🥗',
      'Soups': '🍲',
      'Breads': '🥖',
      'Sides': '🍟',
      'Combos': '🍱',
      'Specials': '⭐',
    };

    // Filter out null/undefined and map categories from database
    const mappedCategories = backendCategories
      .filter(cat => cat && cat.trim() !== '')
      .map(cat => ({
        name: cat,
        icon: categoryIcons[cat] || '🍽️',
      }));
    
    return mappedCategories;
  }, [backendCategories]);

  // Auto-focus search input when navigated from HomeScreen
  useEffect(() => {
    if (params?.fromSearch) {
      Animated.timing(slideInAnimation.current, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        const inputRef = showStickyHeader ? searchInputRef : mainSearchInputRef;
        inputRef.current?.focus();
      }, 350);
    }
  }, [params?.fromSearch, showStickyHeader]);

  // Sticky header animation
  useEffect(() => {
    Animated.timing(stickyHeaderAnimation.current, {
      toValue: showStickyHeader ? 0 : -150,
      duration: 300,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      useNativeDriver: true,
    }).start();
  }, [showStickyHeader]);

  // Logo animation
  useEffect(() => {
    const startLogoAnimation = () => {
      Animated.parallel([
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
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(searchLogoJumpAnimation.current, {
            toValue: -8,
            duration: 150,
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

    startLogoAnimation();
    const interval = setInterval(startLogoAnimation, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle category change
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setCategory(category);
  }, [setCategory]);

  // Handle quantity update
  const handleQuantityUpdate = useCallback((itemId: string, newQuantity: number) => {
    updateQuantity(itemId, newQuantity);
  }, [updateQuantity]);

  // Handle scroll
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDifference = currentScrollY - lastScrollY.current;

    if (currentScrollY > headerHeight) {
      if (!showStickyHeader) {
        setShowStickyHeader(true);
      }
    } else {
      if (showStickyHeader) {
        setShowStickyHeader(false);
      }
    }

    if (currentScrollY <= 50) {
      setTabBarVisible(true);
      lastScrollY.current = currentScrollY;
      return;
    }

    if (Math.abs(scrollDifference) > scrollThreshold) {
      setTabBarVisible(scrollDifference < 0);
      lastScrollY.current = currentScrollY;
    }
  }, [showStickyHeader, setTabBarVisible]);

  // Render category item
  const renderCategory = useCallback(({ item }: { item: { name: string; icon: string } }) => (
    <CategoryItem
      item={item}
      isSelected={selectedCategory === item.name}
      onPress={() => handleCategoryChange(item.name)}
    />
  ), [selectedCategory, handleCategoryChange]);

  // Render menu item
  const renderMenuItem = useCallback(({ item }: { item: MenuItem }) => {
    // Sum up all portions of this item in cart (for display only)
    const totalQuantity = cartItems
      .filter(ci => ci.menuItem.id === item.id)
      .reduce((sum, ci) => sum + ci.quantity, 0);
    
    return (
      <MenuListItem
        item={item}
        quantity={totalQuantity}
        onPress={() => setSelectedItem(item)}
        // For items with multiple portions, clicking +/- should open detail screen
        // For single portion items, directly update quantity
        onUpdateQuantity={(newQty) => {
          if (item.priceVariants && item.priceVariants.length > 1) {
            // Multiple portions - open detail screen to let user choose
            setSelectedItem(item);
          } else {
            // Single portion - direct update
            const portion = item.priceVariants?.[0]?.quantity || (item.portion as PortionSize);
            updateQuantity(item.id, newQty, portion);
          }
        }}
      />
    );
  }, [cartItems, updateQuantity]);

  // Item separator
  const ItemSeparator = useCallback(() => <View style={{ height: 0 }} />, []);

  // List footer (loading more indicator)
  const ListFooterComponent = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color="#e36057ff" />
        <Text style={styles.loadingMoreText}>Loading more...</Text>
      </View>
    );
  }, [loadingMore]);

  // Empty list component
  const ListEmptyComponent = useCallback(() => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="restaurant-outline" size={64} color="#8E8E93" />
        <Text style={styles.emptyTitle}>No items found</Text>
        <Text style={styles.emptySubtitle}>
          Try adjusting your search or category filter
        </Text>
      </View>
    );
  }, [loading]);

  // Error state
  if (error && !refreshing && menuItems.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#e36057ff" />
        <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={retryFetch}
          activeOpacity={0.7}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View style={[
      styles.container,
      { transform: [{ translateX: slideInAnimation.current }] }
    ]}>
      {/* Sticky Header */}
      {showStickyHeader && (
        <Animated.View
          style={[
            styles.stickyHeader,
            { transform: [{ translateY: stickyHeaderAnimation.current }] }
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
                source={require('../../../../assets/logo.png')}
                style={styles.stickyLogo}
                resizeMode="contain"
              />
            </View>
            <TouchableOpacity
              style={styles.cartButton}
              activeOpacity={0.7}
              onPress={() => navigateToOrder('Cart')}
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
        </Animated.View>
      )}

      <FlatList
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#e36057ff"
            colors={['#e36057ff']}
          />
        }
        ListHeaderComponent={
          <>
            {/* Title and Cart */}
            <View style={styles.titleContainer}>
              <Text style={styles.menuTitle}>Our Menu</Text>
              <TouchableOpacity
                style={styles.cartButton}
                activeOpacity={0.7}
                onPress={() => navigateToOrder('Cart')}
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
                source={require('../../../../assets/logo.png')}
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
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              style={styles.categoriesContainer}
              contentContainerStyle={styles.categoriesContent}
            >
              {categories.map((item) => (
                <View key={item.name}>
                  {renderCategory({ item })}
                </View>
              ))}
            </ScrollView>

            {/* Loading Skeleton */}
            {loading && menuItems.length === 0 && (
              <MenuSkeleton count={4} viewMode="list" />
            )}
          </>
        }
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={ItemSeparator}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
        contentContainerStyle={styles.listContent}
      />

      {/* Item Detail Modal */}
      <Modal
        visible={selectedItem !== null}
        animationType="fade"
        presentationStyle="fullScreen"
        onRequestClose={() => setSelectedItem(null)}
      >
        {selectedItem && (
          <ItemDetailScreen
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onSelectItem={(item) => setSelectedItem(item)}
          />
        )}
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    marginRight: 12,
  },
  stickySearchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    paddingVertical: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  stickyLogo: {
    width: 30,
    height: 30,
    marginLeft: 8,
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
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    paddingVertical: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  searchLogo: {
    width: 30,
    height: 30,
    marginLeft: 10,
  },
  categoriesContainer: {
    marginBottom: 20,
    flexGrow: 0,
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
    marginTop: 2,
  },
  selectedCategoryText: {
    color: '#e36057ff',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 100,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 15,
    marginHorizontal: 20,
    shadowColor: '#2C2C2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  listImageContainer: {
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
  listInfo: {
    padding: 15,
  },
  listName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  listDescription: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 16,
    marginBottom: 8,
  },
  portionInfo: {
    fontSize: 11,
    color: '#6C6C70',
    lineHeight: 14,
    marginBottom: 10,
  },
  portionHighlight: {
    fontWeight: '600',
    color: '#1C1C1E',
  },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e36057ff',
  },
  startsFromText: {
    fontSize: 10,
    color: '#8E8E93',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  portionText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8E8E93',
    marginLeft: 6,
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2C2C2E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quantityText: {
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
    minWidth: 24,
    textAlign: 'center',
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingMoreText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#8E8E93',
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 20,
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#e36057ff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomerMenuScreen;
