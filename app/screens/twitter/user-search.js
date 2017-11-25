import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';
import UserSearchResult from '../../components/user-search-result';

export default class UserSearch extends PureComponent {
  componentWillReceiveProps(nextProps) {
    if (this.props.screenProps.searchResults && nextProps.screenProps.searchResults && nextProps.screenProps.searchResults[0].id !== this.props.screenProps.searchResults[0].id) {
      this._list.scrollToOffset({ offset: 1 });
    }
  }

  render() {
    const { searchResults, followUser, loadMore } = this.props.screenProps;
    return (
      <FlatList
        ref={(list) => { this._list = list; }}
        contentContainerStyle={{ backgroundColor: 'white' }}
        data={searchResults}
        keyExtractor={item => item.id}
        renderItem={({ item }) => renderTwitterResult(item, followUser)}
        onEndReached={loadMore}
      />
    );
  }
}

const renderTwitterResult = (item, followUser) => (<UserSearchResult user={mapTwitterUser(item)} followUser={followUser} />);

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
