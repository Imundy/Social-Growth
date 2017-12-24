import React, { Component } from 'react';
import {
  AsyncStorage,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  WebView,
} from 'react-native';
import twitter, { auth } from 'react-native-twitter';
import SvgUri from 'react-native-svg-uri';
import { LoginManager, AccessToken } from 'react-native-fbsdk';
import { FacebookRequest } from '../util';
import colors from '../../styles/colors';
import config from '../../config';
import simplyGrowClient from '../../clients/simply-grow-client';
import { styles } from './styles.js';

// Icons
import BlackMenuIcon from '../../icons/svg/ic_menu_black_24px.js';
import GreenCheckIcon from '../../icons/svg/green-check-icon.js';

const fbRequest = new FacebookRequest();
const windowWidth = Dimensions.get('window').width;

export default class Settings extends Component {
  state = {
    user: {},
    instagramUrl: 'https://instagram.com/accounts/logout',
  };

  componentDidMount = async () => {
    let user = await AsyncStorage.getItem('user');

    this.setupTwitter();
    this.setupFacebook();

    user = JSON.parse(user);
    this.setState({
      user,
    });
  }

  setupTwitter = async () => {
    let twitterAccounts = await AsyncStorage.getItem('accounts:twitter');
    let current = await AsyncStorage.getItem('currentAccount:twitter');

    twitterAccounts = twitterAccounts && JSON.parse(twitterAccounts);
    current = current && JSON.parse(current);


    await this.setState({
      twitterAccounts,
      twitter: current,
    });

    if (Array.isArray(current.tokens)) {
      const result = {};
      result.accessToken = current.tokens[0];
      result.accessTokenSecret = current.tokens[1];
      current.tokens = result;

      await this.removeAccount(current.id, 'twitter');
      await this.storeAccounts(current, 'twitter', true);
    }
  }

  setupFacebook = async () => {
    let facebookAccounts = await AsyncStorage.getItem('accounts:facebook');
    let facebook = await AsyncStorage.getItem('currentAccount:facebook');
    if (facebook == null && facebookAccounts == null) {
      return;
    }

    facebook = facebook && JSON.parse(facebook);
    facebookAccounts = facebookAccounts && JSON.parse(facebookAccounts);

    if (facebook != null && facebook.profileImage != null) {
      const user = await fbRequest.userProfile(facebook.tokens[0]);
      facebook = { ...facebook, profileImage: user.picture.data.url, displayName: user.name };
      await AsyncStorage.setItem('currentAccount:facebook', JSON.stringify(facebook));
      await AsyncStorage.setItem('accounts:facebook', JSON.stringify([...facebookAccounts.filter(x => x.id === facebook.id.toString()), facebook]));
    }

    this.setState({
      facebook,
      facebookAccounts,
    });
  }

  selectTwitter = async (accountId) => {
    if (accountId !== this.state.twitter.id) {
      const currentAccount = this.state.twitterAccounts.find(account => account.id === accountId);
      await AsyncStorage.setItem('currentAccount:twitter', JSON.stringify(currentAccount));
      this.setState({
        twitter: currentAccount,
      });
    }
  }

  signOut = async () => {
    try {
      await AsyncStorage.removeItem('currentAccount:twitter');
      await AsyncStorage.removeItem('currentAccount:facebook');
      await AsyncStorage.removeItem('accounts:facebook');
      await AsyncStorage.removeItem('accounts:twitter');
      await AsyncStorage.removeItem('user');
      this.props.navigation.navigate('Home');
    } catch (error) {
      console.log(error);
    }
  }

  addFacebookAccount = async () => {
    await LoginManager.setLoginBehavior('web');
    await LoginManager.logOut();
    const result = await LoginManager.logInWithPublishPermissions(['manage_pages', 'publish_pages', 'publish_actions']);
    const { facebookAccounts } = this.state;

    if (!result.isCancelled) {
      const token = await AccessToken.getCurrentAccessToken();
      const user = await fbRequest.userProfile(token.accessToken);
      const newAccount = { ...user, accessToken: token.accessToken, profileImage: user.picture.data.url, displayName: user.name, tokens: [token.accessToken] };
      await AsyncStorage.setItem('currentAccount:facebook', JSON.stringify(newAccount));
      await AsyncStorage.setItem('accounts:facebook', JSON.stringify([...(facebookAccounts || []).filter(x => x.id === newAccount.id.toString()), newAccount]));
      await this.storeAccounts(newAccount, 'facebook');
    }
  }

  addTwitterAccount = async () => {
    try {
      let twitterResponse = await auth(
          { consumerKey: config.twitterConsumerToken, consumerSecret: config.twitterConsumerSecret },
          'socialauth://twitter',
      );

      twitterResponse = {
        ...twitterResponse,
        id: twitterResponse.id,
        tokens: {
          accessToken: twitterResponse.accessToken,
          accessTokenSecret: twitterResponse.accessTokenSecret,
        },
      };

      const clients = twitter({
        consumerKey: config.twitterConsumerToken,
        consumerSecret: config.twitterConsumerSecret,
        accessToken: twitterResponse.accessToken,
        accessTokenSecret: twitterResponse.accessTokenSecret,
      });

      const currentAccountInfo = await clients.rest.get('users/lookup', { user_id: twitterResponse.id, stringify_ids: true });

      await this.storeAccounts({ ...twitterResponse, displayName: currentAccountInfo[0].name, profileImage: currentAccountInfo[0].profile_image_url_https }, 'twitter');
    } catch (error) {
      console.warn(error);
    }
  }

  removeAccount = async (accountId, social) => {
    try {
      let accounts = [...(this.state[`${social}Accounts`] || [])];
      const account = accounts.find(acc => acc.id === accountId);
      accounts = accounts.filter(acc => acc.id !== accountId);

      const response = await simplyGrowClient.removeAccount({
        jwt: this.state.user.token,
        userId: this.state.user.userId,
        accountId: account.accountId,
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error('Request failed');
      }

      await AsyncStorage.setItem(`accounts:${social}`, JSON.stringify(accounts));
      this.setState({ [`${social}Accounts`]: accounts });
      if (this.state[social].id === accountId) {
        this.setState({ [social]: accounts.length !== 0 ? accounts[0] : null });
        if (accounts.length !== 0) {
          await AsyncStorage.setItem(`currentAccount:${social}`, JSON.stringify(accounts[0]));
        } else {
          await AsyncStorage.removeItem(`currentAccount:${social}`);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  storeAccounts = async (newAccount, social, update = false) => {
    try {
      const accounts = [...(this.state[`${social}Accounts`] || [])];

      if (accounts.find(x => x.id === newAccount.id) && !update) {
        return;
      }

      const response = await simplyGrowClient.addAccount({
        jwt: this.state.user.token,
        tokens: newAccount.tokens,
        userId: this.state.user.userId,
        type: social,
        socialAccountId: newAccount.id,
      });

      const { accountId } = await response.json();
      const resultAccount = { ...newAccount, accountId };
      accounts.push(resultAccount);

      if (response.status < 200 || response.status >= 300) {
        throw new Error('Request failed');
      }

      await AsyncStorage.setItem(`accounts:${social}`, JSON.stringify(accounts));
      await AsyncStorage.setItem(`currentAccount:${social}`, JSON.stringify(resultAccount));
      this.setState({
        [`${social}Accounts`]: accounts,
        [social]: newAccount,
      });
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={{ width: 40, height: 40, position: 'absolute', top: 24, left: 20 }} onPress={() => this.props.navigation.navigate('DrawerOpen')} >
            <SvgUri width="40" height="40" svgXmlData={BlackMenuIcon} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Settings</Text>
        </View>
        <View style={{ paddingTop: 20, paddingHorizontal: 20 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.title}>Account</Text>
          </View>
          <View style={styles.row}>
            <Text style={{ fontSize: 16, color: colors.darkGrey }}>{this.state.user && this.state.user.email}</Text>
            <TouchableOpacity style={[styles.button, { height: 40, width: 80 }]} onPress={this.signOut}>
              <Text style={styles.buttonText}>Sign out</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ paddingTop: 20, paddingHorizontal: 20 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.title}>Twitter</Text>
            <TouchableOpacity style={styles.addAccount} onPress={this.addTwitterAccount}><Text style={{ color: colors.blue }}>+ Add account</Text></TouchableOpacity>
          </View>
          {(this.state.twitterAccounts == null || this.state.twitterAccounts.length === 0) ?
            <View style={styles.row}>
              <Text style={{ fontSize: 16, color: colors.darkGrey, padding: 12 }}>No Twitter accounts</Text>
            </View> :
            this.state.twitterAccounts.map(account =>
              <Account key={`twitter-${account.id}`} removeAccount={this.removeAccount} social="twitter" account={account} selectAccount={this.selectTwitter} selectedAccountId={this.state.twitter.id} />)
          }
        </View>
        <View style={{ paddingTop: 20, paddingHorizontal: 20 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.title}>Facebook</Text>
            <TouchableOpacity style={styles.addAccount} onPress={this.addFacebookAccount}><Text style={{ color: colors.blue }}>+ Add account</Text></TouchableOpacity>
          </View>
          {(!this.state.facebookAccounts || this.state.facebookAccounts.length === 0) ?
            <View style={styles.row}>
              <Text style={{ fontSize: 16, color: colors.darkGrey, padding: 12 }}>No Facebook accounts</Text>
            </View> :
            this.state.facebookAccounts.map(account =>
              <Account key={`instagram-${account.id}`} removeAccount={this.removeAccount} social="facebook" account={account} selectAccount={this.selectFacebook} selectedAccountId={this.state.facebook.id} />)
          }
        </View>
      </ScrollView>
    );
  }
}

const Account = ({ account, selectAccount, selectedAccountId, removeAccount, social }) => (
  <View style={styles.account} onPress={() => { selectAccount(account.id); }}>
    <TouchableOpacity onPress={() => { selectAccount(account.id); }} style={{ flexDirection: 'row', alignItems: 'center', overflow: 'hidden', maxWidth: 250 }}>
      <View style={styles.profileImage}>
        <Image style={styles.profileImage} source={{ uri: account.profileImage }} />
      </View>
      {account.id === selectedAccountId && <SvgUri width="18" height="18" svgXmlData={GreenCheckIcon} />}
      <Text textDecorationLine={selectedAccountId === account.id ? 'underline' : 'none'} style={styles.accountName}>{account.displayName || account.username}</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => removeAccount(account.id, social)}>
      <Text style={{ color: colors.lightGrey }}>Remove</Text>
    </TouchableOpacity>
  </View>
);
