import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  View,
} from 'react-native';

import Search from '../../search';

export default class InstagramSearch extends Component {
  static PropTypes = {
    social: PropTypes.string.isRequired,
    results: PropTypes.arrayOf(PropTypes.shape({})),
  };

  _keyExtractor = item => item.id;

  search = (query) => {
    console.log(query);
  }

  renderItem = account => (
    <View>
      <Text>{account}</Text>
    </View>
  );

  render() {
    return (
      <Search search={this.search} renderItem={this.renderItem} />
    );
  }
}
