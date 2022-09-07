import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../views/HomeScreen';
import Page from '../../AppStyles';

const Stack = createNativeStackNavigator();

export default function Container() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      {/* Add our screens/pages here */}
    </Stack.Navigator>
  );
}