import React, { Component, PureComponent } from 'react';
import {
  AsyncStorage,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StackNavigator } from 'react-navigation';
import SvgUri from 'react-native-svg-uri';

import { FacebookRequest } from '../util';
import Header from '../../components/header';
import Card from '../../components/card';
import simplyGrowClient from '../../clients/simply-grow-client';
import urls from '../../urls';
import colors from '../../styles/colors';
import styles from './styles';

const facebookRequest = new FacebookRequest();

export default class Facebook extends Component {
  static navigationOptions = {
    drawerLabel: 'Facebook',
    drawerIcon: () => (
      <SvgUri width="25" height="25" source={require('../../icons/svg/white-facebook-logo.svg')} />
    ),
  };

  state = {
    connected: false,
    facebookAccounts: [],
    currentAccount: null,
    view: views.Home,
    modalVisible: false,
    settings: {
      autoLikeReviews: {
        on: false,
        value: null,
      },
      autoLikeComments: {
        on: false,
        value: null,
      },
      autoHideComments: {
        on: false,
        value: null,
      },
    },
  }

  componentDidMount = async () => {
    let facebookAccounts = await AsyncStorage.getItem('accounts:facebook');
    this.header.transitionHeader(60);

    let currentAccount = await AsyncStorage.getItem('currentAccount:facebook');
    let settings = await AsyncStorage.getItem('settings:facebook');
    let user = await AsyncStorage.getItem('user');

    user = user && JSON.parse(user);
    currentAccount = currentAccount && JSON.parse(currentAccount);
    settings = settings && JSON.parse(settings);
    facebookAccounts = JSON.parse(facebookAccounts);

    await this.setState({
      connected: true,
      facebookAccounts,
      currentAccount,
      settings: settings || this.state.settings,
      user,
    });

    if (user != null) {
      this.updateSettings();
      this.updatePages();
    }
  }

  updateSettings = async () => {
    let response = await simplyGrowClient.getAccountSettings({
      accountId: this.state.currentAccount.accountId,
      jwt: this.state.user.token,
    });

    const { status } = response;
    response = await response.json();
    if (response == null && status === 200) {
      return;
    }

    this.setState({
      settings: {
        ...this.state.settings,
        ...response.settings,
      },
    });
  }

  updatePages = async () => {
    let response;
    let selected = await AsyncStorage.getItem('pages:facebook');
    selected = selected && JSON.parse(selected);

    try {
      response = await fetch(`${urls.simplygrow}/api/social/accounts/${this.state.currentAccount.accountId}/pages`, {
        headers: {
          Authorization: `jwt ${this.state.user.token}`,
        },
      });
    } catch (error) {
      console.log(error);
      return;
    }

    let pages = await facebookRequest.pages(this.state.currentAccount.tokens[0]);
    const { status } = response;
    response = await response.json();

    console.log(response);
    if (status >= 200 && status < 300) {
      selected = selected != null ? selected.concat(response) : response;
    } else {
      selected = [];
    }

    pages = pages.map(page => ({ ...page, isSelected: selected.find(p => p.page_id === page.id) != null }));
    this.setState({
      pages,
    });
  }

  searchTextChange = (text) => {
    this.setState({ searchText: text });
  }

  navigationStateChange = (prevState, currentState) => {
    this.view = views[currentState.routes[currentState.index].routeName];
    if (views[currentState.routes[currentState.index].routeName].name === 'Manage') {
      this.header.transitionHeader(-20);
    }

    this.setState({
      view: views[currentState.routes[currentState.index].routeName],
    });
  }

  updateReviewsRatingThreshold = async (ratingThreshold) => {
    const { settings } = this.state;
    if (!ratingThreshold) {
      settings.autoLikeReviews = { on: false, value: null };
      await this.setState({ settings, modalVisible: false });
    } else {
      settings.autoLikeReviews = { on: true, value: ratingThreshold };
      await this.setState({ settings, modalVisible: false });
    }

    this.saveSettings();
  }

  updateCriteriaSetting = async (setting, value) => {
    const { settings } = this.state;
    if (!value) {
      settings[setting] = { on: false, value: null };
      await this.setState({ settings, modalVisible: false });
    } else {
      settings[setting] = { on: true, value };
      await this.setState({ settings, modalVisible: false });
    }
    this.saveSettings();
  };

  saveSettings = async () => {
    const { id, ...sett } = this.state.settings;
    let response = await simplyGrowClient.updateAccountSettings({
      accountId: this.state.currentAccount.accountId,
      settings: sett,
      jwt: this.state.user.token,
    });

    response = await response.json();
    await AsyncStorage.setItem('settings:facebook', JSON.stringify({ ...sett, id: response }));
  }

  addPage = async (pageId) => {
    let response;
    try {
      response = await fetch(`${urls.simplygrow}/api/social/accounts/${this.state.currentAccount.accountId}/pages?pageId=${pageId}`, {
        method: 'POST',
        headers: {
          Authorization: `jwt ${this.state.user.token}`,
        },
      });
    } catch (error) {
      console.log(error);
      return;
    }

    const { status } = response;
    if (status < 200 || status >= 300) {
      console.log('Failed request');
      return;
    }

    this.setState({
      pages: this.state.pages.map(page => ({ ...page, isSelected: page.id === pageId || page.isSelected })),
    });
  }

  render() {
    const { currentAccount, view, modalVisible, modalView, settings } = this.state;

    return (
      <View style={styles.container}>
        <Header
          title="Facebook"
          titleSize={36}
          subtext={currentAccount ? views[view.name].description : 'Go to settings to add a Facebook account.'}
          account={currentAccount ? { name: currentAccount.name } : null}
          showMenu={view.name === 'Manage'}
          connect={() => { this._navigator._navigation.navigate('Manage'); }}
          navigate={view.name === 'Manage' ? () => this._navigator._navigation.goBack() : () => this.props.navigation.navigate('DrawerOpen')}
          ref={(ref) => { this.header = ref; }}
        />
        {currentAccount ?
          <FacebookApp
            ref={(ref) => { this._navigator = ref; }}
            onNavigationStateChange={this.navigationStateChange}
            screenProps={{
              showModal: (content) => { this.setState({ modalVisible: true, modalView: content }); },
              updateRating: this.updateReviewsRatingThreshold,
              settings,
              updateCriteria: this.updateCriteriaSetting,
              addPage: this.addPage,
              pages: this.state.pages,
            }}
          /> : null
        }
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
        >
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: Dimensions.get('screen').height,
            }}
          >
            {modalView}
          </View>
        </Modal>
      </View>
    );
  }
}

const Cards = ({ navigation, screenProps }) => (
  <ScrollView>
    <View style={styles.cardContainer}>
      <Card
        description={views.AutoLikeReviews.description}
        title="AUTO LIKE REVIEWS"
        color={colors.blueGreen}
        logo={() => (<SvgUri width="25" height="25" source={require('../../icons/svg/white-facebook-logo.svg')} />)}
        toggle={() => { screenProps.showModal(<AutoLikeReview updateRating={screenProps.updateRating} />); }}
        canToggle
        on={screenProps.settings.autoLikeReviews.on}
        onPress={() => { screenProps.showModal(<AutoLikeReview updateRating={screenProps.updateRating} />); }}
        index={0}
      />
      <Card
        description={views.AutoLikeComments.description}
        title="AUTO LIKE COMMENTS"
        color={colors.blue}
        logo={() => (<SvgUri width="25" height="25" source={require('../../icons/svg/white-facebook-logo.svg')} />)}
        toggle={() => {
          screenProps.showModal(<UpdateCriteria
            updateCriteria={screenProps.updateCriteria}
            setting="autoLikeComments"
            value={screenProps.settings.autoLikeComments.value}
          />);
        }}
        canToggle
        on={screenProps.settings.autoLikeComments.on}
        onPress={() => {
          screenProps.showModal(<UpdateCriteria
            updateCriteria={screenProps.updateCriteria}
            setting="autoLikeComments"
            value={screenProps.settings.autoLikeComments.value}
          />);
        }}
        index={1}
      />
      <Card
        description={views.AutoHideComments.description}
        title="AUTO HIDE COMMENTS"
        color={colors.pink}
        logo={() => (<SvgUri width="25" height="25" source={require('../../icons/svg/white-facebook-logo.svg')} />)}
        toggle={() => {
          screenProps.showModal(<UpdateCriteria
            updateCriteria={screenProps.updateCriteria}
            setting="autoHideComments"
            value={screenProps.settings.autoHideComments.value}
          />);
        }}
        canToggle
        on={screenProps.settings.autoHideComments.on}
        onPress={() => {
          screenProps.showModal(<UpdateCriteria
            updateCriteria={screenProps.updateCriteria}
            setting="autoHideComments"
            value={screenProps.settings.autoHideComments.value}
          />);
        }}
        index={2}
      />
    </View>
  </ScrollView>
);

const AutoLikeReview = ({ updateRating }) => (
  <View style={styles.autoLikeReview.modal}>
    <TouchableOpacity style={styles.autoLikeReview.button} onPress={() => updateRating(null)}>
      <Text style={styles.autoLikeReview.text}>Off</Text>
    </TouchableOpacity>
    {[1, 2, 3, 4, 5].map(rating => (
      <TouchableOpacity key={rating} style={styles.autoLikeReview.button} onPress={() => updateRating(rating)}>
        <Text style={styles.autoLikeReview.text}>{`${rating} star${rating > 1 ? 's' : ''}`}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

class UpdateCriteria extends PureComponent {
  state = {
    text: this.props.value || '',
  };

  render() {
    const { updateCriteria, setting } = this.props;
    const { text } = this.state;

    return (
      <View style={styles.criteriaText.container}>
        <Text style={styles.criteriaText.instructions}>{settingsInstructions[setting]}</Text>
        <TextInput
          underlineColorAndroid="transparent"
          style={styles.criteriaText.input}
          value={text}
          editable
          multiline
          onChangeText={value => this.setState({ text: value })}
        />
        <TouchableOpacity style={styles.criteriaText.offButton} onPress={() => updateCriteria(setting, null)}>
          <Text style={styles.criteriaText.offButtonText}>Off</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.criteriaText.button} onPress={() => updateCriteria(setting, text)}>
          <Text style={styles.criteriaText.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const renderPage = (page, addPage) => (
  <TouchableOpacity style={styles.pageResult} onPress={() => addPage(page.id)}>
    <Image
      style={styles.profilePicture}
      source={{ uri: page.picture.data.url }}
    />
    <View style={styles.profileInfo}>
      <View style={styles.nameContainer}>
        {page.isSelected ? <SvgUri source={require('../../icons/svg/blue-verified-check.svg')} height="16" width="16" /> : null}
        <Text style={styles.profileName}>{page.name}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const ManagePages = ({ screenProps }) => (
  <View style={styles.cardContainer}>
    <FlatList
      contentContainerStyle={{ backgroundColor: 'white' }}
      data={screenProps.pages}
      keyExtractor={item => item.name}
      renderItem={({ item }) => renderPage(item, screenProps.addPage)}
      onEndReached={screenProps.loadMore}
    />
  </View>
);

const FacebookApp = new StackNavigator({
  Home: {
    screen: Cards,
  },
  Manage: {
    screen: ManagePages,
  },
}, {
  headerMode: 'none',
});

const views = {
  Home: {
    name: 'Home',
    description: 'facebook automations and actions can help you manage followers and grow your audience.',
  },
  AutoLikeReviews: {
    name: 'AutoLikeReviews',
    description: 'Like reviews that meet a minimum rating.',
  },
  AutoLikeComments: {
    name: 'AutoLikeComments',
    description: 'Automatically like criteria-matched comments',
  },
  AutoHideComments: {
    name: 'AutoHideComments',
    description: 'Hide comments with a keyword.',
  },
  SwitchAccounts: {
    name: 'SwitchAccounts',
    description: 'Select which account to use.',
  },
  Manage: {
    name: 'Manage',
    description: 'Choose which pages to manage.',
  },
};

const settingsInstructions = {
  autoLikeComments: 'Comma separated words and phrases to indicate a like:',
  autoHideComments: 'Comma separated words and phrases to avoid:',
};
