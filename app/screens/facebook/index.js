import React, { Component, PureComponent } from 'react';
import { ScrollView, View, Modal, Text, TextInput, TouchableOpacity, AsyncStorage, Dimensions } from 'react-native';
import { StackNavigator } from 'react-navigation';
import SvgUri from 'react-native-svg-uri';
import { LoginManager } from 'react-native-fbsdk';

import Header from '../../components/header';
import Card from '../../components/card';
import SwitchAccounts from '../../components/switch-accounts';
import config from '../../config';
import colors from '../../styles/colors';
import styles from './styles';

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
        value: null
      },
      autoLikeComments: {
        on: false,
        value: null,
      },
      autoHideComments: {
        on: false,
        value: null,
      }
    }
  }

  async componentDidMount() {
    let facebookAccounts = await AsyncStorage.getItem('facebookAccounts');
    if (facebookAccounts) {
      const currentAccount = await AsyncStorage.getItem('currentFacebookAccount');
      facebookAccounts = JSON.parse(facebookAccounts);
      this.setState({ connected: true, facebookAccounts, currentAccount: currentAccount ? JSON.parse(currentAccount) : facebookAccounts[0] }, this.createfacebookClient); // eslint-disable-line
    }
    this.props.navigation.navigate('SwitchAccounts');
  }

  createfacebookClient = () => {
    if (!this.state.currentAccount) {
      return;
    }

    /*const { accessToken, accessTokenSecret } = this.state.currentAccount;
    const clients = facebook({
      consumerKey: config.facebookConsumerToken,
      consumerSecret: config.facebookConsumerSecret,
      accessToken,
      accessTokenSecret,
    });
    this._facebookClient = clients.rest;
    if (!this.state.currentAccount.screen_name) {
      this.getCurrentAccountInfo();
    }*/
  }

  signIn = () => {
    LoginManager.logInWithPublishPermissions(['manage_pages', 'publish_pages'])
    .then((result) => {
      if (result.grantedPermissions) {
        console.log(result.grantedPermissions);
      }
    },
    (error) => {
      console.log(error);
    });
  }

  storeAccounts = async (facebookAccounts, currentAccount) => {
    const accountsPromise = AsyncStorage.setItem('facebookAccounts', JSON.stringify(facebookAccounts));
    const currentAccountPromise = AsyncStorage.setItem('currentfacebookAccount', JSON.stringify(currentAccount));
    return Promise.all(accountsPromise, currentAccountPromise);
  }

  searchTextChange = (text) => {
    this.setState({ searchText: text });
  }

  navigationStateChange = (prevState, currentState) => {
    this.view = views[currentState.routes[currentState.index].routeName];

    this.setState({
      view: views[currentState.routes[currentState.index].routeName],
    });
  }

  updateReviewsRatingThreshold = (ratingThreshold) => {
    const { settings } = this.state;
    if (!ratingThreshold) {
      settings.autoLikeReviews = { on: false, value: null };
      this.setState({ settings, modalVisible: false });
    } else {
      settings.autoLikeReviews = { on: true, value: ratingThreshold };
      this.setState({ settings, modalVisible: false });
    }
  }

  updateCriteriaSetting = (setting, value) => {
    const { settings } = this.state;
    if (!value) {
      settings[setting] = { on: false, value: null };
      this.setState({ settings, modalVisible: false });
    } else {
      settings[setting] = { on: true, value };
      this.setState({ settings, modalVisible: false });
    }
  };

  render() {
    const { currentAccount, view, modalVisible, modalView, settings } = this.state;

    return (
      <View style={styles.container}>
        <Header
          title="Facebook"
          titleSize={36}
          subtext={views[view.name].description}
          connect={view.name === views.Home.name ? this.signIn : null}
          account={currentAccount ? { name: `@${currentAccount.name}` } : null}
          switchAccounts={() => {
            this._navigator._navigation.navigate('SwitchAccounts');
          }}
          navigate={view.name === 'UserSearch' || view.name === 'UnfollowUsers' || view.name === 'SwitchAccounts' ? () => this._navigator._navigation.goBack() : () => this.props.navigation.navigate('DrawerOpen')}
          showMenu={view.name === 'UserSearch' || view.name === 'UnfollowUsers' || view.name === 'SwitchAccounts'}
          ref={(ref) => { this.header = ref; }}
        />
        <FacebookApp
          ref={(ref) => { this._navigator = ref; }}
          onNavigationStateChange={this.navigationStateChange}
          screenProps={{
            showModal: (content) => { this.setState({ modalVisible: true, modalView: content }); },
            updateRating: this.updateReviewsRatingThreshold,
            settings,
            updateCriteria: this.updateCriteriaSetting,
          }}
        />
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
        toggle={() => {}}
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
        toggle={() => {}}
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
        toggle={() => {}}
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
    {[ 1, 2, 3, 4, 5 ].map(rating => (
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

const FacebookApp = new StackNavigator({
  Home: {
    screen: Cards,
  },
  SwitchAccounts: {
    screen: SwitchAccounts,
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
};

const settingsInstructions = {
  autoLikeComments: 'Comma separated words and phrases to indicate a like:',
  autoHideComments: 'Comma separated words and phrases to avoid:',
};
