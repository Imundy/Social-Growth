import React, { Component } from 'react';
import {
  AsyncStorage,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import SvgUri from 'react-native-svg-uri';
import colors from '../../styles/colors';
import { styles } from './styles.js';

export default class Settings extends Component {
  state = {
    user: {},
  };

  componentDidMount = async () => {
    let user = await AsyncStorage.getItem('user');
    let instagram = await AsyncStorage.getItem('currentInstagramAccount');
    let instagramAccounts = await AsyncStorage.getItem('instagramAccounts');
    let twitterAccounts = await AsyncStorage.getItem('twitterAccounts');
    let twitter = await AsyncStorage.getItem('currentTwitterAccount');

    instagramAccounts = instagramAccounts && JSON.parse(instagramAccounts);
    instagram = instagram && JSON.parse(instagram);
    twitterAccounts = twitterAccounts && JSON.parse(twitterAccounts);
    if (twitterAccounts != null) {
      twitterAccounts = twitterAccounts.map(account => ({
        ...account,
        id: account.id,
        profileImage: account.profile_image_url_https,
        displayName: account.name,
      }));
    }

    if (instagramAccounts != null) {
      instagramAccounts = instagramAccounts.map(account => ({
        ...account,
        id: account.data.id,
        profileImage: account.data.profile_picture,
        displayName: account.data.full_name,
      }));
    }

    twitter = twitter && JSON.parse(twitter);
    user = JSON.parse(user);

    this.setState({
      user,
      instagram,
      instagramAccounts,
      twitterAccounts,
      twitter,
    });
  }

  selectTwitter = async (accountId) => {
    if (accountId !== this.state.twitter.id) {
      await AsyncStorage.setItem('currentTwitterAccount', JSON.stringify(this.state.twitterAccounts.find(account => account.id === accountId)));
    }
  }

  selectInstagram = async (accountId) => {
    if (accountId !== this.state.instagram.data.id) {
      await AsyncStorage.setItem('currentInstagramAccount', JSON.stringify(this.state.instagramAccounts.find(account => account.id === accountId)));
    }
  }

  render() {
    return (
      <View style={styles.container}>
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
            <TouchableOpacity style={[styles.button, { height: 40, width: 80 }]}>
              <Text style={styles.buttonText}>Sign out</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ paddingTop: 20, paddingHorizontal: 20 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.title}>Twitter</Text>
            <TouchableOpacity style={styles.addAccount}><Text style={{ color: colors.blue }}>+ Add account</Text></TouchableOpacity>
          </View>
          {(this.state.twitterAccounts == null || this.state.twitterAccounts.length === 0) ?
            <View style={styles.row}>
              <Text style={{ fontSize: 16, color: colors.darkGrey, padding: 12 }}>No Twitter accounts</Text>
            </View> :
            this.state.twitterAccounts.map(account => <Account key={`twitter-${account.id}`} account={account} selectAccount={this.selectTwitter} selectedAccountId={this.state.twitter.id} />)
          }
        </View>
        <View style={{ paddingTop: 20, paddingHorizontal: 20 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.title}>Instagram</Text>
            <TouchableOpacity style={styles.addAccount}><Text style={{ color: colors.blue }}>+ Add account</Text></TouchableOpacity>
          </View>
          {(!this.state.instagramAccounts || this.state.instagramAccounts.length === 0) ?
            <View style={styles.row}>
              <Text style={{ fontSize: 16, color: colors.darkGrey, padding: 12 }}>No Instagram accounts</Text>
            </View> :
            this.state.instagramAccounts.map(account => <Account key={`instagram-${account.id}`} account={account} selectAccount={this.selectInstagram} selectedAccountId={this.state.instagram.data.id} />)
          }
        </View>
        <View style={{ paddingTop: 20, paddingHorizontal: 20 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.title}>Facebook</Text>
            <TouchableOpacity style={styles.addAccount}><Text style={{ color: colors.blue }}>+ Add account</Text></TouchableOpacity>
          </View>
          {(!this.state.facebookAccounts || this.state.facebookAccounts.length === 0) &&
            <View style={styles.row}>
              <Text style={{ fontSize: 16, color: colors.darkGrey, padding: 12 }}>No Facebook accounts</Text>
            </View>
          }
        </View>
      </View>
    );
  }
}

const Account = ({ account, selectAccount, selectedAccountId }) => (
  <View style={styles.account} onPress={() => { selectAccount(account.id); }}>
    <TouchableOpacity onPress={() => { selectAccount(account.id); }} style={{ flexDirection: 'row', alignItems: 'center', overflow: 'hidden', maxWidth: 250 }}>
      <View style={styles.profileImage}>
        <Image style={styles.profileImage} source={{ uri: account.profileImage }} />
      </View>
      {account.id === selectedAccountId && <SvgUri style={{ marginLeft: 12 }} width="18" height="18" source={require('../../icons/svg/green-check-icon.svg')} />}
      <Text textDecorationLine={selectedAccountId === account.id ? 'underline' : 'none'} style={styles.accountName}>{account.displayName || account.username}</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => console.log('remove account')}>
      <Text style={{ color: colors.lightGrey }}>Remove</Text>
    </TouchableOpacity>
  </View>
);
