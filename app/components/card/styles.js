import { Dimensions } from 'react-native';
import colors from '../../styles/colors';

const screenWidth = Dimensions.get('screen').width;

const styles = {
  cardContainer: {
    height: 220,
    width: screenWidth - 76,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  description: {
    flex: 4,
    fontSize: 26,
    color: 'white',
  },
  title: {
    fontSize: 12,
    color: 'white',
    alignSelf: 'flex-end',
  },
  cardHeader: {
    flex: 1,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleContainer: {
    width: 70,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  on: {
    color: 'white',
    fontSize: 12,
    marginLeft: 8,
  },
  toggleButtonContainer: {
    width: 50,
    backgroundColor: colors.blue,
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
};

export default styles;
