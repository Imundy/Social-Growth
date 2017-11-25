/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';

import { StackNavigator } from 'react-navigation';

import Home from './app/screens/home';
import Twitter from './app/screens/twitter';
import Instagram from './app/screens/instagram';

export default class App extends Component<{}> {
  render() {
    return (<AppNavigator />);
  }
}

const AppNavigator = new StackNavigator(
  {
    Home: {
      screen: Home,
    },
    Twitter: {
      screen: Twitter,
    },
    Instagram: {
      screen: Instagram,
    },
  },
  {
    headerMode: 'none',
    initialRouteName: 'Home',
  },
);
