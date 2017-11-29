/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';

import { DrawerNavigator } from 'react-navigation';
import Twitter from './app/screens/twitter';
import Instagram from './app/screens/instagram';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import SvgUri from 'react-native-svg-uri';
import colors from './app/styles/colors';

console.disableYellowBox = true;

export default class App extends Component<{}> {
  render() {
    return (<AppNavigator />);
  }
}

const AppNavigator = DrawerNavigator({
  Twitter: {
    screen: Twitter,
  },
  Instagram: {
    screen: Instagram,
  },
}, {
  contentComponent: ({ navigation }) => <DrawerContainer navigation={navigation} />,
  drawerWidth: 200,
  contentOptions: {
    inactiveTintColor: '#629FF4',
    activeTintColor: '#629FF4',
  },
});

const DrawerContainer = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={{ fontSize: 24, textAlign: 'center', color: colors.blue, paddingBottom: 12 }}>Simple Social</Text>
    <TouchableOpacity onPress={() => navigation.navigate('Twitter')} style={[styles.item, { borderTopColor: colors.blue, borderTopWidth: 2 }, navigation.state.routes[navigation.state.index].key === 'Twitter' ? styles.active : {}]}>
      <SvgUri width="25" height="25" source={require('./app/icons/svg/blue-twitter-icon.svg')} />
      <View style={{ justifyContent: 'center', width: 120 }}>
        <Text style={{ textAlign: 'center', fontWeight: '500', color: colors.blue }}>TWITTER</Text>
      </View>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => navigation.navigate('Instagram')} style={[styles.item, navigation.state.routes[navigation.state.index].key === 'Instagram' ? styles.active : {}]}>
      <SvgUri width="25" height="25" source={require('./app/icons/svg/instagram-logo-blue.svg')} />
      <View style={{ justifyContent: 'center', width: 120 }}>
        <Text style={{ textAlign: 'center', fontWeight: '500', color: colors.blue }}>INSTAGRAM</Text>
      </View>
    </TouchableOpacity>
  </View>
  );

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
    paddingTop: 40,
  },
  item: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    height: 48,
    alignItems: 'center',
    width: '100%',
  },
  active: {
    backgroundColor: '#DDDDDD',
  },
});
