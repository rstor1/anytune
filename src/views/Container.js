import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../views/HomeScreen';
import PlayerScreen from '../views/PlayerScreen';
import Page from '../../AppStyles';
import {
  MenuContext,
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  MenuProvider
} from 'react-native-popup-menu';

const Stack = createNativeStackNavigator();

export default function Container() {
  return (
    <MenuProvider>
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
    </MenuProvider>
  );
}