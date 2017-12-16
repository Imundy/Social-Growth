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
  tweetSearch: {
    tweetContainer: {
      borderBottomWidth: 1,
      borderColor: colors.lightGrey,
      paddingBottom: 10,
    },
    contentContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      padding: 12,
      marginRight: 20,
    },
    profileImage: {
      height: 50,
      width: 50,
      borderRadius: 25,
      marginRight: 12,
    },
    content: {
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      flex: 1,
    },
    name: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginBottom: 12,
    },
    displayName: {
      fontWeight: 'bold',
    },
    handle: {
      marginLeft: 8,
      color: '#777',
    },
    tweetContent: {
      padding: 8,
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    followActionContainer: {
      backgroundColor: colors.blue,
      marginLeft: 50,
      paddingHorizontal: 25,
      borderWidth: 1,
      borderColor: 'white',
      borderRadius: 4,
      height: 30,
      position: 'absolute',
      top: 10,
      right: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionButton: {
      marginHorizontal: 25,
    },
  },
};

export default styles;
