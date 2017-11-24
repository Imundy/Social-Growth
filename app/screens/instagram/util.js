import {
  AsyncStorage,
} from 'react-native';

let requestHistory = [];
let postHistory = [];


// we should reset this every week or so...
export const addKnownFollowers = async (ids) => {
  let knownFollowers = await AsyncStorage.getItem('instagram:knownFollowers');
  if (knownFollowers == null) {
    knownFollowers = '[]';
  }

  knownFollowers = JSON.parse(knownFollowers);
  await AsyncStorage.setItem('instagram:knownFollowers', JSON.stringify([...new Set(knownFollowers.concat(ids))]));
};

export const loadKnownFollowers = async () => {
  const knownFollowers = await AsyncStorage.getItem('instagram:knownFollowers');
  if (knownFollowers == null) {
    return [];
  }

  return JSON.parse(knownFollowers);
};

export const removeKnownFollowing = async (id) => {
  let KnownFollowing = await AsyncStorage.getItem('instagram:KnownFollowing');
  if (KnownFollowing == null) {
    KnownFollowing = '[]';
  }

  KnownFollowing = JSON.parse(KnownFollowing);
  await AsyncStorage.setItem('instagram:KnownFollowing', JSON.stringify([...new Set(KnownFollowing.filter(x => x !== id))]));
};

export const addKnownFollowing = async (ids) => {
  let KnownFollowing = await AsyncStorage.getItem('instagram:KnownFollowing');
  if (KnownFollowing == null) {
    KnownFollowing = '[]';
  }

  KnownFollowing = JSON.parse(KnownFollowing);
  await AsyncStorage.setItem('instagram:KnownFollowing', JSON.stringify([...new Set(KnownFollowing.concat(ids))]));
};

export const loadKnownFollowing = async () => {
  const KnownFollowing = await AsyncStorage.getItem('instagram:KnownFollowing');
  if (KnownFollowing == null) {
    return [];
  }

  return JSON.parse(KnownFollowing);
};

export const fetchUtil = async (url, options) => {
  if (options != null && options.method === 'POST') {
    if (requestHistory.length === 0) {
      const storedValue = await AsyncStorage.getItem('instagram:requestCount');
      requestHistory = storedValue == null ? [] : JSON.parse(storedValue);
    }

    if (postHistory.length === 0) {
      const storedValue = await AsyncStorage.getItem('instagram:postCount');
      postHistory = storedValue == null ? [] : JSON.parse(storedValue);
    }

    postHistory.push(new Date().getTime());
    postHistory.filter(x => x < new Date().getTime() - 60000);

    await AsyncStorage.setItem('instagram:postCount', JSON.stringify(postHistory));
    const request = await fetch(url, options);
    return { request, count: postHistory.length };
  }

  if (postHistory.length === 0) {
    const storedValue = await AsyncStorage.getItem('instagram:postCount');
    postHistory = storedValue == null ? [] : JSON.parse(storedValue);
  }

  if (requestHistory.length === 0) {
    const storedValue = await AsyncStorage.getItem('instagram:requestCount');
    requestHistory = storedValue == null ? [] : JSON.parse(storedValue);
  }

  requestHistory.push(new Date().getTime());
  requestHistory.filter(x => x < new Date().getTime() - 60000);

  await AsyncStorage.setItem('instagram:requestCount', JSON.stringify(requestHistory));
  const request = await fetch(url, options);
  return { request, count: requestHistory.length };
};
