import React from 'react';
import PropTypes from 'prop-types';
import { FlatList, View, Text, Image, TouchableOpacity } from 'react-native';
import { TabNavigator } from 'react-navigation';

const AccountsList = ({ accounts, loadMoreAccounts, whitelistAccount, hasMore }) => (
  <FlatList
    contentContainerStyle={{ backgroundColor: 'white' }}
    data={accounts}
    keyExtractor={item => item.id}
    renderItem={({ account }) => renderAccount({ account, whitelistAccount })}
    onEndReached={hasMore ? loadloadMoreAccountsMore : null}
  />
);

const WhitelistedAccountsList = ({ whitelistedAccounts, removeAccount }) => (
  <FlatList
    contentContainerStyle={{ backgroundColor: 'white' }}
    data={whitelistedAccounts}
    keyExtractor={item => item.id}
    renderItem={({ account }) => renderAccount({ account, removeAccount })}
  />
);

const renderAccount = ({ account, whitelistAccount, removeAccount }) => {

}

const WhitelistAccounts = new TabNavigator({
  AccountsList: {
    screen: AccountsList,
  },
  WhitelistedAccountsList: {
    screen: WhitelistedAccountsList,
  },
});

export default WhitelistAccounts;

AccountsList.propTypes = ({
  whitelistedAccounts: PropTypes.arrayOf(PropTypes.object),
  accounts: PropTypes.arrayOf(PropTypes.object),
  loadMoreAccounts: PropTypes.func,
  whitelistAccount: PropTypes.func,
  hasMore: PropTypes.bool,
});
