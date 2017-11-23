import React, { Component } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  WebView,
} from 'react-native';

import InstagramSearch from '../instagram/search';
import Header from '../../components/header';
import styles from './styles';
import config from '../../config';

export default class InstagramSignin extends Component {
  state = {
    isLoading: false,
    accessToken: '',
    error: null,
  }

  instagramOAuth = () => {
    this.setState({
      isLoading: true,
    });
  }

  onNavigationStateChange = (event) => {
    const token = event.url.split('access_token')[1];
    if (token != null) {
      this.setState({
        accessToken: token.substring(1),
        isLoading: false,
      });
      clearTimeout(this.timeout);
    }

    if (this.timeout == null) {
      this.timeout = setTimeout(() => {
        this.setState({
          isLoading: false,
          error: 'timeout',
        });
      }, 20000);
    }
  }

  render() {
    if (this.state.accessToken !== '') {
      return (
        <InstagramSearch />
      );
    }

    return (
      <View style={styles.container}>
        <Header
          title="INSTAGRAM"
          headerSize={36}
          subtext={labels.instagram}
          connect={this.instagramOAuth}
        />
        {this.state.isLoading &&
          <View style={{ width: '80%', height: 300 }}>
            <WebView
              style={{ width: '100%', height: '100%' }}
              source={{ uri: `https://instagram.com/oauth/authorize/?client_id=${config.instagramToken}&redirect_uri=${config.instagramRedirect}&response_type=token` }}
              ref={(ref) => { this.webview = ref; }}
              onNavigationStateChange={this.onNavigationStateChange}
            />
          </View>
        }
      </View>
    );
  }
}

const labels = {
  instagram: 'Instagram automations and actions can help you manage followers and grow you audience.',
};
