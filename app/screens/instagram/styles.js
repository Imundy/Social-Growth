import { Dimensions } from 'react-native';
import colors from '../../styles/colors';

const styles = {
  container: {
    flex: 1,
  },
  cardContainer: {
    paddingVertical: 32,
    justifyContent: 'flex-start',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  tagResultContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomColor: '#CCC',
    borderBottomWidth: 1,
  },
  skipButton: {
    width: Dimensions.get('screen').width,
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
};

export default styles;
