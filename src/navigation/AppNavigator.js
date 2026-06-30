import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ROUTES } from '@config/routes';
import { colors } from '@theme';
import useUserStore from '@store/userStore';
import MainTabNavigator from '@navigation/MainTabNavigator';
import PlayerScreen from '@screens/Player';
import AccountScreen from '@screens/Account';
import {
  OnboardingScreen,
  SignupScreen,
  InterestSelectionScreen,
  FeedPreferencesScreen,
} from '@screens/Onboarding';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const hydrated = useUserStore((s) => s.hydrated);
  const hasCompletedOnboarding = useUserStore((s) => s.hasCompletedOnboarding);

  if (!hydrated) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        key={hasCompletedOnboarding ? 'app-main' : 'app-onboarding'}
        screenOptions={{ headerShown: false }}
        initialRouteName={hasCompletedOnboarding ? ROUTES.MAIN : ROUTES.ONBOARDING}
      >
        {!hasCompletedOnboarding ? (
          <>
            <Stack.Screen name={ROUTES.ONBOARDING} component={OnboardingScreen} />
            <Stack.Screen name={ROUTES.SIGNUP} component={SignupScreen} />
            <Stack.Screen name={ROUTES.INTERESTS} component={InterestSelectionScreen} />
          </>
        ) : (
          <Stack.Screen name={ROUTES.MAIN} component={MainTabNavigator} />
        )}
        <Stack.Screen name={ROUTES.PLAYER} component={PlayerScreen} />
        {hasCompletedOnboarding ? (
          <Stack.Screen name={ROUTES.ACCOUNT} component={AccountScreen} />
        ) : null}
        <Stack.Screen
          name={ROUTES.FEED_PREFERENCES}
          component={FeedPreferencesScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});

export default AppNavigator;
