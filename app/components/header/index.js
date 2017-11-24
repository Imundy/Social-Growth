import React from 'react';
import PropTypes from 'prop-types';

import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import styles from './styles.js';
import colors from '../../styles/colors.js';

const Header = ({ title, titleSize, subtext, search, searchTextChange, connect, account }) => (
  <View style={styles.headerContainer}>
    <Text style={{ fontWeight: '300', color: colors.lightBlue, fontSize: titleSize }}>{title}</Text>
    <Text style={{ fontWeight: '300', color: 'white', fontSize: 16, textAlign: 'center' }}>{subtext}</Text>
    {searchTextChange != null && search != null && renderSearch(searchTextChange, search)}
    {connect != null && renderConnect(account, connect)}
  </View>
);

Header.propTypes = {
  title: PropTypes.string.isRequired,
  titleSize: PropTypes.number.isRequired,
  subtext: PropTypes.string,
  search: PropTypes.func,
  searchTextChange: PropTypes.func,
  connect: PropTypes.func,
  account: PropTypes.shape({
    name: PropTypes.string,
  }),
};

const renderConnect = (account, connect) => (
  <View style={styles.buttonContainer}>
    { account ?
      <Text style={styles.account}>{account.name}</Text> :
      <TouchableOpacity style={styles.connectButton} onPress={connect}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Connect</Text>
      </TouchableOpacity> }
  </View>
);

const renderSearch = (searchTextChange, search) => (
  <View style={styles.searchContainer}>
    <TextInput autoCorrect={false} autoCapitalize="none" style={styles.input} onChangeText={searchTextChange} placeholder="Search" placeholderTextColor="#999" onSubmitEditing={search} />
    <TouchableOpacity style={styles.searchButton} onPress={search}>
      <Text style={{ color: 'white' }}>A</Text>
    </TouchableOpacity>
  </View>
);

export default Header;
