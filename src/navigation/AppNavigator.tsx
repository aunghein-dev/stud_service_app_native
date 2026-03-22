import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MainTabParamList, RootStackParamList } from './types';
import { LoginScreen } from '@/modules/auth/screens/LoginScreen';
import { SignUpScreen } from '@/modules/auth/screens/SignUpScreen';
import { DashboardScreen } from '@/modules/dashboard/screens/DashboardScreen';
import { StudentListScreen } from '@/modules/students/screens/StudentListScreen';
import { StudentCreateScreen } from '@/modules/students/screens/StudentCreateScreen';
import { TeacherListScreen } from '@/modules/teachers/screens/TeacherListScreen';
import { ClassCourseListScreen } from '@/modules/classCourses/screens/ClassCourseListScreen';
import { EnrollmentListScreen } from '@/modules/enrollments/screens/EnrollmentListScreen';
import { EnrollmentCreateScreen } from '@/modules/enrollments/screens/EnrollmentCreateScreen';
import { PaymentListScreen } from '@/modules/payments/screens/PaymentListScreen';
import { PaymentCreateScreen } from '@/modules/payments/screens/PaymentCreateScreen';
import { ExpenseListScreen } from '@/modules/expenses/screens/ExpenseListScreen';
import { ReceiptListScreen } from '@/modules/receipts/screens/ReceiptListScreen';
import { ReceiptDetailScreen } from '@/modules/receipts/screens/ReceiptDetailScreen';
import { ReceiptPrintPreviewScreen } from '@/modules/receipts/screens/ReceiptPrintPreviewScreen';
import { ReportsOverviewScreen } from '@/modules/reports/screens/ReportsOverviewScreen';
import { SettingsScreen } from '@/modules/settings/screens/SettingsScreen';
import { MoreHubScreen } from '@/modules/navigation/screens/MoreHubScreen';
import { useAuthStore } from '@/store/authStore';
import { useUIMotionStore } from '@/store/uiMotionStore';
import { theme } from '@/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

const tabIcons: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Dashboard: 'home-outline',
  Students: 'people-outline',
  Enrollments: 'school-outline',
  Payments: 'wallet-outline',
  More: 'grid-outline'
};

function MainTabs() {
  const insets = useSafeAreaInsets();
  const tabBarVisible = useUIMotionStore((state) => state.tabBarVisible);

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSubtle,
        tabBarStyle: [
          styles.tabBar,
          !tabBarVisible && styles.tabBarHidden,
          {
            height: 56 + insets.bottom,
            paddingTop: theme.spacing.xs,
            paddingBottom: Math.max(insets.bottom, theme.spacing.xs)
          }
        ],
        tabBarItemStyle: styles.tabItem,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color }) => (
          <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
            <Ionicons
              name={tabIcons[route.name as keyof MainTabParamList]}
              size={focused ? 19 : 17}
              color={focused ? theme.colors.primary : color}
            />
          </View>
        )
      })}
    >
      <Tabs.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Home' }} />
      <Tabs.Screen name="Students" component={StudentListScreen} options={{ title: 'Students' }} />
      <Tabs.Screen name="Enrollments" component={EnrollmentListScreen} options={{ title: 'Enroll' }} />
      <Tabs.Screen name="Payments" component={PaymentListScreen} options={{ title: 'Payments' }} />
      <Tabs.Screen name="More" component={MoreHubScreen} options={{ title: 'More' }} />
    </Tabs.Navigator>
  );
}

export function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => Boolean(state.session?.access_token));

  return (
    <NavigationContainer>
      <Stack.Navigator
        key={isAuthenticated ? 'app' : 'auth'}
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTitleStyle: { ...theme.typography.subheading, color: theme.colors.text },
          headerTintColor: theme.colors.text,
          contentStyle: { backgroundColor: theme.colors.background }
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="Teachers" component={TeacherListScreen} options={{ title: 'Teachers' }} />
            <Stack.Screen
              name="Classes"
              component={ClassCourseListScreen}
              options={({ route }) => ({ title: route.params?.title || 'Class & Courses' })}
            />
            <Stack.Screen name="Expenses" component={ExpenseListScreen} options={{ title: 'Expenses' }} />
            <Stack.Screen name="Receipts" component={ReceiptListScreen} options={{ title: 'Receipts' }} />
            <Stack.Screen name="Reports" component={ReportsOverviewScreen} options={{ title: 'Reports' }} />
            <Stack.Screen name="StudentCreate" component={StudentCreateScreen} options={{ title: 'New Student' }} />
            <Stack.Screen name="EnrollmentCreate" component={EnrollmentCreateScreen} options={{ title: 'New Enrollment' }} />
            <Stack.Screen name="PaymentCreate" component={PaymentCreateScreen} options={{ title: 'New Payment' }} />
            <Stack.Screen name="ReceiptDetail" component={ReceiptDetailScreen} options={{ title: 'Receipt Detail' }} />
            <Stack.Screen name="ReceiptPrintPreview" component={ReceiptPrintPreviewScreen} options={{ title: 'Print Preview' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 56,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.xs
  },
  tabBarHidden: {
    height: 0,
    paddingTop: 0,
    paddingBottom: 0,
    borderTopWidth: 0,
    overflow: 'hidden'
  },
  tabItem: {
    paddingVertical: 1
  },
  tabLabel: {
    ...theme.typography.caption,
    marginTop: 1
  },
  iconWrap: {
    width: 28,
    height: 22,
    borderRadius: theme.radii.sm,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconWrapActive: {
    backgroundColor: 'rgba(20, 88, 79, 0.12)'
  }
});
