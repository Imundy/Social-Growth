import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import PropTypes from 'prop-types';

import styles from './styles';

export default class SwitchAccounts extends PureComponent { // eslint-disable-line
  static propTypes = {
    screenProps: PropTypes.shape({
      accounts: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        profileImage: PropTypes.string.isRequired,
        displayName: PropTypes.string.isRequired,
      })),
      selectedAccountId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      selectAccount: PropTypes.func,
      addAccount: PropTypes.func,
    }),
  }

  render() {
    const { accounts, selectedAccountId, selectAccount, addAccount, serviceName } = this.props.screenProps;
    return (
      <View style={styles.container}>
        <Text style={styles.selectText}>{`Select ${serviceName} account:`}</Text>
        {accounts && accounts.map(account => (<Account key={account.id} account={account} selectAccount={selectAccount} selectedAccountId={selectedAccountId} />))}
        <TouchableOpacity style={styles.addAccount} onPress={addAccount}>
          <Text style={styles.addAccountText}>Add Account</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const Account = ({ account, selectAccount, selectedAccountId }) => (
  <View style={styles.account} onPress={() => { selectAccount(account.id); }}>
    <TouchableOpacity onPress={() => { selectAccount(account.id); }} style={{ flexDirection: 'row', alignItems: 'center', overflow: 'hidden', maxWidth: 200 }}>
      <Image style={styles.profileImage} source={{ uri: account.profileImage }} />
      <Text style={[styles.accountName, account.id === selectedAccountId ? styles.accountNameSelected : null]}>{account.displayName || account.username}</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => console.log('remove account')}>
      <Text style={{ color: '#AAAAAA' }}>Remove</Text>
    </TouchableOpacity>
  </View>
);
