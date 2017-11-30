import React, { Component } from 'react';
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
  textInputAnimation: {
    from: {
      opacity: 0,
      translateY: 30,
    },
    to: {
      opacity: 1,
      translateY: 0,
    },
  },
});

class Header extends Component {
  height = 180;

  componentWillReceiveProps = (nextProps) => {
    let height = this.height;
    height += !this.props.searchTextChange && !this.props.search && nextProps.searchTextChange && nextProps.search ? 64 : 0;
    height += this.props.searchTextChange && this.props.search && !nextProps.searchTextChange && !nextProps.search ? -64 : 0;

    this.height = height;
    this.header.transitionTo({ height: this.height });
  }

  transitionHeader = (delta) => {
    this.height += delta;
    setTimeout(() => {
      this.header.transitionTo({ height: this.height });
    }, 500);
  }

  render() {
    const { title, titleSize, subtext, search, searchTextChange, connect, account, switchAccounts, navigate, showMenu } = this.props;
    return (
      <Animatable.View style={[styles.headerContainer, { height: 180 }]} ref={(ref) => { this.header = ref; }}>
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
      </Animatable.View>
    );
  }
}

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
  <Animatable.View style={styles.searchContainer} animation="textInputAnimation" duration={200}>
    <TextInput autoCorrect={false} autoCapitalize="none" style={styles.input} onChangeText={searchTextChange} placeholder="Search" placeholderTextColor="#999" onSubmitEditing={search} />
    <TouchableOpacity style={styles.searchButton} onPress={search}>
      <SvgUri width="25" height="25" source={require('../../icons/svg/white-search-icon.svg')} />
    </TouchableOpacity>
  </Animatable.View>
);

export default Header;
