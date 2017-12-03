import { Dimensions } from 'react-native';
import colors from '../../styles/colors';

const styles = {
  container: {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
  },
  cardContainer: {
    paddingVertical: 32,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  autoLikeReview: {
    modal: {
      alignSelf: 'center',
      width: 200,
      backgroundColor: '#FFF',
    },
    button: {
      borderBottomWidth: 1,
      borderBottomColor: colors.blue,
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    text: {
      color: colors.blue,
      fontSize: 14,
    },
  },
};

export default styles;
