import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Header from '../../components/header';
import config from '../../config';

export default class Search extends Component {
  static PropTypes = {
    social: PropTypes.string.isRequired,
    results: PropTypes.arrayOf(PropTypes.shape({})),
  };

  state ={
    updateSearch: '',
  };

  _keyExtractor = item => item.id;

  searchTextChange = (text) => {
    this.setState({
      search: text,
    });
  }

  search = () => {
    this.setState({
      updateSearch: this.state.search,
    });
    this.props.search(this.state.search);
  }

  render() {
    return (
      <View>
        <Header header="TAG SEARCH" headerSize={22} subtext="Search and follow new accounts" search={this.search} searchTextChange={this.searchTextChange} />
        {this.state.updateSearch !== '' && <Text>Results for {this.state.updateSearch}</Text>}
        <FlatList
          data={this.props.accounts}
          keyExtractor={this._keyExtractor}
          renderItem={this.props.renderItem}
        />
      </View>
    );
  }
}
