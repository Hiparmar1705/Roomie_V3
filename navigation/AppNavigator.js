import React from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

export default function AppNavigator() {
  const { user } = useAuth();

  // this is the main gate between auth screens and the app itself
  return user ? <MainNavigator /> : <AuthNavigator />;
}
