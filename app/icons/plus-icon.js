import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import Svg, { Path } from 'react-native-svg';

const PlusIcon = ({ width, height, color, scale }) => (
  <View style={{ width, height, justifyContent: 'center', alignItems: 'center', marginLeft: 2, marginTop: 2 }}>
    <Svg height={height} width={width} file={color}>
      <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill={color} scale={scale} />
      <Path d="M0 0h24v24H0z" fill="none" scale={scale} />
    </Svg>
  </View>

);

PlusIcon.propTypes = {
  width: PropTypes.string.isRequired,
  height: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
};

export default PlusIcon;

