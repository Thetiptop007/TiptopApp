import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import CustomSplashScreen from './src/components/CustomSplashScreen';

// Keep the native splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function AppContent() {
  console.log('[App.tsx] AppContent rendering');
  const [isAppReady, setIsAppReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(false); // Disabled for testing

  useEffect(() => {
    console.log('[App.tsx] useEffect - Starting prepare');
    async function prepare() {
      try {
        console.log('[App.tsx] Preparing app...');
        // Pre-load fonts, make any API calls you need to do here
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('[App.tsx] Preparation complete');
      } catch (e) {
        console.error('[App.tsx] Error during prepare:', e);
      } finally {
        // Tell the application to render
        console.log('[App.tsx] Setting app ready and hiding splash');
        setIsAppReady(true);
        await SplashScreen.hideAsync();
        console.log('[App.tsx] App is now ready');
      }
    }

    prepare();
  }, []);

  const handleCustomSplashFinish = () => {
    setShowCustomSplash(false);
  };

  if (!isAppReady) {
    console.log('[App.tsx] App not ready yet, returning null');
    return null;
  }

  console.log('[App.tsx] Rendering main app');
  return (
    <>
      <AuthProvider>
        <AppNavigator />
        <StatusBar style="auto" />
        {showCustomSplash && (
          <CustomSplashScreen onFinish={handleCustomSplashFinish} />
        )}
      </AuthProvider>
    </>
  );
}

export default function App() {
  console.log('[App.tsx] ===== APP STARTING =====');
  try {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  } catch (error) {
    console.error('[App.tsx] FATAL ERROR:', error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {String(error)}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
  },
});
