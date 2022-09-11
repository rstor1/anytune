import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../views/HomeScreen';
import PlayerScreen from '../views/PlayerScreen';
import Page from '../../AppStyles';

const Stack = createNativeStackNavigator();

export default function Container() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Player" component={PlayerScreen}   
      options={{
          headerStyle: {
            backgroundColor: 'black'
          },
          headerTintColor: '#fff',
  }}/>
    </Stack.Navigator>
  );
}