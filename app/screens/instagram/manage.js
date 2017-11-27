import React, { PureComponent } from 'react';
import {
  FlatList,
  View,
  Text,
} from 'react-native';
import Interactable from 'react-native-interactable';
import * as Animatable from 'react-native-animatable';
import UserSearchResult from '../../components/user-search-result';
import colors from '../../styles/colors';

export default class Manage extends PureComponent {
  componentWillReceiveProps = (nextProps) => {
    if (nextProps.screenProps.loadFollowers && this.props.screenProps.loadFollowers == null) {
      nextProps.screenProps.loadFollowers();
    }
  }

  onSnap = async (event, user, unfollow) => {
    if (event.nativeEvent.index === 0) {
      await this[user.id].zoomOut(200);
      await this[user.id].transition({ height: 83 }, { height: 0 }, 200);
      unfollow(user, 'unfollow');
    }
  };

  renderUserResult = (item, unfollow) => (
    <Animatable.View ref={(ref) => { this[item.id] = ref; }} style={{ overflow: 'hidden' }}>
      <View style={{ position: 'absolute', right: 0, height: 83, flexDirection: 'row', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: colors.pinkAlt,
            width: 270,
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
        snapPoints={[{ x: -270, tension: 500 }, { x: 0 }]}
        onSnap={event => this.onSnap(event, item, unfollow)}
        style={{ backgroundColor: 'white' }}
        boundaries={{ left: -1000, right: 10 }}
      >
        <UserSearchResult user={{ ...item, followStatus: followerStatuses[item.relationship.incoming_status], following: true, displayName: item.full_name, profileImage: item.profile_picture, followerCount: 10 }} followUser={() => this.followUser(item.id)} />
      </Interactable.View>
    </Animatable.View>
  );

  render() {
    const { screenProps } = this.props;
    console.log(screenProps.following);
    return (
      <FlatList
        contentContainerStyle={{ backgroundColor: 'white' }}
        data={screenProps.following}
        keyExtractor={item => item.id}
        renderItem={({ item }) => this.renderUserResult(item, screenProps.unfollow)}
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
