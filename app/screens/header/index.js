import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import styles from './styles.js';
import colors from '../../styles/colors.js';

export default class Header extends Component {
  static propTypes = {
    header: PropTypes.string,
  };

  render() {
    return (
      <View style={styles.headerContainer}>
        <Text style={{ fontWeight: '300', color: colors.lightBlue, fontSize: this.props.headerSize }}>{this.props.header}</Text>
        <Text style={{ fontWeight: '300', color: 'white', fontSize: 16, textAlign: 'center' }}>{this.props.subtext}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.connectButton} onPress={this.instagramOAuth}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Connect</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
