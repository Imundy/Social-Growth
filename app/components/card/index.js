import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';

import styles from './styles';

const Card = ({ description, title, onPress, logo, canToggle, toggle, on, color }) => (
  <TouchableOpacity onPress={onPress}>
    <View style={{ ...styles.cardContainer, backgroundColor: color }}>
      <View style={styles.cardHeader}>
        <View style={{ marginTop: -20 }}>
          {canToggle ? <View style={styles.toggleContainer}>
            <TouchableOpacity onPress={toggle}>
              <View style={{ alignItems: on ? 'flex-end' : 'flex-start', ...styles.toggleButtonContainer }}>
                <View style={styles.toggleButton}></View>
              </View>
            </TouchableOpacity>
            <Text style={styles.on}>{on ? 'ON' : 'OFF'}</Text>
          </View> : null}
        </View>
        {logo({ width: '40', height: '40', color: '#FFF', scale: '0.8' })}
      </View>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  </TouchableOpacity>
);

export default Card;

Card.propTypes = {
  description: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  logo: PropTypes.func.isRequired,
  canToggle: PropTypes.bool.isRequired,
  toggle: PropTypes.func,
  on: PropTypes.bool,
};
