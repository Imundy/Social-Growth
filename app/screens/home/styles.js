import colors from '../../styles/colors';

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    alignSelf: 'flex-end',
    marginVertical: 16,
    borderRadius: 8,
    width: '50%',
  },
  optionText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    width: '100%',
    marginVertical: 12,
    padding: 8,
    fontSize: 16,
    borderRadius: 4,
  },
  form: {
    width: '100%',
    height: 150,
    overflow: 'hidden',
  },
  link: {
    height: 48,
    alignItems: 'center',
    width: '100%',
  },
};

export default styles;
