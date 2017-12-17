import React, { PureComponent } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import SvgUri from 'react-native-svg-uri';
import Interactable from 'react-native-interactable';
import * as Animatable from 'react-native-animatable';

import colors from '../../styles/colors';
import styles from './styles';

// Icons
import BlueVerifiedIcon from '../../icons/svg/blue-verified-check.js';
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

  onSnap = async (event, user, unfollow) => {
    if (event.nativeEvent.index === 0) {
      await this[user.id].zoomOut(200);
      await this[user.id].transition({ height: 83 }, { height: 0 }, 200);
      unfollow(user.id);
    }
  };

  renderFollowing = (user, unfollowUser) => {
    if (!user.following) {
      return (<Text style={styles.following}>Not Following</Text>);
    }

    return (
      <TouchableOpacity onPress={() => unfollowUser(user.id)}>
        <Text style={styles.following}>Unfollow</Text>
      </TouchableOpacity>);
  }

  render() {
    const { user, unfollowUser } = this.props;
    return (
      <Animatable.View ref={(ref) => { this[user.id] = ref; }} style={{ overflow: 'hidden' }}>
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
          onSnap={event => this.onSnap(event, user, unfollowUser)}
          style={{ backgroundColor: 'white' }}
          boundaries={{ left: -1000, right: 10 }}
        >
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
            { this.renderFollowing(user, unfollowUser) }
          </View>
        </Interactable.View>
      </Animatable.View>

    );
  }
}

const numberWithCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
