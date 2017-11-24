import React, { Component } from 'react';
import { ScrollView, View, AsyncStorage } from 'react-native';
import twitter, { auth } from 'react-native-twitter';
import { StackNavigator } from 'react-navigation';
import SvgUri from 'react-native-svg-uri';

import Header from '../../components/header';
import Card from '../../components/card';
import UserSearch from './user-search';
import UnfollowUsers from './unfollow-users';
import config from '../../config';
import colors from '../../styles/colors';
import styles from './styles';

export default class Twitter extends Component {
  state = {
    connected: false,
    twitterTokens: null,
    view: views.Home,
  }

  async componentDidMount() {
    const twitterTokens = await AsyncStorage.getItem('twitterTokens');
    if (twitterTokens) {
      this.setState({ connected: true, twitterTokens: JSON.parse(twitterTokens) }, this.createTwitterClient); // eslint-disable-line
    }
  }

  createTwitterClient = () => {
    const { accessToken, accessTokenSecret } = this.state.twitterTokens;
    const clients = twitter({
      consumerKey: config.twitterConsumerToken,
      consumerSecret: config.twitterConsumerSecret,
      accessToken,
      accessTokenSecret,
    });
    this._twitterClient = clients.rest;
  }

  signIn = async () => {
    try {
      const twitterResponse = await auth(
                { consumerKey: config.twitterConsumerToken, consumerSecret: config.twitterConsumerSecret },
                'socialauth://twitter',
            );

      AsyncStorage.setItem('twitterTokens', JSON.stringify(twitterResponse));
      this.setState({ connected: true, twitterTokens: twitterResponse }, this.createTwitterClient);
    } catch (error) {
      console.warn(error);
    }
  }

  follow = async (id) => {
    await this._twitterClient.post('friendships/create', { user_id: id });
    const { searchResults } = this.state;
    const index = searchResults.findIndex(x => x.id === id);
    searchResults[index].following = true;
    this.setState({ searchResults });
  }

  unfollow = async (id) => {
    await this._twitterClient.post('friendships/destroy', { user_id: id });
    const { nonFollowers } = this.state;
    const index = nonFollowers.findIndex(x => x.id === id);
    nonFollowers[index].following = false;
    this.setState({ nonFollowers });
  }

  search = async () => {
    const response = await this._twitterClient.get('users/search', { q: this.state.searchText });
    this.setState({ searchResults: response, page: 1 });
  }

  loadMoreSearchResults = async () => {
    const response = await this._twitterClient.get('users/search', { q: this.state.searchText, page: this.state.page + 1 });
    this.setState(state => ({ searchResults: [...state.searchResults, ...response], page: state.page + 1 }));
  }

  loadFriends = async () => {
    let response = await this._twitterClient.get('friends/ids', { stringify_ids: true });
    let ids = [...response.ids];
    while (response.next_cursor !== 0) {
      response = await this._twitterClient.get('friends/ids', { stringify_ids: true, curso: response.next_cursor });
      ids = [...ids, ...response.ids];
    }
    return ids;
  }

  loadFollowers = async () => {
    let response = await this._twitterClient.get('followers/ids', { stringify_ids: true });
    let ids = [...response.ids];
    while (response.next_cursor !== 0) {
      response = await this._twitterClient.get('follwers/ids', { stringify_ids: true, curso: response.next_cursor });
      ids = [...ids, ...response.ids];
    }
    return ids;
  }

  getNonFollowingUsers = async () => {
    this.setState({ loading: true });
    let friendIds = await AsyncStorage.getItem('twitter friends');
    let followerIds = await AsyncStorage.getItem('twitter followers');
    if (!friendIds || !followerIds) {
      friendIds = await this.loadFriends();
      followerIds = await this.loadFollowers();
      await AsyncStorage.setItem('twitter friends', JSON.stringify(friendIds));
      await AsyncStorage.setItem('twitter followers', JSON.stringify(followerIds));
    } else {
      friendIds = JSON.parse(friendIds);
      followerIds = JSON.parse(followerIds);
    }
    const nonFollowerIds = friendIds.filter(id => followerIds.indexOf(id) < 0);
    const userRequests = [];
    for (let i = 0; i < Math.ceil(nonFollowerIds.length / 100); i += 1) {
      const followerIdSet = nonFollowerIds.slice(i * 100, (i + 1) * 100);
      userRequests.push(this._twitterClient.post('users/lookup', { user_id: followerIdSet }));
    }
    Promise.all(userRequests).then((values) => {
      const nonFollowers = [];
      values.forEach(users => nonFollowers.push(...users));
      this.setState({ loading: false, nonFollowers });
    });
  }

  searchTextChange = (text) => {
    this.setState({ searchText: text });
  }

  navigationStateChange = (prevState, currentState) => {
    this.setState({
      view: views[currentState.routes[currentState.index].routeName],
    });
  }

  render() {
    const { twitterTokens, view, searchResults, loading, nonFollowers } = this.state;

    return (
      <View style={styles.container}>
        <Header
          title="TWITTER"
          titleSize={36}
          subtext={views[view.name].description}
          connect={view.name === views.Home.name ? this.signIn : null}
          search={views[view.name].searchable ? this.search : null}
          searchTextChange={views[view.name].searchable ? this.searchTextChange : null}
          account={twitterTokens ? { name: `@${twitterTokens.name}` } : null}
        />
        <TwitterApp
          onNavigationStateChange={this.navigationStateChange}
          screenProps={{
            name: views[view.name].name,
            description: views[view.name].description,
            searchResults,
            loadMore: this.loadMoreSearchResults,
            followUser: this.follow,
            unfollowUser: this.unfollow,
            loading,
            nonFollowers,
            loadUnfollowers: this.getNonFollowingUsers,
          }}
        />
      </View>
    );
  }
}

const Cards = ({ navigation }) => (
  <ScrollView>
    <View style={styles.cardContainer}>
      <Card
        description={views.UserSearch.description}
        title="KEYWORD SEARCH"
        color={colors.blueGreen}
        logo={() => (<SvgUri width="25" height="25" source={require('../../icons/svg/white-twitter-icon.svg')} />)}
        toggle={() => {}}
        onPress={() => { navigation.navigate('UserSearch'); }}
      />
      <Card
        description={views.UnfollowUsers.description}
        title="UNFOLLOW ACCOUNTS"
        color={colors.blue}
        logo={() => (<SvgUri width="25" height="25" source={require('../../icons/svg/white-twitter-icon.svg')} />)}
        toggle={() => {}}
        onPress={() => { navigation.navigate('UnfollowUsers'); }}
      />
    </View>
  </ScrollView>
);

const TwitterApp = new StackNavigator({
  Home: {
    screen: Cards,
  },
  UserSearch: {
    screen: UserSearch,
  },
  UnfollowUsers: {
    screen: UnfollowUsers,
  },
}, {
  headerMode: 'none',
});

const views = {
  Home: {
    name: 'Home',
    description: 'Twitter automations and actions can help you manage followers and grow your audience.',
  },
  UserSearch: {
    name: 'UserSearch',
    description: 'Search people based on interests and location.',
    searchable: true,
  },
  UnfollowUsers: {
    name: 'UnfollowUsers',
    description: 'Unfollow accounts who don\'t follow you back.',
  },
};
