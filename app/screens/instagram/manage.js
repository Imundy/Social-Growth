import React, { Component } from 'react';
import {
  FlatList,
  View,
  Text,
} from 'react-native';
import Interactable from 'react-native-interactable';
import UserSearchResult from '../../components/user-search-result';
import colors from '../../styles/colors';

export default class Manage extends Component {
  componentDidMount() {
    this.props.screenProps.loadFollowers();
  }

  onStopDrag = (event, userId) => {
    if (event.target > 100) {
      console.log(userId);
      this.props.screenProps.unfollow(userId);
    }
  }

  renderUserResult = item => (
    <View>
      <View style={{ position: 'absolute', right: 0, height: 75, flexDirection: 'row', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: colors.pinkAlt,
            width: '80%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'flex-end',
          }}
        >
          <Text style={{ fontSize: 20, marginHorizontal: 20, color: colors.pink }}>Unfollow</Text>
        </View>
      </View>
      <Interactable.View
        horizontalOnly
        snapPoints={[{ x: 0 }]}
        onStop={event => this.onStopDrag(event, item.id)}
        style={{ backgroundColor: 'white' }}
        boundaries={{ left: -1000, right: 10 }}
      >
        <UserSearchResult user={{ ...item, followStatus: followerStatuses[item.relationship.incoming_status], following: true, displayName: item.full_name, profileImage: item.profile_picture, followerCount: 10 }} followUser={() => this.followUser(item.id)} />
      </Interactable.View>
    </View>
  )

  render() {
    const { screenProps } = this.props;
    return (
      <FlatList
        contentContainerStyle={{ backgroundColor: 'white' }}
        data={screenProps.following}
        keyExtractor={item => item.id}
        renderItem={({ item }) => this.renderUserResult(item, screenProps.followUser)}
        onEndReached={screenProps.loadMore}
      />
    );
  }
}

const followerStatuses = {
  follows: 'Following',
  requested: 'Requested',
  followed_by: 'Follows you',
};

