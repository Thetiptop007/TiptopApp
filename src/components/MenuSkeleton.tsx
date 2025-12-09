/**
 * Menu Item Skeleton Loader
 * Optimized loading placeholders for menu items
 */

import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface MenuSkeletonProps {
  count?: number;
  viewMode?: 'list' | 'grid';
}

export const MenuItemSkeleton: React.FC<{ viewMode: 'list' | 'grid' }> = ({ viewMode }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  if (viewMode === 'grid') {
    return (
      <View style={styles.gridCard}>
        <Animated.View style={[styles.gridImage, { opacity }]} />
        <View style={styles.gridInfo}>
          <Animated.View style={[styles.gridTitle, { opacity }]} />
          <Animated.View style={[styles.gridDesc, { opacity }]} />
          <Animated.View style={[styles.gridPrice, { opacity }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.listCard}>
      <Animated.View style={[styles.listImage, { opacity }]} />
      <View style={styles.listInfo}>
        <Animated.View style={[styles.listTitle, { opacity }]} />
        <Animated.View style={[styles.listDesc, { opacity }]} />
        <Animated.View style={[styles.listPrice, { opacity }]} />
      </View>
    </View>
  );
};

export const MenuSkeleton: React.FC<MenuSkeletonProps> = ({ count = 6, viewMode = 'list' }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <MenuItemSkeleton key={index} viewMode={viewMode} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  // List view styles
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#2C2C2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  listImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E5E7',
  },
  listInfo: {
    padding: 15,
  },
  listTitle: {
    height: 20,
    backgroundColor: '#E5E5E7',
    borderRadius: 4,
    marginBottom: 8,
    width: '60%',
  },
  listDesc: {
    height: 14,
    backgroundColor: '#E5E5E7',
    borderRadius: 4,
    marginBottom: 6,
    width: '90%',
  },
  listPrice: {
    height: 18,
    backgroundColor: '#E5E5E7',
    borderRadius: 4,
    width: '30%',
    marginTop: 8,
  },
  // Grid view styles
  gridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 15,
    width: '48%',
    overflow: 'hidden',
    shadowColor: '#2C2C2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  gridImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#E5E5E7',
  },
  gridInfo: {
    padding: 12,
  },
  gridTitle: {
    height: 16,
    backgroundColor: '#E5E5E7',
    borderRadius: 4,
    marginBottom: 6,
    width: '80%',
  },
  gridDesc: {
    height: 12,
    backgroundColor: '#E5E5E7',
    borderRadius: 4,
    marginBottom: 6,
    width: '100%',
  },
  gridPrice: {
    height: 16,
    backgroundColor: '#E5E5E7',
    borderRadius: 4,
    width: '50%',
    marginTop: 4,
  },
});

export default MenuSkeleton;
