import React, { PureComponent } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import SvgUri from 'react-native-svg-uri';

import styles from './styles';

export default class UserUnfollowCard extends PureComponent {
  static propTypes = {
    user: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      displayName: PropTypes.string.isRequired,
      followerCount: PropTypes.number.isRequired,
      profileImage: PropTypes.string.isRequired,
      following: PropTypes.bool,
      verified: PropTypes.bool,
      bio: PropTypes.string,
    }).isRequired,
    unfollowUser: PropTypes.func.isRequired,
  }

  state = {};

  renderFollowing = (user, unfollowUser) => {
    if (!user.following) {
      return (<Text style={styles.following}>Not Following</Text>);
    }

    return (
      <TouchableOpacity onPress={() => unfollowUser(user.id)}>
        <Text style={styles.unfollowButton}>Unfollow</Text>
      </TouchableOpacity>);
  }

  render() {
    const { user, unfollowUser } = this.props;
    return (
      <View style={styles.cardContainer}>
        <Image
          style={styles.profilePicture}
          source={{ uri: user.profileImage }}
        />
        <View style={styles.profileInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.profileName}>{user.displayName}</Text>
            {user.verified ? <SvgUri source={require('../../icons/svg/blue-verified-check.svg')} height="16" width="16" /> : null}
          </View>
          <Text style={styles.followerCount}>{`${numberWithCommas(user.followerCount)} followers`}</Text>
        </View>
        { this.renderFollowing(user, unfollowUser) }
      </View>
    );
  }
}

const numberWithCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
