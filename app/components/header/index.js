import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableHighlight } from 'react-native';
import styles from './styles';

export default class Header extends PureComponent {
  static propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    connected: PropTypes.bool.isRequired,
    onConnect: PropTypes.func.isRequired,
    account: PropTypes.shape({
      name: PropTypes.string
    })
  }

  render() {
    const { title, description, connected, onConnect, account } = this.props;

    return (
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        {connected ?
        <Text style={styles.account}>{account.name}</Text> :
        <TouchableHighlight style={styles.connectContainer}>
          <Text style={styles.connect}>CONNECT</Text>
        </TouchableHighlight>}
      </View>
    );
  }
}

