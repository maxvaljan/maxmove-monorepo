import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import FormInput from '@/components/FormInput';
import AuthButton from '@/components/AuthButton';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+49');

  const handleClose = () => {
    router.back();
  };

  const handleLogin = () => {
    router.push('/(auth)/verify');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <ArrowLeft color={Colors.textPrimary} size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login to your account</Text>

        <View style={styles.form}>
          <View style={styles.phoneContainer}>
            <TouchableOpacity style={styles.countryCodeContainer}>
              <Text style={styles.countryCode}>{countryCode}</Text>
            </TouchableOpacity>
            
            <View style={styles.phoneInputContainer}>
              <FormInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="phone number"
                keyboardType="phone-pad"
                required
                containerStyle={styles.phoneInput}
              />
            </View>
          </View>

          <AuthButton
            title="Login"
            onPress={handleLogin}
            variant="primary"
            style={styles.loginButton}
            textStyle={styles.loginButtonText}
            disabled={!phoneNumber}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginBottom: 40,
  },
  form: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
  },
  phoneContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: 16,
    marginRight: 10,
    height: 56,
  },
  countryCode: {
    fontSize: 16,
    color: Colors.inputText,
  },
  phoneInputContainer: {
    flex: 1,
  },
  phoneInput: {
    flex: 1,
  },
  loginButton: {
    marginTop: 8,
  },
  loginButtonText: {
    fontFamily: 'Inter_600SemiBold',
  },
});