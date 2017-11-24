import React, { Component } from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import UserSearchResult from '../../components/user-search-result';
import styles from './styles';
import colors from '../../styles/colors';
import { loadKnownFollowing, addKnownFollowing, loadKnownFollowers } from './util';

export default class Search extends Component {
  state = {
    tagSelected: false,
    isSearching: false,
  };

  componentDidMount = async () => {
    const currentUserId = await AsyncStorage.getItem('currentUserId');
    const knownFollowers = await loadKnownFollowers();
    this.setState({ currentUserId, knownFollowers });
  }

  componentWillReceiveProps = (nextProps) => {
    if ((nextProps.screenProps.searchResults != null && this.props.screenProps.searchResults != null && nextProps.screenProps.searchResults[0].name !== this.props.screenProps.searchResults[0].name)) {
      this.setState({ tagSelected: false });
    } else if (nextProps.screenProps.isSearchingTags) {
      this.setState({ tagSelected: false });
    }
  }

  followUser = async (userId) => {
    this.props.screenProps.follow(userId, 'follow');
    this.setState({
      results: this.state.results.filter(x => x.id !== userId),
    });
  }

  fetchUsers = async (query) => {
    this.setState({
      isSearching: true,
    });

    const knownFollowing = await loadKnownFollowing();
    const { knownFollowers } = this.state;

    this.props.screenProps.request(`https://api.instagram.com/v1/tags/${query}/media/recent?count=50&access_token=${this.props.screenProps.accessToken}`)
      .then((res) => {
        if (res.status < 200 || res.status >= 300) {
          this.setState({
            error: 'Failed request',
          });
          return null;
        }

        return res.json();
      }).then(async (result) => {
        const ids = ([...new Set(result.data.map(x => x.user.id))]).filter(x => x !== this.state.currentUserId);
        try {
          let results = await Promise.all(
            ids.map(id =>
              (knownFollowing.indexOf(id.toString()) === -1 ?
              this.props.screenProps.request(`https://api.instagram.com/v1/users/${id}/relationship?access_token=${this.props.screenProps.accessToken}`)
                .then(response => response.json())
                .then(res => ({
                  ...result.data.find(x => x.user.id === id).user,
                  relationship: res.data,
                })) :
                ({
                  ...result.data.find(x => x.user.id === id).user,
                  relationship: { incoming_status: knownFollowers.indexOf(id) !== -1 ? 'followed_by' : 'none', outgoing_status: 'follows' },
                })),
            ));

          results = await Promise.all(
            results.filter(user => user.relationship.outgoing_status === 'none').map(user =>
              this.props.screenProps.request(`https://api.instagram.com/v1/users/${user.id}/?access_token=${this.props.screenProps.accessToken}`)
                .then(response => response.json())
                .then(res => ({
                  ...user,
                  ...res.data,
                })),
            ),
          );

          await addKnownFollowing(results.filter(user => knownFollowing.indexOf(user.id.toString()) === -1 && user.relationship.outgoing_status === 'follows').map(user => user.id));

          this.setState({
            results,
            tagSelected: query,
            isSearching: false,
          });
        } catch (err) {
          console.log(err);
        }
      });
  }

  renderTagResult = item => (
    <TouchableOpacity style={styles.tagResultContainer} onPress={() => this.fetchUsers(item.name)}>
      <Text style={{ color: colors.blue, fontWeight: 'bold' }}>#{item.name}</Text>
      <Text>{numberWithCommas(item.media_count)} posts</Text>
    </TouchableOpacity>
  )

  renderUserResult = item => (
    <UserSearchResult user={{ ...item, followStatus: followerStatuses[item.relationship.outgoing_status], following: item.relationship.outgoing_status !== 'none', displayName: item.full_name, profileImage: item.profile_picture, followerCount: item.counts.followed_by }} followUser={() => this.followUser(item.id)} />
  )

  render() {
    const { screenProps } = this.props;

    if (this.state.isSearching || this.state.error || (this.state.results != null && this.state.results.length === 0 && this.state.tagSelected)) {
      return (
        <View style={{ backgroundColor: 'white', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
          {this.state.isSearching ? <ActivityIndicator style={{ margin: 75 }} /> :
          <Text style={{ textAlign: 'center', fontSize: 16 }}>{this.state.error || 'No new users found under this tag.'}</Text>}
        </View>
      );
    }

    if (!this.state.tagSelected) {
      return (
        <FlatList
          contentContainerStyle={{ backgroundColor: 'white' }}
          data={screenProps.searchResults}
          keyExtractor={item => item.name}
          renderItem={({ item }) => this.renderTagResult(item)}
          onEndReached={screenProps.loadMore}
        />
      );
    }

    return (
      <FlatList
        contentContainerStyle={{ backgroundColor: 'white' }}
        data={this.state.results}
        keyExtractor={item => item.id}
        renderItem={({ item }) => this.renderUserResult(item, screenProps.followUser)}
        onEndReached={screenProps.loadMore}
      />
    );
  }
}

const numberWithCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const followerStatuses = {
  follows: 'Following',
  requested: 'Requested',
};

