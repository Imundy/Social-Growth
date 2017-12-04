import React, { Component } from 'react';
import {
  AsyncStorage,
  ScrollView,
  View,
} from 'react-native';
import { StackNavigator } from 'react-navigation';
import SvgUri from 'react-native-svg-uri';

import colors from '../../styles/colors';
import Card from '../../components/card';
import Header from '../../components/header';
import Search from './search';
import Manage from './manage';
import styles from './styles';
import {
  fetchUtil,
  loadKnownFollowers,
  addKnownFollowers,
  removeKnownFollowing,
  addKnownFollowing,
} from './util';

export default class Instagram extends Component {
  state = {
    isLoading: false,
    accounts: [],
    currentAccount: null,
    error: null,
    view: views.Home,
    currentPostCount: 0,
    currentRequestCount: 0,
  }

  componentDidMount = async () => {
    let currentAccount = await AsyncStorage.getItem('currentAccount:instagram');
    let accounts = await AsyncStorage.getItem('accounts:instagram');
    console.log(currentAccount);

    accounts = JSON.parse(accounts);
    currentAccount = JSON.parse(currentAccount);

    this.setState({
      currentAccount: currentAccount || null,
      accounts: accounts || [],
    });

    const storedRequestValue = await AsyncStorage.getItem(`instagram:${currentAccount ? currentAccount.id : ''}:requestCount`);
    const storedPostValue = await AsyncStorage.getItem(`instagram:${currentAccount ? currentAccount.id : ''}:postCount`);

    if (storedRequestValue != null) {
      this.setState({
        currentRequestCount: JSON.parse(storedRequestValue).length,
      });
    }

    if (storedPostValue != null) {
      this.setState({
        currentPostCount: JSON.parse(storedPostValue).length,
      });
    }
  }

  addCurrenAccount = async (accessToken) => {
    const me = await this.networkRequest(`https://api.instagram.com/v1/users/self/?access_token=${accessToken}`).then(response => response.json());
    const currentAccount = { ...me, accessToken };
    const accounts = [...this.state.accounts];
    accounts.push(currentAccount);

    this.setState({ currentAccount, accounts });
    await AsyncStorage.setItem('currentAccount:instagram', JSON.stringify(currentAccount));
    await AsyncStorage.setItem('accounts:instagram', JSON.stringify(accounts));
    return currentAccount;
  }

  selectAccount = (accountId) => {
    const currentAccount = this.state.accounts.find(x => x.id === accountId);
    this.setState({ currentAccount });
    AsyncStorage.setItem('currentAccount:instagram', JSON.stringify(currentAccount));
    this._navigator._navigation.goBack();
  }

  networkRequest = async (url, options) => {
    const request = await fetchUtil(url, options);
    if (options != null && options.method === 'POST') {
      this.setState({
        currentPostCount: request.count,
      });
    } else {
      this.setState({
        currentRequestCount: request.count,
      });
    }

    return request.request;
  }

  stackStateChange = (prevState, currentState) => {
    this.view = views[currentState.routes[currentState.index].routeName];
    if (views[currentState.routes[currentState.index].routeName].name === 'Manage') {
      this.header.transitionHeader(-20);
    } else if (this.state.view.name === 'Manage' && views[currentState.routes[currentState.index].routeName].name !== 'Manage') {
      this.header.transitionHeader(20);
    }

    this.setState({
      view: views[currentState.routes[currentState.index].routeName],
    });
  }

  search = () => {
    const { query } = this.state;
    this.setState({
      isSearching: true,
    });

    if (query == null || query.trim().length === 0) {
      this.setState({
        isSearching: false,
      });

      return;
    }

    this.networkRequest(`https://api.instagram.com/v1/tags/search?q=${query}&access_token=${this.state.currentAccount.accessToken}`)
      .then((res) => {
        if (res.status < 200 || res.status >= 300) {
          this.setState({
            error: 'Failed request',
          });
          return null;
        }

        return res.json();
      }).then(result => this.setState({
        isSearching: false,
        results: result.data,
      }));
  }

  searchTextChange = (text) => {
    this.setState({
      query: text,
    });
  }

  addRelationship = async (users) => {
    const knownIds = await loadKnownFollowers();
    const followers = await Promise.all(
      users.filter(x => knownIds.indexOf(x.id.toString()) === -1)
        .map(user =>
          this.networkRequest(`https://api.instagram.com/v1/users/${user.id}/relationship?access_token=${this.state.currentAccount.accessToken}`)
            .then(res => res.json())
            .then(result => ({
              ...user,
              relationship: result.data,
            })),
        ),
    );

    await addKnownFollowers(followers.filter(user => user.relationship.incoming_status === 'followed_by').map(user => user.id));

    return followers.concat(users.map(user => ({ ...user, relationship: { incoming_status: 'followed_by', outgoing_status: 'follows' } })));
  }

  loadFollowers = async () => {
    const response = await this.networkRequest(`https://api.instagram.com/v1/users/self/follows?count=500&access_token=${this.state.currentAccount.accessToken}`).then(res => res.json());
    const results = await this.addRelationship(response.data);
    this.setState({
      following: results,
    });
  }

  updateFollow = async (user, action) => {
    const form = new FormData();
    form.append('action', action);
    const following = this.state.following || [];
    switch (action) {
      case 'unfollow':
        this.setState({
          following: following.filter(u => u.id !== user.id),
        });
        await removeKnownFollowing(user.id);
        await this.followRequest(user.id, form, following);
        break;
      case 'follow':
        this.setState({
          following: following.concat(user),
        });
        await addKnownFollowing(user.id);
        this.followRequest(user.id, form, following);
        break;
      default:
        break;
    }
  }

  followRequest = async (userId, form, following) => {
    try {
      await this.networkRequest(`https://api.instagram.com/v1/users/${userId}/relationship?access_token=${this.state.currentAccount.accessToken}&action=follow`, { method: 'POST', body: form });
    } catch (e) {
      this.setState({
        following,
      });
    }
  }

  getPropsForScreen = () => {
    const { results, view } = this.state;

    switch (this.state.view.name) {
      case views.Search.name:
      case views.Manage.name:
        return {
          name: views[view.name].name,
          description: views[view.name].description,
          searchResults: results,
          loadMore: this.loadMoreSearchResults,
          followUser: this.follow,
          isSearchingTags: this.state.isSearching,
          accessToken: this.state.currentAccount.accessToken,
          request: this.networkRequest,
          following: this.state.following,
          loadFollowers: this.loadFollowers,
          unfollow: this.updateFollow,
          follow: this.updateFollow,
        };
      case views.Home.name:
      default:
        return {};
    }
  }

  render() {
    const { view } = this.state;
    const screenProps = this.getPropsForScreen();

    return (
      <View style={styles.container}>
        <Header
          title="INSTAGRAM"
          titleSize={36}
          subtext={`${views[view.name].description}`}
          connect={!this.state.currentAccount ? this.instagramOAuth : null}
          search={views[view.name].searchable ? this.search : null}
          searchTextChange={views[view.name].searchable ? this.searchTextChange : null}
          account={this.state.currentAccount}
          navigate={view.name === 'Search' || view.name === 'Manage' ? () => this._navigator._navigation.goBack() : () => this.props.navigation.navigate('DrawerOpen')}
          showMenu={view.name === 'Search' || view.name === 'Manage'}
          ref={(ref) => { this.header = ref; }}
        />
        <InstagramApp
          ref={(ref) => { this._navigator = ref; }}
          onNavigationStateChange={this.stackStateChange}
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
        description={views.Search.description}
        title="KEYWORD SEARCH"
        color={colors.blueGreen}
        logo={() => (<SvgUri width="25" height="25" source={require('../../icons/svg/instagram-logo.svg')} />)}
        toggle={() => {}}
        onPress={() => { navigation.navigate('Search'); }}
        index={0}
      />
      <Card
        description={views.Manage.description}
        title="MANAGE AUDIENCE"
        color={colors.blue}
        logo={() => (<SvgUri width="25" height="25" source={require('../../icons/svg/instagram-logo.svg')} />)}
        toggle={() => {}}
        onPress={() => { navigation.navigate('Manage'); }}
        index={1}
      />
    </View>
  </ScrollView>
);

const InstagramApp = new StackNavigator({
  Home: {
    screen: Cards,
  },
  Search: {
    screen: Search,
  },
  Manage: {
    screen: Manage,
  },
}, {
  headerMode: 'none',
});

const views = {
  Home: {
    name: 'Home',
    description: 'Instagram automations and actions can help you manage followers and grow your audience.',
  },
  Search: {
    name: 'Search',
    description: 'Search people based on interests and location.',
    searchable: true,
  },
  Manage: {
    name: 'Manage',
    description: 'Manage accounts you follow.',
  },
};
