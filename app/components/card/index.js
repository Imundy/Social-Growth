import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import * as Animatable from 'react-native-animatable';

import styles from './styles';

const Card = ({ description, title, onPress, logo, canToggle, toggle, on, color, index }) => (
  <TouchableOpacity onPress={onPress}>
    <Animatable.View animation="fadeInUp" duration={400} delay={(index * 100) + 100} style={{ ...styles.cardContainer, backgroundColor: color }}>
      <View style={styles.cardHeader}>
        <View style={{ marginTop: -20 }}>
          {canToggle ? <View style={styles.toggleContainer}>
            <TouchableOpacity onPress={toggle}>
              <View style={{ alignItems: on ? 'flex-end' : 'flex-start', ...styles.toggleButtonContainer, ...(on ? styles.toggleButtonContainerOn : styles.toggleButtonContainerOff) }}>
                <View style={styles.toggleButton} />
              </View>
            </TouchableOpacity>
            <Text style={styles.on}>{on ? 'ON' : 'OFF'}</Text>
          </View> : null}
        </View>
        <View style={styles.logo}>
          {logo()}
        </View>
      </View>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.title}>{title}</Text>
    </Animatable.View>
  </TouchableOpacity>
);

export default Card;

Card.propTypes = {
  description: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  logo: PropTypes.func.isRequired,
  canToggle: PropTypes.bool,
  toggle: PropTypes.func,
  on: PropTypes.bool,
};
