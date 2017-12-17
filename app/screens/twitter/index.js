import React, { Component } from 'react';
import { ScrollView, View, AsyncStorage } from 'react-native';
import twitter, { auth } from 'react-native-twitter';
import { StackNavigator } from 'react-navigation';
import SvgUri from 'react-native-svg-uri';

import Header from '../../components/header';
import Card from '../../components/card';
import SwitchAccounts from '../../components/switch-accounts';
import UserSearch from './user-search';
import UnfollowUsers from './unfollow-users';
import TweetSearch from './tweet-search';
import config from '../../config';
import colors from '../../styles/colors';
import styles from './styles';

// Icons
import BlueTwitterIcon from '../../icons/svg/white-twitter-icon';

export default class Twitter extends Component {
  static navigationOptions = {
    drawerLabel: 'Twitter',
    drawerIcon: () => (
      <SvgUri width="25" height="25" svgXmlData={BlueTwitterIcon} />
    ),
  };

  state = {
    connected: false,
    twitterAccounts: [],
    currentAccount: null,
    view: views.Home,
  }

  async componentDidMount() {
    let twitterAccounts = await AsyncStorage.getItem('accounts:twitter');
    if (twitterAccounts) {
      const currentAccount = await AsyncStorage.getItem('currentAccount:twitter');
      twitterAccounts = JSON.parse(twitterAccounts);
      this.setState({ connected: true, twitterAccounts, currentAccount: currentAccount ? JSON.parse(currentAccount) : twitterAccounts[0] }, this.createTwitterClient); // eslint-disable-line
    }
    this.props.navigation.navigate('SwitchAccounts');
  }

  createTwitterClient = async () => {
    if (!this.state.currentAccount) {
      return;
    }

    const { accessToken, accessTokenSecret } = this.state.currentAccount.tokens == null ? this.state.currentAccount : this.state.currentAccount.tokens;
    const clients = twitter({
      consumerKey: config.twitterConsumerToken,
      consumerSecret: config.twitterConsumerSecret,
      accessToken,
      accessTokenSecret,
    });
    this._twitterClient = clients.rest;
    if (!this.state.currentAccount.screen_name) {
      this.getCurrentAccountInfo();
    }
  }

  getCurrentAccountInfo = async () => {
    const currentAccountInfo = await this._twitterClient.get('users/lookup', { user_id: this.state.currentAccount.id, stringify_ids: true });
    const currentAccount = { ...currentAccountInfo[0], ...this.state.currentAccount };
    const currentAccountIndex = this.state.twitterAccounts.findIndex(x => x.id === currentAccount.id);
    const twitterAccounts = [...this.state.twitterAccounts];
    twitterAccounts[currentAccountIndex] = currentAccount;
    this.setState({ twitterAccounts, currentAccount });
    await this.storeAccounts(twitterAccounts, currentAccount);
  }

  storeAccounts = async (twitterAccounts, currentAccount) => {
    const accountsPromise = AsyncStorage.setItem('accounts:twitter', JSON.stringify(twitterAccounts));
    const currentAccountPromise = AsyncStorage.setItem('currentAccount:twitter', JSON.stringify(currentAccount));
    return Promise.all(accountsPromise, currentAccountPromise);
  }

  signIn = async () => {
    try {
      const twitterResponse = await auth(
          { consumerKey: config.twitterConsumerToken, consumerSecret: config.twitterConsumerSecret },
          'socialauth://twitter',
      );
      const twitterAccounts = [...this.state.twitterAccounts];
      twitterAccounts.push(twitterResponse);
      await this.storeAccounts(twitterAccounts, twitterResponse);
      this.setState({ connected: true, twitterAccounts, currentAccount: twitterResponse }, this.createTwitterClient);
      if (this.state.view === views.SwitchAccounts.name) {
        this.props.navigation.goBack();
      }
    } catch (error) {
      console.warn(error);
    }
  }

  selectAccount = (accountId) => {
    const currentAccount = this.state.twitterAccounts.find(x => x.id === accountId);
    this.setState({ currentAccount }, this.createTwitterClient);
    AsyncStorage.setItem('currentAccount:twitter', JSON.stringify(currentAccount));
    this._navigator._navigation.goBack();
  }

  follow = async (id) => {
    try {
      await this._twitterClient.post('friendships/create', { user_id: id, stringify_ids: true });
      this.updateFollowingState(id, true);
    } catch (error) {
      console.log(`An error occurred following this user: ${id}`, error);
    }
  }

  unfollow = async (id) => {
    try {
      await this._twitterClient.post('friendships/destroy', { user_id: id });
    } catch (e) {
      console.log(e);
    }
    this.updateFollowingState(id, false);
  }

  updateFollowingState = (id, following) => {
    this.setState((state) => {
      const { searchResults, tweetResults, nonFollowers } = state;

      if (searchResults) {
        const searchIndex = searchResults.findIndex(x => x.id === id);
        searchResults[searchIndex].following = following;
      }
      if (tweetResults) {
        const tweetIndex = tweetResults.findIndex(x => x.user.id_str === id);
        if (tweetIndex === -1) {
          return { searchResults, tweetResults, nonFollowers };
        }
        tweetResults[tweetIndex].user.following = following;
        tweetResults.splice(tweetIndex, 1);
      }
      if (nonFollowers) {
        const nonFollowersIndex = nonFollowers.findIndex(x => x.id === id);
        nonFollowers[nonFollowersIndex].following = following;
      }
      return { searchResults, tweetResults, nonFollowers };
    });
  }

  search = async () => {
    const response = await this._twitterClient.get('users/search', { q: this.state.searchText });
    const hasMoreSearchResults = response.length === 20;
    this.setState({ searchResults: response, page: 1, hasMoreSearchResults });
  }

  loadMoreSearchResults = async () => {
    const response = await this._twitterClient.get('users/search', { q: this.state.searchText, page: this.state.page + 1 });
    const hasMoreSearchResults = response.length === 20;
    this.setState(state => ({ searchResults: [...state.searchResults, ...response], hasMoreSearchResults, page: state.page + 1 }));
  }

  searchTweets = async () => {
    const { searchText } = this.state;
    const terms = searchText.split(',');
    const query = terms.map((term) => {
      term = term.trim();
      if (term.indexOf(' ' !== -1)) {
        term = `"${term}"`;
      }
      return term;
    }).join(' OR ');
    const response = await this._twitterClient.get('search/tweets', { q: query, count: 100 });
    this.setState({ tweetResults: response.statuses, tweetPage: 1, hasMoreTweetResults: response.statuses.length === 100, tweetsQuery: query, tweetsTerms: terms });
  }

  loadMoreTweets = async () => {
    const response = await this._twitterClient.get('search/tweets', { q: this.state.tweetsQuery, page: this.state.tweetPage + 1, count: 100 });
    const hasMoreTweetResults = response.statuses.length === 100;
    this.setState(state => ({ tweetResults: [...state.tweetResults, ...response.statuses], hasMoreTweetResults, tweetPage: state.tweetPage + 1 }));
  }

  toggleFavorite = async (id, favorited) => {
    if (favorited) {
      await this._twitterClient.post('favorites/destroy', { id });
    } else {
      await this._twitterClient.post('favorites/create', { id });
    }
    this.setState((state) => {
      const { tweetResults } = state;
      const index = tweetResults.findIndex(t => t.id == id);
      tweetResults[index].favorited = !favorited;
      return { tweetResults };
    });
  }

  toggleRetweet = async (id, retweeted) => {
    if (retweeted) {
      await this._twitterClient.post(`statuses/unretweet/${id}`);
    } else {
      await this._twitterClient.post(`statuses/retweet/${id}`);
    }
    this.setState((state) => {
      const { tweetResults } = state;
      const index = tweetResults.findIndex(t => t.id == id);
      tweetResults[index].retweeted = !retweeted;
      return { tweetResults };
    });
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
    let friendIds; // = await AsyncStorage.getItem('twitter friends');
    let followerIds; // = await AsyncStorage.getItem('twitter followers');
    if (!friendIds || !followerIds) {
      friendIds = await this.loadFriends();
      followerIds = await this.loadFollowers();
      // await AsyncStorage.setItem('twitter friends', JSON.stringify(friendIds));
      // await AsyncStorage.setItem('twitter followers', JSON.stringify(followerIds));
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
    this.view = views[currentState.routes[currentState.index].routeName];
    if (views[currentState.routes[currentState.index].routeName].name === 'UnfollowUsers') {
      this.header.transitionHeader(-20);
    } else if (this.state.view.name === 'UnfollowUsers' && views[currentState.routes[currentState.index].routeName].name !== 'UnfollowUsers') {
      this.header.transitionHeader(20);
    }

    this.setState({
      view: views[currentState.routes[currentState.index].routeName],
    });
  }

  getPropsForScreen = () => {
    const { searchResults, tweetResults, tweetsTerms, hasMoreTweetResults, loading, nonFollowers, hasMoreSearchResults } = this.state;

    switch (this.state.view.name) {
      case views.UserSearch.name:
        return {
          searchResults,
          loadMore: this.loadMoreSearchResults,
          followUser: this.follow,
          hasMoreSearchResults,
        };
      case views.TweetSearch.name:
        return {
          tweetResults,
          tweetsTerms,
          loadMore: this.loadMoreTweets,
          followUser: this.follow,
          unfollowUser: this.unfollow,
          toggleFavorite: this.toggleFavorite,
          toggleRetweet: this.toggleRetweet,
          hasMoreSearchResults: hasMoreTweetResults,
        };
      case views.UnfollowUsers.name:
        return {
          unfollowUser: this.unfollow,
          loading,
          nonFollowers,
          loadUnfollowers: this.getNonFollowingUsers,
        };
      case views.SwitchAccounts.name:
        return {
          serviceName: 'Twitter',
          accounts: this.state.twitterAccounts.map(account => ({
            id: account.id,
            profileImage: account.profile_image_url_https,
            displayName: account.name,
          })),
          selectedAccountId: this.state.currentAccount.id,
          addAccount: this.signIn,
          selectAccount: this.selectAccount,
        };
      case views.Home.name:
      default:
        return {};
    }
  }

  getSearchFunction = () => {
    const { view } = this.state;
    if (views[view.name].searchable) {
      switch (view) {
        case views.UserSearch.name:
          return this.search;
        case views.TweetSearch.name:
        default:
          return this.searchTweets;
      }
    }
    return null;
  }

  render() {
    const { currentAccount, view } = this.state;
    const screenProps = this.getPropsForScreen();

    return (
      <View style={styles.container}>
        <Header
          title="TWITTER"
          titleSize={36}
          subtext={views[view.name].description}
          search={this.getSearchFunction()}
          searchTextChange={views[view.name].searchable ? this.searchTextChange : null}
          account={currentAccount ? { name: `@${currentAccount.name}` } : null}
          switchAccounts={() => {
            this._navigator._navigation.navigate('SwitchAccounts');
          }}
          navigate={view.name === 'TweetSearch' || view.name === 'UserSearch' || view.name === 'UnfollowUsers' || view.name === 'SwitchAccounts' ? () => this._navigator._navigation.goBack() : () => this.props.navigation.navigate('DrawerOpen')}
          showMenu={view.name === 'TweetSearch' || view.name === 'UserSearch' || view.name === 'UnfollowUsers' || view.name === 'SwitchAccounts'}
          ref={(ref) => { this.header = ref; }}
        />
        <TwitterApp
          ref={(ref) => { this._navigator = ref; }}
          onNavigationStateChange={this.navigationStateChange}
          screenProps={screenProps}
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
        title="USER SEARCH"
        color={colors.blueGreen}
        logo={() => (<SvgUri width="25" height="25" svgXmlData={BlueTwitterIcon} />)}
        toggle={() => {}}
        onPress={() => { navigation.navigate('UserSearch'); }}
        index={0}
      />
      <Card
        description={views.TweetSearch.description}
        title="TWEET SEARCH"
        color={colors.blue}
        logo={() => (<SvgUri width="25" height="25" svgXmlData={BlueTwitterIcon} />)}
        toggle={() => {}}
        onPress={() => { navigation.navigate('TweetSearch'); }}
        index={1}
      />
      <Card
        description={views.UnfollowUsers.description}
        title="UNFOLLOW ACCOUNTS"
        color={colors.pink}
        logo={() => (<SvgUri width="25" height="25" svgXmlData={BlueTwitterIcon} />)}
        toggle={() => {}}
        onPress={() => { navigation.navigate('UnfollowUsers'); }}
        index={2}
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
  TweetSearch: {
    screen: TweetSearch,
  },
  UnfollowUsers: {
    screen: UnfollowUsers,
  },
  SwitchAccounts: {
    screen: SwitchAccounts,
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
    description: 'Search people based on interests and information.',
    searchable: true,
  },
  TweetSearch: {
    name: 'TweetSearch',
    description: 'Search tweets based on hashtags and content.',
    searchable: true,
  },
  UnfollowUsers: {
    name: 'UnfollowUsers',
    description: 'Unfollow accounts who don\'t follow you back.',
  },
  SwitchAccounts: {
    name: 'SwitchAccounts',
    description: 'Select which account to use.',
  },
};
