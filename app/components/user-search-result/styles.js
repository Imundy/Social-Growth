import colors from '../../styles/colors';

const styles = {
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomColor: '#CCC',
    borderBottomWidth: 1,
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
    marginRight: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  followerCount: {
    color: '#999',
    fontSize: 14,
  },
  addButtonContainer: {
    height: 50,
    width: 50,
  },
  addButton: {
    height: 50,
    width: 50,
    padding: 5,
    borderRadius: 25,
    backgroundColor: colors.blueGreen,
  },
  following: {
    color: '#999',
    fontSize: 14,
  },
};

export default styles;
