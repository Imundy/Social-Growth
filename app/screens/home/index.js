import React, { Component } from 'react';
import {
  AsyncStorage,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import colors from '../../styles/colors';
import styles from './styles';

Animatable.initializeRegistryWithDefinitions({
  errorAnimation: {
    from: {
      opacity: 0,
      height: 0,
      translateY: 20,
    },
    to: {
      height: 20,
      opacity: 1,
      translateY: 0,
    },
  },
});

export default class Home extends Component {
  state = {
    hasLoaded: false,
    signIn: true,
    email: '',
    password: '',
    confirmation: '',
  };

  componentDidMount = async () => {
    const accountId = await AsyncStorage.getItem('accountId');
    if (accountId != null) {
      this.props.navigation.navigate('Twitter');
    }

    setTimeout(() => {
      this.setState({
        hasLoaded: true,
      });
    }, 1000);
  }

  signIn = async () => {
    if (this.state.passwordError || this.state.emailError || this.state.email === '' || this.state.password === '') {
      return;
    }

    this.setState({
      formError: null,
    });

    try {
      const response = await fetch('http://localhost:3000/api/users/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: this.state.email,
          password: this.state.password,
        }),
      });

      if (response.status === 404 || response.status === 401) {
        this.setState({ formError: 'Invalid username or password' });
        return;
      } else if (response.status < 200 || response.status >= 300) {
        this.setState({ formError: 'An error occurred' });
        return;
      }

      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }

  register = async () => {
    if (this.state.passwordError || this.state.emailError || this.state.email === '' || this.state.password === '') {
      return;
    }

    this.setState({
      formError: null,
    });

    try {
      const response = await fetch('http://localhost:3000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: this.state.email,
          password: this.state.password,
        }),
      });

      if (response.status === 400) {
        this.setState({ formError: 'Invalid username or password' });
        return;
      } else if (response.status < 200 || response.status >= 300) {
        this.setState({ formError: 'An error occurred' });
        return;
      }

      const user = await response.json();
      if (user == null || user.userId == null) {
        this.setState({ formError: 'An error occurred' });
        return;
      }

      await AsyncStorage.setItem('accountId', user.userId.toString());
      this.props.navigation.navigate('Twitter');
    } catch (error) {
      console.log(error);
    }
  }

  updateEmail = (text) => { this.setState({ email: text }); }
  updatePassword = (text) => { this.setState({ password: text }); }
  updateConfirmation = (text) => { this.setState({ confirmation: text }); }

  toggle = () => {
    this.form.transitionTo({ height: this.state.signIn ? 250 : 140 }, 300);
    this.setState({ signIn: !this.state.signIn });
  }

  validateEmail = () => {
    const { email } = this.state;
    this.setState({
      emailError: email.match(emailRegex) == null ? 'Invalid email' : null,
    });
  }

  validatePassword = () => {
    const { password } = this.state;
    this.setState({
      passwordError: password.length < 7 ? 'Password must be 7 characters' : null,
    });
  }

  validateConfirmation = () => {
    const { confirmation, password } = this.state;
    this.setState({
      passwordError: password !== confirmation ? 'Passwords must match' : null,
    });
  }

  renderSigninForm = () => (
    <Animatable.View style={styles.form} ref={(ref) => { this.form = ref; }}>
      <TextInput
        style={styles.input}
        onChangeText={this.updateEmail}
        value={this.state.email}
        returnKeyType="next"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Email"
      />
      <TextInput
        style={styles.input}
        onChangeText={this.updatePassword}
        onBlur={this.validatePassword}
        value={this.state.password}
        secureTextEntry
        placeholder="Password"
      />
    </Animatable.View>
  );

  renderRegisterForm = () => (
    <Animatable.View style={styles.form} ref={(ref) => { this.form = ref; }}>
      {this.state.emailError && <Animatable.Text animation="errorAnimation" duration={200} style={{ color: colors.red, fontSize: 14 }}>{this.state.emailError}</Animatable.Text>}
      <TextInput
        style={styles.input}
        onChangeText={this.updateEmail}
        onBlur={this.validateEmail}
        value={this.state.email}
        returnKeyType="next"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Email"
      />
      {this.state.passwordError && <Animatable.Text animation="errorAnimation" duration={200} style={{ color: colors.red, fontSize: 14 }}>{this.state.passwordError}</Animatable.Text>}
      <TextInput
        style={styles.input}
        onChangeText={this.updatePassword}
        onBlur={this.validatePassword}
        value={this.state.password}
        secureTextEntry
        placeholder="Password"
      />
      <TextInput
        style={styles.input}
        onChangeText={this.updateConfirmation}
        onBlur={this.validateConfirmation}
        value={this.state.confirmation}
        secureTextEntry
        placeholder="Confirm password"
      />
    </Animatable.View>
  );

  renderButtons = () => [
    <TouchableOpacity key="1-butt" style={{ ...styles.option, backgroundColor: colors.blue }} onPress={this.state.signIn ? this.signIn : this.register}>
      <Text style={styles.optionText}>{this.state.signIn ? 'Sign In' : 'Register'}</Text>
    </TouchableOpacity>,
    <TouchableOpacity key="2-butt" style={styles.link} onPress={this.toggle}>
      <Text style={{ color: colors.blue, fontSize: 20, marginTop: 12 }}>{this.state.signIn ? 'Create a new account' : 'Already have an account?'}</Text>
    </TouchableOpacity>,
  ];

  render() {
    const { hasLoaded, signIn } = this.state;
    if (!hasLoaded) {
      return (
        <View style={[styles.container, { backgroundColor: colors.blue, justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: 'white', fontSize: 48 }}>Simply Grow</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 48, color: colors.blue, marginBottom: 12 }}>Simply Grow</Text>
        {this.state.formError && <Animatable.Text animation="errorAnimation" duration={200} style={{ color: colors.red, fontSize: 14 }}>{this.state.formError}</Animatable.Text>}
        {signIn ? this.renderSigninForm() : this.renderRegisterForm()}
        {this.renderButtons()}
      </View>
    );
  }
}

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

