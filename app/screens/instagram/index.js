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
import styles from './styles';
import config from '../../config';

const windowWidth = Dimensions.get('window').width;

export default class Instagram extends Component {
  state = {
    isLoading: false,
    accessToken: '',
    error: null,
    url: 'https://instagram.com/accounts/logout',
    view: views.Home,
  }

  componentDidMount = async () => {
    const token = await AsyncStorage.getItem('instagramToken');
    this.setState({
      accessToken: token || '',
    });

    const currentUser = await AsyncStorage.getItem('currentUserId');
    if (currentUser == null) {
      const me = await fetch(`https://api.instagram.com/v1/users/self/?access_token=${token}`).then(response => response.json());
      await AsyncStorage.setItem('currentUserId', me.data.id);
    }
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

    // eslint-disable no-undef
    fetch(`https://api.instagram.com/v1/tags/search?q=${query}&access_token=${this.state.accessToken}`)
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

  render() {
    const { view, results } = this.state;
    return (
      <View style={styles.container}>
        <Header
          title="INSTAGRAM"
          titleSize={36}
          subtext={labels.instagram}
          connect={this.state.accessToken === '' ? this.instagramOAuth : null}
          search={views[view.name].searchable ? this.search : null}
          searchTextChange={views[view.name].searchable ? this.searchTextChange : null}
        />
        {this.state.isAuthenticating && <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', position: 'absolute', justifyContent: 'center' }}>
          <View style={{ width: windowWidth, height: 250, justifyContent: 'center', alignItems: 'center' }}>
            <WebView
              style={{ width: windowWidth, height: 250 }}
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
};
