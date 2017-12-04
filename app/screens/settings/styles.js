import colors from '../../styles/colors';

export const styles = {
  container: {
    flex: 1,
  },
  header: {
    height: 75,
    paddingTop: 8,
    backgroundColor: colors.blue,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  headerText: {
    color: 'white',
    fontSize: 28,
  },
  sectionHeader: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: colors.blue,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 0,
  },
  title: {
    fontSize: 24,
    color: colors.blue,
    marginVertical: 4,
  },
  button: {
    backgroundColor: colors.blueGreen,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    marginVertical: 8,
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  account: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  accountName: {
    fontSize: 16,
    marginLeft: 4,
    color: colors.blue,
  },
  profileImage: {
    height: 32,
    width: 32,
    borderRadius: 4,
    marginRight: 12,
  },
  addAccount: {
    marginLeft: 12,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 6,
  },
  cancel: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 2,
    marginTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
};
