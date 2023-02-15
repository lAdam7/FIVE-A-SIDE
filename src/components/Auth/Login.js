import React, { Component } from 'react';
import { View, StatusBar, Text } from 'react-native';
import { TextInput, Button } from 'react-native-paper';

import Header from "../Utility/Header"
import { auth } from "./FirebaseInit"
import Register from './Register';
import ForgotPassword from './ForgotPassword';

import LoginAccounts from './LoginAccounts';

/**
 * Login into the application, navigation routes to help and 
 * when forgetting password register a new accounnt
 * 
 * @author Adam Lyon W19023403
 */
class Login extends Component {
    constructor(props) {
        super(props)
        this.state = {
            email: "",
            emailErrorMessage: null,
            emailUnderline: "white",

            password: "",
            passwordErrorMessage: null,
            passwordUnderline: "white",
            showPassword: false,

            registerPressed: false,
            forgotPasswordPressed: false,

            loggingIn: false,

            loginAccounts: false
        }
    }

    /** @param value string Update email address as text is entered */
    emailChanged = (value) => {
        this.setState({ email: value })
    }
    emailLostFocus = () => {
        if (this.state.email.length === 0) { // nothing entered
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

    /** @param value string Update password as text is entered */
    passwordChanged = (value) => {
        this.setState({ password: value })
    }
    passwordLostFocus = () => {
        if (this.state.password.length === 0) { // nothing entered
            this.setState({ passwordErrorMessage: "Should not be empty", passwordUnderline: "red" })
            return true
        } else { // no extra checks for security purpose
            this.setState({ passwordErrorMessage: null, passwordUnderline: "white" })
        }
        return false
    }

    /** Toggle entered password between **** and text */
    showPassword = () => {
        this.setState({ showPassword: !this.state.showPassword })
    }
    /** Register screen active status */
    registerPressed = () => {
        this.setState({ registerPressed: !this.state.registerPressed })
    }
    /** Forgot password active status */
    forgotPasswordPressed = () => {
        this.setState({ forgotPasswordPressed: !this.state.forgotPasswordPressed })
    }

    /** Login button pressed, try login */
    loginPressed = () => {  
        // Check the email and password inputs are valid and thus can try login
        const emailCheck = this.emailLostFocus()
        const passwordCheck = this.passwordLostFocus()

        if (!emailCheck && !passwordCheck) {
            this.setState({ loggingIn: true }) // loading icon
            auth.signInWithEmailAndPassword(this.state.email, this.state.password) // login successful
            .then(() => { // details correct, logged in return to map view
                this.props.goBack() 
            })
            .catch(() => { // details incorrect, display error message
                this.setState({ passwordErrorMessage: "Incorrect email or password", emailUnderline: "red", passwordUnderline: "red" })
            })
            this.setState({ loggingIn: false }) // loading finished
        }
    }

    loginAccountsBool = () => {
        this.setState({ loginAccounts: !this.state.loginAccounts })
    }

    render() {
        if (this.state.loginAccounts) {
            return (
                <LoginAccounts loginAccountsBool={this.loginAccountsBool} emailChanged={this.emailChanged} passwordChanged={this.passwordChanged} />
            )
        } else if (!this.state.registerPressed && !this.state.forgotPasswordPressed) {
            /**
             * Not registering or getting a password email so render just the 
             * screen to login into the application, with the buttons available
             * for other functionality
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
                        value={this.state.email}
                        onSubmitEditing={() => { this.passwordInput.focus() }}
                    />
                    <Text style={{ marginLeft: "10%", color: "red", padding: 0 }}>{ this.state.emailErrorMessage }</Text>
                    <TextInput
                        testID='password-input'
                        label="Password"
                        secureTextEntry={!this.state.showPassword}
                        right={<TextInput.Icon name={require("../../assets/images/icons/eye.png")} color={"white"} onPress={this.showPassword} />}
                        selectionColor='white'
                        underlineColor={this.state.passwordUnderline}
                        activeUnderlineColor={this.state.passwordUnderline}
                        backgroundColor="#21A361"
                        style={{ marginBottom: 10, width: "80%", marginLeft: "10%" }}
                        theme={{ colors: { text: "white", background: "transparent", placeholder: "white" } }}
                        onChangeText={this.passwordChanged}
                        onBlur={this.passwordLostFocus}
                        blurOnSubmit={false}
                        value={this.state.password}
                        ref={(input) => { this.passwordInput = input }}
                    />
                    { 
                        (this.state.passwordErrorMessage !== null)
                        ? <Text style={{ marginLeft: "10%", color: "red" }}>{ this.state.passwordErrorMessage }</Text>
                        : null
                    }
                    <Button onPress={this.loginAccountsBool}>
                        LOGIN ACCOUNTS
                    </Button>        
                    <Button onPress={this.forgotPasswordPressed}>
                        Forgot Password
                    </Button>
                    
                    <Button mode='contained' loading={this.state.loggingIn} backgroundColor="red" onPress={this.loginPressed} style={{ width: "60%", marginLeft: "20%", marginVertical: 5 }} labelStyle={{fontWeight: "bold", fontSize: 17}} >
                        LOGIN
                    </Button>
                    <Button mode='contained' onPress={this.registerPressed} style={{ width: "60%", marginLeft: "20%", marginVertical: 5, backgroundColor: "orange" }} labelStyle={{fontWeight: "bold", fontSize: 17}}>
                        REGISTER
                    </Button>
                    <Button mode='contained' onPress={this.props.goBack} style={{ width: "60%", marginLeft: "20%", marginVertical: 5, backgroundColor: "red" }} labelStyle={{fontWeight: "bold", fontSize: 17}}>
                        CANCEL
                    </Button>
                </View>
            )
        } else if (this.state.registerPressed) {
            /** Registering render screen */
            return (<Register goBack={this.registerPressed} />)
        } else {
            /** Forgot password render screen */
            return (<ForgotPassword goBack={this.forgotPasswordPressed} />)
        }
    }
}

export default Login