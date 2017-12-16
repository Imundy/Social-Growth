import React, { PureComponent } from 'react';
import { FlatList, View, Image, Text, TouchableOpacity } from 'react-native';
import SvgUri from 'react-native-svg-uri';
import styles from './styles';

export default class TweetSearch extends PureComponent {
  componentWillReceiveProps(nextProps) {
    if (this.props.screenProps.searchResults && nextProps.screenProps.searchResults && nextProps.screenProps.searchResults[0].id !== this.props.screenProps.searchResults[0].id) {
      this._list.scrollToOffset({ offset: 1 });
    }
  }

  render() {
    const { tweetResults, followUser, unfollowUser, toggleFavorite, toggleRetweet, loadMore, hasMoreSearchResults } = this.props.screenProps;
    return (
      <FlatList
        ref={(list) => { this._list = list; }}
        contentContainerStyle={{ backgroundColor: 'white' }}
        data={tweetResults}
        keyExtractor={item => item.id}
        renderItem={({ item }) => renderTwitterResult({ tweet: mapTweet(item), followUser, unfollowUser, toggleFavorite, toggleRetweet })}
        onEndReached={hasMoreSearchResults ? loadMore : null}
      />
    );
  }
}

const renderTwitterResult = ({ tweet, followUser, unfollowUser, toggleFavorite, toggleRetweet }) => (
  <View style={styles.tweetSearch.tweetContainer}>
    <View style={styles.tweetSearch.contentContainer}>
      <Image
        source={{ uri: tweet.user.profileImage }}
        style={styles.tweetSearch.profileImage}
      />
      <View style={styles.tweetSearch.content}>
        <View style={styles.tweetSearch.name}>
          <Text style={styles.tweetSearch.displayName}>{tweet.user.displayName}</Text>
          <Text style={styles.tweetSearch.handle}>@{tweet.user.name}</Text>
        </View>
        <Text style={styles.tweetContent}>{tweet.content}</Text>
      </View>

      <TouchableOpacity
        style={styles.tweetSearch.followActionContainer}
        onPress={() => {
          if (tweet.user.following) {
            unfollowUser(tweet.user.id);
          } else {
            followUser(tweet.user.id);
          }
        }}
      >
        { tweet.user.following ?
          <Text style={{ color: 'white' }}>Following</Text> :
          <Text style={{ color: 'white' }}>Follow</Text>
      }
      </TouchableOpacity>
    </View>
    <View style={styles.tweetSearch.actionsContainer}>
      <TouchableOpacity style={styles.tweetSearch.actionButton} onPress={() => toggleFavorite(tweet.id, tweet.favorited)}>
        <SvgUri
          width="20"
          height="20"
          source={tweet.favorited ?
            require('../../icons/svg/favorite-pink.svg') :
            require('../../icons/svg/favorite-border-pink.svg')}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.tweetSearch.actionButton} onPress={() => toggleRetweet(tweet.id, tweet.retweeted)}>
        <SvgUri
          width="20"
          height="20"
          source={tweet.retweeted ?
            require('../../icons/svg/retweet-green.svg') :
            require('../../icons/svg/retweet-dark.svg')}
        />
      </TouchableOpacity>
    </View>
  </View>);

const mapTweet = tweet => ({
  id: tweet.id_str,
  content: tweet.text,
  date: tweet.created_at,
  favorited: tweet.favorited,
  retweeted: tweet.retweeted,
  media: tweet.entities.media ? tweet.entities.media.map(m => ({
    url: m.media_url_https,
    displayUrl: m.display_url,
    type: m.type,
  })) : [],
  user: mapTweetUser(tweet.user),
});

const mapTweetUser = user => ({
  id: user.id_str,
  name: user.screen_name,
  displayName: user.name,
  followerCount: user.followers_count,
  friendCount: user.friends_count,
  profileImage: user.profile_image_url_https,
  following: user.following,
  bio: user.description,
  verified: user.verified,
});
