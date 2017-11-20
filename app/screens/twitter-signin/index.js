import React, { Component } from 'react';
import { View, Text, TextInput, TouchableHighlight, Linking } from 'react-native';
import twitter, { auth } from 'react-native-twitter';

import config from '../../config';
import styles from './styles';

export default class TwitterSignin extends Component {
    state = {
        login: '',
        password: '',
        showPassword: false
    }

    componentDidMount() {
        Linking.canOpenURL('socialauth://twitter').then((supported) => { console.warn(supported); })
    }

    signIn = async () => {
        try {
            const { accessToken, accessTokenSecret, id, name } = await auth(
                { consumerKey: config.twitterConsumerToken, consumerSecret: config.twitterConsumerSecret },
                'socialauth://twitter'
            );
            console.log(id);
        } catch(error) {
            console.warn('error');
            console.warn(error);
        };
    }

    handleSignInResult = (event) => {
        console.log(event);
        this.setState({ supported: 'some value' });
    }

    render() {
        const { login, password, showPassword, supported } = this.state;
        return (
            <View>
                <Text style={supported ? { color: 'red' } : { color: 'blue' }}>Twitter</Text>
                <Text>{`${supported}`}</Text>
                <TouchableHighlight onPress={this.signIn} style={styles.signInButton}>
                    <Text>Sign In With Twitter</Text>
                </TouchableHighlight>
            </View>
        );
    }
}
