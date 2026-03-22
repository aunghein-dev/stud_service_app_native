import 'react-native-gesture-handler';
import React from 'react';
import { AppProviders } from '@/app/AppProviders';
import { AppNavigator } from '@/navigation/AppNavigator';

export default function App() {
  return (
    <AppProviders>
      <AppNavigator />
    </AppProviders>
  );
}
