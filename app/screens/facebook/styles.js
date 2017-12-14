import { Dimensions } from 'react-native';
import colors from '../../styles/colors';

const styles = {
  container: {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
  },
  cardContainer: {
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
  criteriaText: {
    container: {
      width: Dimensions.get('screen').width,
      height: 300,
      padding: 20,
      backgroundColor: '#FFF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    instructions: {
      color: '#333',
      fontSize: 12,
    },
    input: {
      borderColor: '#BBB',
      width: 250,
      borderWidth: 1,
      borderRadius: 4,
      padding: 10,
      marginBottom: 20,
      marginTop: 10,
      flex: 1,
    },
    offButton: {
      justifyContent: 'center',
      alignItems: 'center',
      borderColor: colors.blue,
      borderWidth: 1,
      borderRadius: 4,
      width: 300,
      height: 40,
      marginBottom: 10,
    },
    offButtonText: {
      color: colors.blue,
    },
    button: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.blue,
      borderRadius: 4,
      width: 300,
      height: 40,
    },
    buttonText: {
      color: '#FFF',
    },
  },
  profilePicture: {
    height: 50,
    width: 50,
    borderRadius: 4,
  },
  profileInfo: {
    flex: 4,
    marginLeft: 16,
  },
  profileName: {
    color: colors.blue,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  pageResult: {
    flexDirection: 'row',
    width: Dimensions.get('screen').width,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomColor: '#ccc',
    borderBottomWidth: 2,
  },
};

export default styles;
