import { Dimensions } from 'react-native';

const styles = {
  container: {
    flex: 1,
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
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
};

export default styles;
