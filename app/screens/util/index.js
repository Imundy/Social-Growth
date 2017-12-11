import { GraphRequest, GraphRequestManager } from 'react-native-fbsdk';

export class FacebookRequest {
  userProfile(accessToken) {
    return new Promise((resolve, reject) => {
      const infoRequest = new GraphRequest(
        '/me',
        {
          parameters: {
            fields: { string: 'id,name,picture' },
          },
          accessToken,
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          return resolve(result);
        },
      );

      new GraphRequestManager().addRequest(infoRequest).start();
    });
  }

  pages(accessToken) {
    return new Promise((resolve, reject) => {
      const infoRequest = new GraphRequest(
        '/me/accounts',
        {
          parameters: {
            fields: { string: 'id,name,access_token,picture' },
          },
          accessToken,
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          return resolve(result.data);
        },
      );

      new GraphRequestManager().addRequest(infoRequest).start();
    });
  }
}
