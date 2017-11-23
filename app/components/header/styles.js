import colors from '../../styles/colors.js';

const styles = {
  headerContainer: {
    alignItems: 'center',
    width: '100%',
    backgroundColor: colors.blue,
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  connectButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'white',
    borderWidth: 1,
    width: 100,
    height: 32,
    marginRight: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginHorizontal: 20,
    marginTop: 20,
  },
  searchContainer: {
    justifyContent: 'center',
    maxWidth: '100%',
    alignItems: 'center',
    marginVertical: 12,
    flexDirection: 'row',
    borderRadius: 4,
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  input: {
    height: 40,
    backgroundColor: 'white',
    maxWidth: '70%',
    width: '100%',
    padding: 12,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: colors.blue,
    height: 40,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  account: {
    fontSize: 12,
    textAlign: 'right',
    fontWeight: 'bold',
    color: 'white',
    marginRight: 20,
  },
};

export default styles;
