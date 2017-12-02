import colors from '../../styles/colors';

const styles = {
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'flex-start',
    backgroundColor: 'white',
  },
  addAccount: {
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addAccountText: {
    borderColor: colors.blue,
    borderWidth: 1,
    borderRadius: 4,
    color: colors.blue,
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 18,
  },
  account: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: colors.blue,
    borderRadius: 4,
    borderWidth: 1,
    padding: 12,
  },
  accountName: {
    fontSize: 20,
    marginLeft: 16,
  },
  accountNameSelected: {
    color: colors.blue,
  },
  profileImage: {
    height: 40,
    width: 40,
    borderRadius: 4,
  },
  selectText: {
    fontSize: 16,
    marginBottom: 16,
  },
};

export default styles;
