import React, { PureComponent } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import SvgUri from 'react-native-svg-uri';

import styles from './styles';

export default class TwitterUserCard extends PureComponent {
  static propTypes = {
    user: PropTypes.object.isRequired, // eslint-disable-line
  }

  state = {};

  renderFollowing = (user) => {
    if (user.following) {
      return (<Text style={styles.following}>Following</Text>);
    }

    return (
      <TouchableOpacity style={styles.addButtonContainer}>
        <View style={styles.addButton}>
          <SvgUri source={require('../../icons/svg/white-plus-icon.svg')} height="40" width="40" />
        </View>
      </TouchableOpacity>);
  }

  render() {
    const { user } = this.props;
    return (
      <View style={styles.cardContainer}>
        <Image
          style={styles.profilePicture}
          source={{ uri: user.profile_image_url_https }}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.followerCount}>{`${numberWithCommas(user.followers_count)} followers`}</Text>
        </View>
        { this.renderFollowing(user) }
      </View>
    );
  }
}

const numberWithCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
