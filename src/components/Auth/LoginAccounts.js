import React, { Component } from 'react';
import { View, StatusBar, Text, TouchableOpacity } from 'react-native';
import { TextInput, Button } from 'react-native-paper';

import Header from '../Utility/Header';

/**
 * Used for testing / demo easy log into pre-created accounts to save time, this
 * component will not make it to the final build
 * 
 * @author Adam Lyon W19023403
 */
class LoginAccounts extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loginAccounts: [
                { name: "League/Team/Ref Owner", email: "a.lyon2077@gmail.com", password: "TestTest" }
            ]
        }
    }

    render() {
        return (
            <View style={{ position: "absolute", width: "80%", backgroundColor: "#21A361", marginLeft: "10%", marginTop: StatusBar.currentHeight, borderRadius: 30}}>
                <View style={{ marginBottom: 30 }}>
                    <Header color={"white"} title="Login" marginTop={0} />
                    <View style={{ marginTop: 30 }}></View>
                    {
                        this.state.loginAccounts.map((account, index) => (
                            <TouchableOpacity
                                style={{ backgroundColor: "green", width: "70%", marginLeft: "15%", padding: 20, borderRadius: 12 }}
                                key={index}
                                onPress={() => {
                                    this.props.emailChanged(account.email)
                                    this.props.passwordChanged(account.password)
                                    this.props.loginAccountsBool()
                                }}
                            >
                                <Text style={{ color: "white", textAlign: "center" }}>{account.name}</Text>
                            </TouchableOpacity>
                        ))
                    }
                </View>
            </View>
        )
    }
}

export default LoginAccounts