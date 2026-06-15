import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ROUTES } from '@config/routes';
import MainTabNavigator from '@navigation/MainTabNavigator';
import PlayerScreen from '@screens/Player';

const Stack = createStackNavigator();

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.MAIN} component={MainTabNavigator} />
      <Stack.Screen name={ROUTES.PLAYER} component={PlayerScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
