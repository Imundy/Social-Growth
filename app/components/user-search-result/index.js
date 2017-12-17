import React, { PureComponent } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import SvgUri from 'react-native-svg-uri';

import styles from './styles';

// Icons
import WhitePlusIcon from '../../icons/svg/white-plus-icon.js';
import BlueVerifiedIcon from '../../icons/svg/blue-verified-check.js';

export default class UserSearchResult extends PureComponent {
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
    followUser: PropTypes.func.isRequired,
  }

  state = {};

  renderFollowing = (user, followUser) => {
    if (user.following) {
      return (<Text style={styles.following}>{this.props.user.followStatus || 'Following'}</Text>);
    }

    return (
      <TouchableOpacity style={styles.addButtonContainer} onPress={() => followUser(user.id)}>
        <View style={styles.addButton}>
          <SvgUri svgXmlData={WhitePlusIcon} height="40" width="40" />
        </View>
      </TouchableOpacity>
    );
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
          <View style={styles.nameContainer}>
            <Text style={styles.profileName}>{user.displayName}</Text>
            {user.verified ? <SvgUri svgXmlData={BlueVerifiedIcon} height="16" width="16" /> : null}
          </View>
          <Text style={styles.followerCount}>{`${numberWithCommas(user.followerCount)} followers`}</Text>
        </View>
        { this.renderFollowing(user, followUser) }
      </View>
    );
  }
}

const numberWithCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
