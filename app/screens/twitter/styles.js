import { Dimensions } from 'react-native';

const styles = {
  container: {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
  },
  otherContainer: {
    paddingVertical: 32,
    height: 1000,
    justifyContent: 'flex-start',
    alignItems: 'center',
  }
};

export default styles;