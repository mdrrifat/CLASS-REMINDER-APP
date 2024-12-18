import { StyleSheet, Text, View,ScrollView } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './app/screen/Home';
import Profile from './app/screen/Profile';
import Routine from './app/screen/Routine';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

import { Feather } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';


const Tab=createBottomTabNavigator();
const App = () => {
  return (
    <NavigationContainer>

    <Tab.Navigator 
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') {
            return (
              <Ionicons
                name={
                  focused
                    ? 'home'
                    : 'home-outline'
                }
                size={size}
                color={color}
              />
            );
          } else if (route.name === 'Profile') {
            return (
              <FontAwesome
                name={focused ? 'user-circle' : 'user-circle-o'}
                size={size}
                color={color}
              />
            );
          }
          else if (route.name === 'Routine'){
            return (
              <FontAwesome name={focused ? "calendar":"calendar-o"} size={size} color={color} />
            );
          }
        },
        tabBarInactiveTintColor: 'gray',
        tabBarActiveTintColor: 'black',
        headerShown: false,
        
        
        
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Routine" component={Routine} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
    </NavigationContainer>
    )
}

export default App