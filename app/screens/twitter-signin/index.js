import React, { Component } from 'react';
import { View, Text, TouchableHighlight, Linking, AsyncStorage } from 'react-native';
import { auth } from 'react-native-twitter';

import config from '../../config';
import styles from './styles';

export default class TwitterSignin extends Component {
  state = {
    login: '',
    password: '',
    showPassword: false,
  }

  componentDidMount() {
    Linking.canOpenURL('socialauth://twitter').then((supported) => { console.warn(supported); });
  }

  signIn = async () => {
    try {
      const twitterResponse = await auth(
                { consumerKey: config.twitterConsumerToken, consumerSecret: config.twitterConsumerSecret },
                'socialauth://twitter',
            );
      console.warn(twitterResponse.id);
      AsyncStorage.setItem('twitterTokens', JSON.stringify(twitterResponse));
    } catch (error) {
      console.warn('error');
      console.warn(error);
    }
  }

  handleSignInResult = (event) => {
    console.log(event);
    this.setState({ supported: 'some value' });
  }

  render() {
    const { supported } = this.state;
    return (
      <View>
        <Text style={supported ? { color: 'red' } : { color: 'blue' }}>Twitter</Text>
        <Text>{`${supported}`}</Text>
        <TouchableHighlight onPress={this.signIn} style={styles.signInButton}>
          <Text>Sign In With Twitter</Text>
        </TouchableHighlight>
      </View>
    );
  }
}
