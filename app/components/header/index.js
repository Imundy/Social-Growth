import React from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import SvgUri from 'react-native-svg-uri';
import * as Animatable from 'react-native-animatable';
import styles from './styles.js';
import colors from '../../styles/colors.js';

Animatable.initializeRegistryWithDefinitions({
  myFancyAnimation: {
    from: {
      translateY: -20,
    },
    to: {
      translateY: 0,
    },
  },
});

const Header = ({ title, titleSize, subtext, search, searchTextChange, connect, account, switchAccounts, navigate, showMenu }) => (
  <View style={styles.headerContainer}>
    <TouchableOpacity style={{ width: 40, height: 40, position: 'absolute', top: 40, left: 20 }} onPress={navigate} >
      {!showMenu ?
        <SvgUri width="40" height="40" source={require('../../icons/svg/ic_menu_black_24px.svg')} /> :
        <SvgUri width="40" height="40" source={require('../../icons/svg/white-arrow-left.svg')} />}
    </TouchableOpacity>
    <Text style={{ fontWeight: '300', color: colors.lightBlue, fontSize: titleSize }}>{title}</Text>
    <Text style={{ fontWeight: '300', color: 'white', fontSize: 16, textAlign: 'center' }}>{subtext}</Text>
    {searchTextChange != null && search != null && renderSearch(searchTextChange, search)}
    {connect && !account ? renderConnect(connect) : null}
    {account ? renderSwitchAccounts(account, switchAccounts) : null }
  </View>
);

Header.propTypes = {
  title: PropTypes.string.isRequired,
  titleSize: PropTypes.number.isRequired,
  subtext: PropTypes.string,
  search: PropTypes.func,
  searchTextChange: PropTypes.func,
  connect: PropTypes.func,
  switchAccounts: PropTypes.func.isRequired,
  account: PropTypes.shape({
    name: PropTypes.string,
  }),
};

const renderConnect = connect => (
  <View style={styles.buttonContainer}>
    <TouchableOpacity style={styles.connectButton} onPress={connect}>
      <Text style={{ color: 'white', fontWeight: 'bold' }}>Connect</Text>
    </TouchableOpacity>
  </View>
);

const renderSwitchAccounts = (account, switchAccounts) => (
  <View style={styles.switchContainer}>
    <TouchableOpacity style={styles.switchButton} onPress={switchAccounts}>
      <Text style={{ color: 'white', fontWeight: 'bold', textDecorationLine: 'underline' }}>Switch Account</Text>
    </TouchableOpacity>
    <Text style={styles.account}>{account.name || account.username}</Text>
  </View>
  );

const renderSearch = (searchTextChange, search) => (
  <Animatable.View style={styles.searchContainer} animation="myFancyAnimation" duration={200}>
    <TextInput autoCorrect={false} autoCapitalize="none" style={styles.input} onChangeText={searchTextChange} placeholder="Search" placeholderTextColor="#999" onSubmitEditing={search} />
    <TouchableOpacity style={styles.searchButton} onPress={search}>
      <SvgUri width="25" height="25" source={require('../../icons/svg/white-search-icon.svg')} />
    </TouchableOpacity>
  </Animatable.View>
);

export default Header;
