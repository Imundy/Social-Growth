import colors from '../../styles/colors';

const styles = {
  container: {
    flex: 1,
    paddingTop: 96,
    alignItems: 'center',
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
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginVertical: 16,
  },
  selectText: {
    fontSize: 16,
    marginBottom: 16,
  },
};

export default styles;
