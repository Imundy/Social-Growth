import React, { Component } from 'react';
import { ScrollView, View, Text } from 'react-native';
import Header from '../../components/header';
import Card from '../../components/card';
import TwitterIcon from '../../icons/twitter-icon';

import colors from '../../styles/colors';
import styles from './styles';

export default class Twitter extends Component {
  state = {
    
  }
  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          <Header
            title="TWITTER"
            description="Twitter automations and actions can help you manage followers and grow your audience."
            connected={false}
            onConnect={() => {}}
            account={{ name: 'ianmundy' }}
          />
          <View style={styles.otherContainer}>
            <Card
              description="Search people based on interests and location."
              title="KEYWORD SEARCH"
              color={colors.bluegreen}
              logo={TwitterIcon}
              canToggle={true}
              on={this.state.on}
              toggle={() => { this.setState({ on: !this.state.on }); }}
              onPress={() => { console.warn('card pressed'); }}
            />
            <Text>Other</Text>
          </View>
        </ScrollView>
      </View>
    );
  }
}