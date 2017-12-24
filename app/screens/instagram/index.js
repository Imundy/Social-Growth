import React, { Component } from 'react';
import {
  View,
  Text,
  WebView,
  Dimensions,
  TouchableOpacity,
  AsyncStorage,
} from 'react-native';

import Header from '../../components/header';
import styles from './styles';
import colors from '../../styles/colors';

// Icons
import InstagramLogoIcon from '../../icons/svg/instagram-logo.js';

export default class Instagram extends Component {
  state = {
    isLoading: false,
    accounts: [],
    currentAccount: null,
    error: null,
    view: views.Home,
    currentPostCount: 0,
    currentRequestCount: 0,
    webViewType: 'none',
  }

  tokens = [];

  componentDidMount = async () => {
    const urlTokens = await AsyncStorage.getItem('urlTokens:instagram');
    this.tokens = JSON.parse(urlTokens) || [];
  }

  search = () => {
    const { query } = this.state;
    this.setState({
      isSearching: true,
    });

    if (query == null || query.trim().length === 0) {
      this.setState({
        isSearching: false,
      });

      return;
    }

    this.setState({ tag: query.replace(/\W/g, ''), pictureLinkIndex: 0 });
  }

  onHiddenNavigationStateChange = (navEvent) => {
    if (!navEvent.loading) {
      if (navEvent.url.match(/.*instagram.com\/explore\/tags\/.*/)) {
        this.injectLinkScraper();
      }
    }
  }

  injectLinkScraper = () => {
    /* eslint-disable */
    function findLinks() {
      var links = Array.from(document.getElementsByTagName('a')).map(x => x.href);
      var pictureLinks = links.filter(x => x.match(/.*\/p\/.*/) != null);
      if (pictureLinks) {
        window.postMessage(JSON.stringify({ pictureLinks, type: 'pictureLinks' }));
      }
    }
    const injectScript = '(' + String(findLinks) + ')();';
    /* eslint-enable */
    this._hiddenWebview.injectJavaScript(injectScript);
  }

  scrollHiddenView = () => {
    /* eslint-disable */
    function scrollView() {
      window.scrollBy(0, 1000);
    }
    const injectScript = '(' + String(scrollView) + ')();';
    /* eslint-enablex */
    this._hiddenWebview.injectJavaScript(injectScript);
  }

  onVisibleNavigationStateChange = (navEvent) => {
    if (!navEvent.loading) {
      if (navEvent.url.match(/.*instagram.com\/p\/.*\//)) {
        /* eslint-disable */
        function attachFollowListener() {
          var followButton = Array.from(document.getElementsByTagName('button')).find(x => x.innerText == 'Follow' || x.innerText == 'Following');
          if (!followButton) {
            setTimeout(attachFollowListener, 250);
          } else {
            const token = window.location.href.match(/.*instagram.com\/p\/(.*)\//)[1];
            if (followButton.innerText === 'Following') {
              window.postMessage(JSON.stringify({ type: 'followClicked', token }));
              return;
            }

            followButton.onclick = function(e) {
              window.postMessage(JSON.stringify({ type: 'followClicked', token }));
            };
          }
        }
        const injectScript = '(' + String(attachFollowListener) + ')();';
        /* eslint-enable */
        this._webview.injectJavaScript(injectScript);
      }
    }
  }

  onHiddenMessage = async (event) => {
    if (!event.nativeEvent.data) {
      return;
    }

    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'pictureLinks') {
      const pictureLinkIndex = this.state.pictureLinkIndex ? this.state.pictureLinkIndex : 0;
      this.setState({ webViewType: 'pictureLink', pictureLinks: data.pictureLinks, pictureLinkIndex });
    } else if (data.type === 'followClicked') {
      this.tokens.push(data.token);
      await AsyncStorage.setItem('urlTokens:instagram', JSON.stringify(this.tokens));
      this.updatePictureLinkIndex();
    }
  }

  updatePictureLinkIndex = () => {
    this.setState(state => {
      let offset = 1;
      let token = state.pictureLinks[state.pictureLinkIndex + offset].match(/.*instagram.com\/p\/(.*)\//)[1];

      while(this.tokens.indexOf(token) !== -1 && state.pictureLinkIndex + offset < state.pictureLinks.length) {
        offset += 1;
        token = state.pictureLinks[state.pictureLinkIndex + offset].match(/.*instagram.com\/p\/(.*)\//)[1];
      }

      return ({ pictureLinkIndex: state.pictureLinkIndex + offset })
    }, () => {
      if (this.state.pictureLinkIndex + 100 >= this.state.pictureLinks.length) {
        this.scrollHiddenView();
        this.injectLinkScraper();
      }
    });
  }

  postMessage(action) {
    this._hiddenWebview.postMessage(JSON.stringify(action));
  }

  searchTextChange = (text) => {
    this.setState({
      query: text,
    });
  }

  mapWebViewTypeToUrl = () => {
    const { webViewType } = this.state;
    switch (webViewType) {
      case 'pictureLink':
        return this.state.pictureLinks[this.state.pictureLinkIndex];
      case 'none':
      default:
        return 'https://instagram.com';
    }
  }

  followUser = () => {
    /* eslint-disable */
    function followUser() {
      var followButton = Array.from(document.getElementsByTagName('button')).find(x => x.innerText == 'Follow' || x.innerText == 'Following');
      followButton.click();
    }
    const injectScript = '(' + String(followUser) + ')();';
    /* eslint-enable */
    this._webview.injectJavaScript(injectScript);
  }

  render() {
    const { view, tag } = this.state;

    return (
        <View style={styles.container}>
          <Header
            title="INSTAGRAM"
            titleSize={36}
            subtext={`${views[view.name].description}`}
            connect={!this.state.currentAccount ? this.instagramOAuth : null}
            search={views[view.name].searchable ? this.search : null}
            searchTextChange={views[view.name].searchable ? this.searchTextChange : null}
            account={this.state.currentAccount}
            navigate={view.name === 'Search' || view.name === 'Manage' ? () => this._navigator._navigation.goBack() : () => this.props.navigation.navigate('DrawerOpen')}
            showMenu={view.name === 'Search' || view.name === 'Manage'}
            ref={(ref) => { this.header = ref; }}
          />
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1, zIndex: 0 }}>
              <WebView
                javaScriptEnabled
                injectedJavaScript={patchPostMessageJsCode}
                onMessage={this.onHiddenMessage}
                onNavigationStateChange={this.onHiddenNavigationStateChange}
                ref={(ref) => { this._hiddenWebview = ref; }}
                source={{ uri: tag ? `https://instagram.com/explore/tags/${tag}` : 'https://instagram.com/explore/' }}
              />
            </View>
            <View style={{ position: 'absolute', overflow: 'hidden', }}>
              <WebView
                style={{ height: Dimensions.get('screen').height, width: Dimensions.get('screen').width, zIndex: 1, marginTop: -50 }}
                ref={(ref) => { this._webview = ref; }}
                javaScriptEnabled
                injectedJavaScript={patchPostMessageJsCode}
                onMessage={this.onHiddenMessage}
                source={{ uri: this.mapWebViewTypeToUrl() }}
                onNavigationStateChange={this.onVisibleNavigationStateChange}
              />
            </View>
          { tag ? 
            <View style={styles.skipButton}>
              <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: '100%', borderTopWidth: 1, borderTopColor: colors.lightGrey }} onPress={this.updatePictureLinkIndex}>
                <Text style={{ fontSize: 16, textAlign: 'center' }}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, backgroundColor: colors.blue, height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={this.followUser}>
                <Text style={{ fontSize: 16, textAlign: 'center', color: 'white' }}>Follow</Text>
              </TouchableOpacity>
            </View> :
            null
          }
          </View>
        </View>
    );
  }
}

/* eslint-disable */
const patchPostMessageJsCode = `(${String(function() {
  var originalPostMessage = window.postMessage
  var patchedPostMessage = function(message, targetOrigin, transfer) {
      originalPostMessage(message, targetOrigin, transfer)
  }
  patchedPostMessage.toString = function() {
      return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage')
  }
  window.postMessage = patchedPostMessage
})})();`
/* eslint-enable */


const views = {
  Home: {
    name: 'Home',
    description: 'Search tags to find accounts to follow on Instagram',
    searchable: true,
  },
};
