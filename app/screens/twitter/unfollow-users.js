import React, { PureComponent } from 'react';
import { View, Text, FlatList } from 'react-native';
import UserUnfollowCard from '../../components/user-unfollow-card';

export default class UnfollowUsers extends PureComponent {
  componentDidMount() {
    this.props.screenProps.loadUnfollowers();
  }

  render() {
    const { screenProps } = this.props;
    if (screenProps.loading) {
      return (
        <View>
          <Text> Loading... </Text>
        </View>
      );
    }

    return (
      <FlatList
        ref={(list) => { this._list = list; }}
        contentContainerStyle={{ backgroundColor: 'white' }}
        data={screenProps.nonFollowers}
        keyExtractor={item => item.id}
        renderItem={({ item }) => renderTwitterResult(item, screenProps.unfollowUser)}
      />
    );
  }
}

const renderTwitterResult = (item, unfollowUser) => (<UserUnfollowCard user={mapTwitterUser(item)} unfollowUser={unfollowUser} />);

const mapTwitterUser = user => ({
  id: user.id,
  name: user.screen_name,
  displayName: user.name,
  followerCount: user.followers_count,
  profileImage: user.profile_image_url_https,
  following: user.following,
  bio: user.description,
  verified: user.verified,
});
