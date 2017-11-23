import React, { Component } from 'react';
import { ScrollView, View, AsyncStorage } from 'react-native';
import { auth } from 'react-native-twitter';

import Header from '../../components/header';
import Card from '../../components/card';
import TwitterIcon from '../../icons/twitter-icon';
import config from '../../config';
import colors from '../../styles/colors';
import styles from './styles';

export default class Twitter extends Component {
  state = {
    connected: false,
    twitter: null,
  }

  async componentDidMount() {
    const twitter = await AsyncStorage.getItem('twitterTokens');
    if (twitter) {
      this.setState({ connected: true, twitter: JSON.parse(twitter) }); // eslint-disable-line
    }
  }

  signIn = async () => {
    try {
      const twitterResponse = await auth(
                { consumerKey: config.twitterConsumerToken, consumerSecret: config.twitterConsumerSecret },
                'socialauth://twitter',
            );

      AsyncStorage.setItem('twitterTokens', JSON.stringify(twitterResponse));
      this.setState({ connected: true, twitter: twitterResponse });
    } catch (error) {
      console.warn(error);
    }
  }

  render() {
    const { twitter } = this.state;
    return (
      <View style={styles.container}>
        <ScrollView>
          <Header
            title="TWITTER"
            titleSize={36}
            subtext="Twitter automations and actions can help you manage followers and grow your audience."
            connect={this.signIn}
            account={twitter ? { name: `@${twitter.name}` } : null}
          />
          <View style={styles.cardContainer}>
            <Card
              description="Search people based on interests and location."
              title="KEYWORD SEARCH"
              color={colors.bluegreen}
              logo={TwitterIcon}
              toggle={() => { this.setState({ on: !this.state.on }); }}
              onPress={() => { console.warn('card pressed'); }}
            />
          </View>
        </ScrollView>
      </View>
    );
  }
}
