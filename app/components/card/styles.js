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
    marginVertical: 8,
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
    marginTop: 12,
    marginBottom: 8,
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
    borderRadius: 10,
    height: 20,
    borderWidth: 0.5,
    borderColor: '#FFF',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleButtonContainerOn: {
    backgroundColor: colors.blue,
  },
  toggleButtonContainerOff: {
    backgroundColor: '#BBB',
  },
  toggleButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  logo: {
    marginRight: 8,
    marginTop: 0,
  },
};

export default styles;
