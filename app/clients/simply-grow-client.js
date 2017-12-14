import urls from '../urls';

const simplyGrowClient = {
  getAccounts: ({ jwt }) => fetch(`${urls.simplygrow}/api/social/accounts`, {
    headers: {
      Authorization: `jwt ${jwt}`,
    },
  }),
  addAccount: ({ userId, tokens, type, socialAccountId, jwt }) => fetch(`${urls.simplygrow}/api/social/accounts/add`, {
    method: 'POST',
    headers: {
      Authorization: `jwt ${jwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      tokens,
      type,
      socialAccountId,
    }),
  }),
  removeAccount: ({ userId, accountId, jwt }) => {
    console.log(userId, accountId, jwt);
    return fetch(`${urls.simplygrow}/api/social/accounts/remove`, {
      method: 'POST',
      headers: {
        Authorization: `jwt ${jwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        accountId,
      }),
    });
  },
  getAccountSettings: ({ accountId, jwt }) => fetch(`${urls.simplygrow}/api/social/accounts/${accountId}/settings`, {
    headers: {
      Authorization: `jwt ${jwt}`,
    },
  }),
  updateAccountSettings: ({ accountId, settings, jwt }) => fetch(`${urls.simplygrow}/api/social/accounts/${accountId}/settings`, {
    method: 'PUT',
    headers: {
      Authorization: `jwt ${jwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ settings }),
  }),
  signIn: ({ email, password }) => fetch(`${urls.simplygrow}/api/users/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  }),
  register: ({ email, password }) => fetch(`${urls.simplygrow}/api/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  }),
};

export default simplyGrowClient;
