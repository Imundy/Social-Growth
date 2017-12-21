import { Dimensions } from 'react-native';

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
    height: 50,
    fontSize: 20,
    borderTopWidth: 1,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
};

export default styles;
