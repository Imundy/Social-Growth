import React, { Component } from 'react';
import { ScrollView, View, AsyncStorage } from 'react-native';
import twitter, { auth } from 'react-native-twitter';
import { StackNavigator } from 'react-navigation';
import SvgUri from 'react-native-svg-uri';

import Header from '../../components/header';
import Card from '../../components/card';
import UserSearch from './user-search';
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

  search = async () => {
    const response = await this._twitterClient.get('users/search', { q: this.state.searchText });
    this.setState({ searchResults: response, page: 1 });
  }

  loadMoreSearchResults = async () => {
    const response = await this._twitterClient.get('users/search', { q: this.state.searchText, page: this.state.page + 1 });
    this.setState(state => ({ searchResults: [...state.searchResults, ...response], page: state.page + 1 }));
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
    const { twitterTokens, view, searchResults, searchText } = this.state;

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
};
