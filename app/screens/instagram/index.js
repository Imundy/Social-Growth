import React, { Component } from 'react';
import {
  AsyncStorage,
  Dimensions,
  ScrollView,
  View,
  WebView,
} from 'react-native';
import { StackNavigator } from 'react-navigation';
import SvgUri from 'react-native-svg-uri';

import colors from '../../styles/colors';
import Card from '../../components/card';
import Header from '../../components/header';
import Search from './search';
import Manage from './manage';
import styles from './styles';
import config from '../../config';
import { fetchUtil, loadKnownFollowers, addKnownFollowers, removeKnownFollowing, addKnownFollowing } from './util';

const windowWidth = Dimensions.get('window').width;

export default class Instagram extends Component {
  state = {
    isLoading: false,
    accessToken: '',
    error: null,
    url: 'https://instagram.com/accounts/logout',
    view: views.Home,
    currentPostCount: 0,
    currentRequestCount: 0,
  }

  componentDidMount = async () => {
    const token = await AsyncStorage.getItem('instagramToken');
    this.setState({
      accessToken: token || '',
    });


    const currentUser = await AsyncStorage.getItem('currentUserId');
    if (currentUser == null && token != null) {
      const me = await this.networkRequest(`https://api.instagram.com/v1/users/self/?access_token=${token}`).then(response => response.json());
      await AsyncStorage.setItem('currentUserId', me.data.id);
    }

    const storedRequestValue = await AsyncStorage.getItem('instagram:requestCount');
    const storedPostValue = await AsyncStorage.getItem('instagram:postCount');

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

  instagramOAuth = () => {
    this.setState({
      isAuthenticating: true,
    });
  }

  onNavigationStateChange = async (event) => {
    const token = event.url.split('access_token')[1];
    if (token != null) {
      await AsyncStorage.setItem('instagramToken', token.substring(1));
      this.setState({
        accessToken: token.substring(1),
        isAuthenticating: false,
      });
      clearTimeout(this.timeout);
    }

    if (this.timeout == null) {
      this.timeout = setTimeout(() => {
        this.setState({
          isAuthenticating: false,
          error: 'timeout',
        });
      }, 10000);
    }
  }

  stackStateChange = (prevState, currentState) => {
    this.setState({
      view: views[currentState.routes[currentState.index].routeName],
    });
  }

  auth = () => {
    this.setState({
      url: `https://instagram.com/oauth/authorize/?client_id=${config.instagramToken}&redirect_uri=${config.instagramRedirect}&response_type=token&scope=public_content+follower_list+relationships`,
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

    this.networkRequest(`https://api.instagram.com/v1/tags/search?q=${query}&access_token=${this.state.accessToken}`)
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
          this.networkRequest(`https://api.instagram.com/v1/users/${user.id}/relationship?access_token=${this.state.accessToken}`)
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
    const response = await this.networkRequest(`https://api.instagram.com/v1/users/self/follows?count=500&access_token=${this.state.accessToken}`).then(res => res.json());
    const results = await this.addRelationship(response.data);
    this.setState({
      following: results,
    });
  }

  updateFollow = async (userId, action) => {
    const form = new FormData();
    form.append('action', action);
    await this.networkRequest(`https://api.instagram.com/v1/users/${userId}/relationship?access_token=${this.state.accessToken}&action=follow`, { method: 'POST', body: form });
    switch (action) {
      case 'unfollow':
        await removeKnownFollowing(userId);
        this.setState({
          following: this.state.following.filter(user => user.id !== userId),
        });
        break;
      case 'follow':
        await addKnownFollowing(userId);
        break;
      default:
        break;
    }
  }

  render() {
    const { view, results } = this.state;
    return (
      <View style={styles.container}>
        <Header
          title="INSTAGRAM"
          titleSize={36}
          subtext={`${labels.instagram} ${this.state.currentPostCount} ${this.state.currentRequestCount}`}
          connect={this.state.accessToken === '' ? this.instagramOAuth : null}
          search={views[view.name].searchable ? this.search : null}
          searchTextChange={views[view.name].searchable ? this.searchTextChange : null}
        />
        {this.state.isAuthenticating && <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', position: 'absolute', justifyContent: 'center' }}>
          <View style={{ width: windowWidth, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <WebView
              style={{ width: windowWidth, height: '100%' }}
              source={{ uri: this.state.url }}
              ref={(ref) => { this.webview = ref; }}
              onNavigationStateChange={this.onNavigationStateChange}
              onLoad={this.auth}
            />
          </View>
        </View>}
        <InstagramApp
          onNavigationStateChange={this.stackStateChange}
          screenProps={{
            name: views[view.name].name,
            description: views[view.name].description,
            searchResults: results,
            loadMore: this.loadMoreSearchResults,
            followUser: this.follow,
            isSearchingTags: this.state.isSearching,
            accessToken: this.state.accessToken,
            request: this.networkRequest,
            following: this.state.following,
            loadFollowers: this.loadFollowers,
            unfollow: this.updateFollow,
            follow: this.updateFollow,
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
        description={views.Search.description}
        title="KEYWORD SEARCH"
        color={colors.blueGreen}
        logo={() => (<SvgUri width="25" height="25" source={require('../../icons/svg/instagram-logo.svg')} />)}
        toggle={() => {}}
        onPress={() => { navigation.navigate('Search'); }}
      />
      <Card
        description={views.Manage.description}
        title="MANAGE AUDIENCE"
        color={colors.blueGreen}
        logo={() => (<SvgUri width="25" height="25" source={require('../../icons/svg/instagram-logo.svg')} />)}
        toggle={() => {}}
        onPress={() => { navigation.navigate('Manage'); }}
      />
    </View>
  </ScrollView>
);

const labels = {
  instagram: 'Instagram automations and actions can help you manage followers and grow you audience.',
};

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
