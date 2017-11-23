import React, { PureComponent } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import SvgUri from 'react-native-svg-uri';

import styles from './styles';

export default class UserSearchResult extends PureComponent {
  static propTypes = {
    user: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string.isRequired,
      displayName: PropTypes.string.isRequired,
      followerCount: PropTypes.number.isRequired,
      profileImage: PropTypes.string.isRequired,
      following: PropTypes.bool.isRequired,
      bio: PropTypes.string,
    }).isRequired,
    followUser: PropTypes.func.isRequired,
  }

  state = {};

  renderFollowing = (user, followUser) => {
    if (user.following) {
      return (<Text style={styles.following}>Following</Text>);
    }

    return (
      <TouchableOpacity style={styles.addButtonContainer} onPress={followUser}>
        <View style={styles.addButton}>
          <SvgUri source={require('../../icons/svg/white-plus-icon.svg')} height="40" width="40" />
        </View>
      </TouchableOpacity>);
  }

  render() {
    const { user, followUser } = this.props;
    return (
      <View style={styles.cardContainer}>
        <Image
          style={styles.profilePicture}
          source={{ uri: user.profileImage }}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user.displayName}</Text>
          <Text style={styles.followerCount}>{`${numberWithCommas(user.followerCount)} followers`}</Text>
        </View>
        { this.renderFollowing(user, followUser) }
      </View>
    );
  }
}

const numberWithCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
