import React, { Component } from 'react';
import { ScrollView, View, AsyncStorage } from 'react-native';
import { StackNavigator } from 'react-navigation';
import SvgUri from 'react-native-svg-uri';
import { LoginManager } from 'react-native-fbsdk';

import Header from '../../components/header';
import Card from '../../components/card';
import SwitchAccounts from '../../components/switch-accounts';
import config from '../../config';
import colors from '../../styles/colors';
import styles from './styles';

export default class Facebook extends Component {
  static navigationOptions = {
    drawerLabel: 'Facebook',
    drawerIcon: () => (
      <SvgUri width="25" height="25" source={require('../../icons/svg/white-facebook-logo.svg')} />
    ),
  };

  state = {
    connected: false,
    facebookAccounts: [],
    currentAccount: null,
    view: views.Home,
  }

  async componentDidMount() {
    let facebookAccounts = await AsyncStorage.getItem('facebookAccounts');
    if (facebookAccounts) {
      const currentAccount = await AsyncStorage.getItem('currentFacebookAccount');
      facebookAccounts = JSON.parse(facebookAccounts);
      this.setState({ connected: true, facebookAccounts, currentAccount: currentAccount ? JSON.parse(currentAccount) : facebookAccounts[0] }, this.createfacebookClient); // eslint-disable-line
    }
    this.props.navigation.navigate('SwitchAccounts');
  }

  createfacebookClient = () => {
    if (!this.state.currentAccount) {
      return;
    }

    /*const { accessToken, accessTokenSecret } = this.state.currentAccount;
    const clients = facebook({
      consumerKey: config.facebookConsumerToken,
      consumerSecret: config.facebookConsumerSecret,
      accessToken,
      accessTokenSecret,
    });
    this._facebookClient = clients.rest;
    if (!this.state.currentAccount.screen_name) {
      this.getCurrentAccountInfo();
    }*/
  }

  signIn = () => {
    //LoginManager.logInWithPublishPermissions(['public_profile, manage_pages, publish_pages, pages_show_list, user_posts, user_photos'])
    LoginManager.logInWithPublishPermissions(['manage_pages']).then((result) => {
        if (result.isCancelled) {
          alert('Login cancelled');
        } else {
          alert('Login success with permissions: ' + result.grantedPermissions.toString());
        }
      },
      (error) => {
      console.log(error);
      });
  }

  storeAccounts = async (facebookAccounts, currentAccount) => {
    const accountsPromise = AsyncStorage.setItem('facebookAccounts', JSON.stringify(facebookAccounts));
    const currentAccountPromise = AsyncStorage.setItem('currentfacebookAccount', JSON.stringify(currentAccount));
    return Promise.all(accountsPromise, currentAccountPromise);
  }

  searchTextChange = (text) => {
    this.setState({ searchText: text });
  }

  navigationStateChange = (prevState, currentState) => {
    this.view = views[currentState.routes[currentState.index].routeName];

    this.setState({
      view: views[currentState.routes[currentState.index].routeName],
    });
  }

  render() {
    const { currentAccount, view } = this.state;

    return (
      <View style={styles.container}>
        <Header
          title="Facebook"
          titleSize={36}
          subtext={views[view.name].description}
          connect={view.name === views.Home.name ? this.signIn : null}
          account={currentAccount ? { name: `@${currentAccount.name}` } : null}
          switchAccounts={() => {
            this._navigator._navigation.navigate('SwitchAccounts');
          }}
          navigate={view.name === 'UserSearch' || view.name === 'UnfollowUsers' || view.name === 'SwitchAccounts' ? () => this._navigator._navigation.goBack() : () => this.props.navigation.navigate('DrawerOpen')}
          showMenu={view.name === 'UserSearch' || view.name === 'UnfollowUsers' || view.name === 'SwitchAccounts'}
          ref={(ref) => { this.header = ref; }}
        />
        <FacebookApp
          ref={(ref) => { this._navigator = ref; }}
          onNavigationStateChange={this.navigationStateChange}
          screenProps={{}}
        />
      </View>
    );
  }
}

const Cards = ({ navigation }) => (
  <ScrollView>
    <View style={styles.cardContainer}>
      <Card
        description={views.AutoLikeReviews.description}
        title="AUTO LIKE REVIEWS"
        color={colors.blueGreen}
        logo={() => (<SvgUri width="25" height="25" source={require('../../icons/svg/white-facebook-logo.svg')} />)}
        toggle={() => {}}
        onPress={() => { navigation.navigate('UserSearch'); }}
        index={0}
      />
      <Card
        description={views.AutoLikeComments.description}
        title="AUTO LIKE COMMENTS"
        color={colors.blue}
        logo={() => (<SvgUri width="25" height="25" source={require('../../icons/svg/white-facebook-logo.svg')} />)}
        toggle={() => {}}
        onPress={() => { navigation.navigate('UnfollowUsers'); }}
        index={1}
      />
      <Card
        description={views.AutoHideComments.description}
        title="AUTO HIDE COMMENTS"
        color={colors.pink}
        logo={() => (<SvgUri width="25" height="25" source={require('../../icons/svg/white-facebook-logo.svg')} />)}
        toggle={() => {}}
        onPress={() => { navigation.navigate('UnfollowUsers'); }}
        index={1}
      />
    </View>
  </ScrollView>
);

const EmptyThing = () => (<View style={{height: 50, width: 50, backgroundColor: 'red'}} />)

const FacebookApp = new StackNavigator({
  Home: {
    screen: Cards,
  },
  AutoLikeReviews: {
    screen: EmptyThing,
  },
  AutoLikeComments: {
    screen: EmptyThing,
  },
  AutoHideComments: {
    screen: EmptyThing,
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
    description: 'facebook automations and actions can help you manage followers and grow your audience.',
  },
  AutoLikeReviews: {
    name: 'AutoLikeReviews',
    description: 'Like reviews that meet a minimum rating.',
  },
  AutoLikeComments: {
    name: 'AutoLikeComments',
    description: 'Automatically like criteria-matched comments',
  },
  AutoHideComments: {
    name: 'AutoHideComments',
    description: 'Hide comments with a keyword.',
  },
  SwitchAccounts: {
    name: 'SwitchAccounts',
    description: 'Select which account to use.',
  },
};
