import { useEffect } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';

export default function StartScreen() {
  useEffect(() => {
    // Simulate a splash screen by navigating to the auth screen after a short delay
    const timer = setTimeout(() => {
      router.replace('/(auth)');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>MAXMOVE</Text>
        <Text style={styles.tagline}>Driver Partner</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontFamily: 'Poppins_700Bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 20,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
});