import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import SvgUri from 'react-native-svg-uri';
import colors from '../../styles/colors';

import styles from './styles';

const Home = ({ navigation }) => (
  <View style={styles.container}>
    <TouchableOpacity style={{ ...styles.option, backgroundColor: colors.blue }} onPress={() => { navigation.navigate('Twitter'); }}>
      <SvgUri width="50" height="50" source={require('../../icons/svg/white-twitter-icon.svg')} />
      <Text style={styles.optionText}>Twitter</Text>
    </TouchableOpacity>
    <TouchableOpacity style={{ ...styles.option, backgroundColor: colors.blueGreen }} onPress={() => { navigation.navigate('Instagram'); }}>
      <SvgUri width="50" height="50" source={require('../../icons/svg/instagram-logo.svg')} />
      <Text style={styles.optionText}>Instagram</Text>
    </TouchableOpacity>
  </View>
);

export default Home;
