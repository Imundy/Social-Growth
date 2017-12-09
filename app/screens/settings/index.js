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
import { styles } from './styles.js';

const fbRequest = new FacebookRequest();
const windowWidth = Dimensions.get('window').width;

export default class Settings extends Component {
  state = {
    user: {},
    instagramUrl: 'https://instagram.com/accounts/logout',
  };

  componentDidMount = async () => {
    let user = await AsyncStorage.getItem('user');

    this.setupInstagram();
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

    this.setState({
      twitterAccounts,
      twitter: current,
    });
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
      const user = await fbRequest.userProfile();
      facebook = { ...facebook, profileImage: user.picture.data.url, displayName: user.name };
      await AsyncStorage.setItem('currentAccount:facebook', JSON.stringify(facebook));
      await AsyncStorage.setItem('accounts:facebook', JSON.stringify([...facebookAccounts.filter(x => x.id === facebook.id.toString()), facebook]));
    }

    this.setState({
      facebook,
      facebookAccounts,
    });
  }

  setupInstagram = async () => {
    let instagram = await AsyncStorage.getItem('currentAccount:instagram');
    let instagramAccounts = await AsyncStorage.getItem('accounts:instagram');

    instagramAccounts = instagramAccounts && JSON.parse(instagramAccounts);
    instagram = instagram && JSON.parse(instagram);

    if (instagramAccounts != null) {
      instagramAccounts = instagramAccounts.map(account => ({
        ...account,
        id: account.id,
        profileImage: account.profile_picture,
        displayName: account.full_name,
      }));
    }

    this.setState({
      instagram,
      instagramAccounts,
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

  selectInstagram = async (accountId) => {
    if (accountId !== this.state.instagram.id) {
      const currentAccount = this.state.instagramAccounts.find(account => account.id === accountId);
      await AsyncStorage.setItem('currentAccount:instagram', JSON.stringify(currentAccount));
      this.setState({
        instagram: currentAccount,
      });
    }
  }

  signOut = async () => {
    try {
      await AsyncStorage.removeItem('currentAccount:twitter');
      await AsyncStorage.removeItem('currentAccount:instagram');
      await AsyncStorage.removeItem('currentAccount:facebook');
      await AsyncStorage.removeItem('accounts:facebook');
      await AsyncStorage.removeItem('accounts:instagram');
      await AsyncStorage.removeItem('accounts:twitter');
      await AsyncStorage.removeItem('user');
      this.props.navigation.navigate('Home');
    } catch (error) {
      console.log(error);
    }
  }

  addFacebookAccount = async () => {
    const result = await LoginManager.logInWithPublishPermissions(['manage_pages', 'publish_pages']);
    const { facebookAccounts } = this.state;

    if (!result.isCancelled) {
      const token = await AccessToken.getCurrentAccessToken();
      const user = await fbRequest.userProfile();
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
        tokens: [
          twitterResponse.accessToken,
          twitterResponse.accessTokenSecret,
        ],
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

  addInstagramAccount = async (accessToken) => {
    try {
      const { instagramAccounts } = this.state;
      const me = await fetch(`https://api.instagram.com/v1/users/self/?access_token=${accessToken}`).then(response => response.json());
      const newAccount = {
        ...me.data,
        accessToken,
        id: me.data.id,
        profileImage: me.data.profile_picture,
        displayName: me.data.full_name,
        tokens: [accessToken],
      };

      if (instagramAccounts && instagramAccounts.find(account => account.id === newAccount.id)) {
        return;
      }

      await this.storeAccounts(newAccount, 'instagram');
    } catch (error) {
      console.log(error);
    }
  }

  removeAccount = async (accountId, social) => {
    try {
      let accounts = [...(this.state[`${social}Accounts`] || [])];
      const account = accounts.find(acc => acc.id === accountId);
      accounts = accounts.filter(acc => acc.id !== accountId);

      const response = await fetch('http://localhost:3000/api/social/accounts/remove', {
        method: 'POST',
        headers: {
          Authorization: `jwt ${this.state.user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.state.user.userId,
          accountId: account.accountId,
        }),
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error('Request failed');
      }

      await AsyncStorage.setItem(`accounts:${social}`, JSON.stringify(accounts));
      this.setState({ [`${social}Accounts`]: accounts });
      if (this.state[social].id === accountId) {
        this.setState({ [social]: accounts.length !== 0 ? accounts[0] : null });
        if (accounts.length !== 0) {
          await AsyncStorage.setItem(`currentAccount:${social}`, accounts[0]);
        } else {
          await AsyncStorage.removeItem(`currentAccount:${social}`);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  storeAccounts = async (newAccount, social) => {
    try {
      const accounts = [...(this.state[`${social}Accounts`] || [])];

      if (accounts.find(x => x.id === newAccount.id)) {
        return;
      }

      const response = await fetch('http://localhost:3000/api/social/accounts/add', {
        method: 'POST',
        headers: {
          Authorization: `jwt ${this.state.user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.state.user.userId,
          tokens: newAccount.tokens,
          type: social,
          socialAccountId: newAccount.id,
        }),
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

  onLoadInstagram = () => {
    this.setState({
      instagramUrl: `https://instagram.com/oauth/authorize/?client_id=${config.instagramToken}&redirect_uri=${config.instagramRedirect}&response_type=token&scope=public_content+follower_list+relationships`,
    });
  }

  onInstagramNavigationStateChange = async (event) => {
    const token = event.url.split('access_token')[1];
    if (token != null) {
      this.setState({
        isAuthenticatingInstagram: false,
      });
      await this.addInstagramAccount(token.substring(1));
      clearTimeout(this.timeout);
    }

    if (event.url.indexOf('https://www.instagram.com/accounts/login/') === 0) {
      clearTimeout(this.timeout);
    }

    if (this.timeout == null) {
      this.timeout = setTimeout(() => {
        this.setState({
          isAuthenticatingInstagram: false,
          error: 'timeout',
        });
      }, 10000);
    }
  }

  authInstagram = () => {
    this.setState({
      isAuthenticatingInstagram: true,
      instagramUrl: 'https://instagram.com/accounts/logout',
    });
  }

  render() {
    if (this.state.isAuthenticatingInstagram) {
      return (
        <View style={{ top: 0, left: 0, zIndex: 2, width: '100%', height: '100%', backgroundColor: 'white', position: 'absolute', justifyContent: 'center' }}>
          <View style={{ width: this.state.instagramUrl.indexOf('authorize') !== -1 ? windowWidth : 0, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <WebView
              style={{ width: this.state.instagramUrl.indexOf('authorize') === -1 ? 0 : windowWidth, height: '100%', marginTop: 72 }}
              source={{ uri: this.state.instagramUrl }}
              ref={(ref) => { this.webview = ref; }}
              onNavigationStateChange={this.onInstagramNavigationStateChange}
              onLoad={this.onLoadInstagram}
            />
            <TouchableOpacity style={styles.cancel} onPress={() => { this.setState({ isAuthenticatingInstagram: false }); }}>
              <Text style={{ color: 'white', fontSize: 20 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={{ width: 40, height: 40, position: 'absolute', top: 24, left: 20 }} onPress={() => this.props.navigation.navigate('DrawerOpen')} >
            <SvgUri width="40" height="40" source={require('../../icons/svg/ic_menu_black_24px.svg')} />
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
            <Text style={styles.title}>Instagram</Text>
            <TouchableOpacity style={styles.addAccount} onPress={this.authInstagram}><Text style={{ color: colors.blue }}>+ Add account</Text></TouchableOpacity>
          </View>
          {(!this.state.instagramAccounts || this.state.instagramAccounts.length === 0) ?
            <View style={styles.row}>
              <Text style={{ fontSize: 16, color: colors.darkGrey, padding: 12 }}>No Instagram accounts</Text>
            </View> :
            this.state.instagramAccounts.map(account =>
              <Account key={`instagram-${account.id}`} removeAccount={this.removeAccount} social="instagram" account={account} selectAccount={this.selectInstagram} selectedAccountId={this.state.instagram.id} />)
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
      {account.id === selectedAccountId && <SvgUri width="18" height="18" source={require('../../icons/svg/green-check-icon.svg')} />}
      <Text textDecorationLine={selectedAccountId === account.id ? 'underline' : 'none'} style={styles.accountName}>{account.displayName || account.username}</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => removeAccount(account.id, social)}>
      <Text style={{ color: colors.lightGrey }}>Remove</Text>
    </TouchableOpacity>
  </View>
);
