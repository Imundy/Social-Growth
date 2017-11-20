import colors from '../../styles/colors';
import { Dimensions, Platform } from 'react-native';

const screenWidth = Dimensions.get('screen').width;

const styles = {
  headerContainer: {
    width: screenWidth,
    paddingTop: Platform.OS === "ios" ? 40 : 0,
    height: 170,
    backgroundColor: colors.blue,
    alignItems: 'center'
  },
  title: {
    fontSize: 36,
    color: colors.lightBlue
  },
  description: {
    marginTop: 4,
    marginBottom: 16,
    marginHorizontal: 16,
    fontSize: 14,
    color: 'white',
    textAlign: 'center'
  },
  account: {
    fontSize: 12,
    width: screenWidth - 32,
    textAlign: 'right',
    fontWeight: 'bold',
    color: 'white'
  },
  connectContainer: {
    width: screenWidth,
  },
  connect: {
    fontSize: 12,
    paddingVertical: 2,
    paddingHorizontal: 32,
    marginRight: 16,
    alignSelf: 'flex-end',
    color: 'white',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 6,
    textAlign: 'right',
  }
};

export default styles;