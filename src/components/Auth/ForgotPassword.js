import React, { Component } from 'react';
import { View, StatusBar, Text, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';

import Header from "../Utility/Header"
import { auth } from "./FirebaseInit"

/**
 * Send a reset password if the entered email is
 * associated with an account
 * 
 * @author Adam Lyon W19023403
 */
class ForgotPassword extends Component {
    constructor(props) {
        super(props)
        this.state = {
            email: "",
            emailErrorMessage: null,
            emailUnderline: "white",
        }
    }

    /** @param value string Update email state with entered text */
    emailChanged = (value) => {
        this.setState({ email: value })
    }
    emailLostFocus = () => {
        if (this.state.email.length === 0) { // no characters entered
            this.setState({ emailErrorMessage: "Should not be empty", emailUnderline: "red" })
            return true
        } else {
            if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.state.email)) { // valid email address
                this.setState({ emailErrorMessage: null, emailUnderline: "white" })
            } else {
                this.setState({ emailErrorMessage: "Not a valid email address", emailUnderline: "red" })
                return true
            }
        }
        return false
    }

    /**
     * Reset password button pressed send
     * reset email to the entered email address
     */
    ResetPressed = () => {  
        const emailCheck = this.emailLostFocus() // check it's a valid email address
        if (!emailCheck) {
            auth.sendPasswordResetEmail(this.state.email) // reset password email to the entered email
            .then(() => {
                Alert.alert( // Let the user know an email has sucessfully been sent
                    "FORGOT PASSWORD",
                    "Check your email address, to reset your password please allow up 10 minutes before trying again!"
                )
                this.props.goBack() // return to login view
            })
            .catch(() => { // not valid
                this.setState({ emailErrorMessage: "Incorrect email", emailUnderline: "red" })
            })
        }
    }

    render() {
        /**
         * Enter email address then either send email, or go back to previous screen
         */
        return (
            <View style={{ position: "absolute", width: "80%", backgroundColor: "#21A361", marginLeft: "10%", marginTop: StatusBar.currentHeight, borderRadius: 30,}}>
                <Header color={"white"} title="Login" marginTop={0} />
                <TextInput
                    testID='email-input'
                    label="Email"
                    selectionColor='white'
                    underlineColor={this.state.emailUnderline}
                    activeUnderlineColor={this.state.emailUnderline}
                    backgroundColor="#21A361"
                    style={{ width: "80%", marginLeft: "10%" }}
                    theme={{ colors: { text: "white", placeholder: "white" } }}
                    onChangeText={this.emailChanged}
                    onBlur={this.emailLostFocus}
                    blurOnSubmit={false}
                    onSubmitEditing={() => { this.passwordInput.focus() }}
                />
                <Text style={{ marginLeft: "10%", color: "red", padding: 0 }}>{ this.state.emailErrorMessage }</Text>
                                
                <Button mode='contained' onPress={this.ResetPressed} style={{ width: "60%", marginLeft: "20%", marginVertical: 5, backgroundColor: "orange" }} labelStyle={{fontWeight: "bold", fontSize: 17}}>
                    RESET
                </Button>
                <Button mode='contained' onPress={this.props.goBack} style={{ width: "60%", marginLeft: "20%", marginVertical: 5, backgroundColor: "red" }} labelStyle={{fontWeight: "bold", fontSize: 17}}>
                    CANCEL
                </Button>
            </View>
        )
    }
}

export default ForgotPassword