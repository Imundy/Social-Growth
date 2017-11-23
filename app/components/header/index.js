import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import styles from './styles.js';
import colors from '../../styles/colors.js';

export default class Header extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    titleSize: PropTypes.number.isRequired,
    subtext: PropTypes.string,
    search: PropTypes.func,
    connect: PropTypes.func,
    account: PropTypes.shape({
      name: PropTypes.string,
    }),
  };

  renderConnect = () => (
    <View style={styles.buttonContainer}>
      { this.props.account ?
        <Text style={styles.account}>{this.props.account.name}</Text> :
        <TouchableOpacity style={styles.connectButton} onPress={this.props.connect}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Connect</Text>
        </TouchableOpacity> }
    </View>
  );

  renderSearch = () => (
    <View style={styles.searchContainer}>
      <TextInput style={styles.input} onChangeText={this.props.searchTextChange} placeholder="Search" placeholderTextColor="#999" />
      <TouchableOpacity style={styles.searchButton} onPress={this.props.search}>
        <Text style={{ color: 'white' }}>A</Text>
      </TouchableOpacity>
    </View>
  )

  render() {
    return (
      <View style={styles.headerContainer}>
        <Text style={{ fontWeight: '300', color: colors.lightBlue, fontSize: this.props.titleSize }}>{this.props.title}</Text>
        <Text style={{ fontWeight: '300', color: 'white', fontSize: 16, textAlign: 'center' }}>{this.props.subtext}</Text>
        {this.props.connect != null && this.renderConnect()}
        {this.props.searchTextChange != null && this.props.search != null && this.renderSearch()}
      </View>
    );
  }
}
