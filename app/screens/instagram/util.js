import {
  AsyncStorage,
} from 'react-native';

let requestHistory = [];
let postHistory = [];

export const fetchUtil = async (url, options) => {
  if (options != null && options.method === 'POST') {
    if (postHistory.length === 0) {
      const storedValue = await AsyncStorage.getItem('instagram:postCount');
      postHistory = storedValue == null ? [] : JSON.parse(storedValue);
    }

    postHistory.push(new Date().getMilliseconds());
    postHistory.filter(x => x < new Date().getMilliseconds() - 60000);

    await AsyncStorage.setItem('instagram:postCount', JSON.stringify(postHistory));
    const request = await fetch(url, options);
    return { request, count: postHistory.length };
  }

  if (requestHistory.length === 0) {
    const storedValue = await AsyncStorage.getItem('instagram:requestCount');
    requestHistory = storedValue == null ? [] : JSON.parse(storedValue);
  }

  requestHistory.push(new Date().getMilliseconds());
  requestHistory.filter(x => x < new Date().getMilliseconds() - 60000);

  await AsyncStorage.setItem('instagram:requestCount', JSON.stringify(requestHistory));
  const request = await fetch(url, options);
  return { request, count: requestHistory.length };
};
