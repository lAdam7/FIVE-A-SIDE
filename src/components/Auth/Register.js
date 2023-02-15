import React, { Component } from "react"
import { StatusBar, Text, ScrollView, Alert } from "react-native"
import { connect } from "react-redux"
import { TextInput, Button } from "react-native-paper"

import Header from "../Utility/Header"
import { LOGGED_IN_ACTION } from "../../redux/actions/authenticate"
import { auth, db } from "./FirebaseInit"

/**
 * Registering for a five-a-side account requires
 * the users email, username, password and a 
 * re-type of the password with validation on all
 * fields required
 * 
 * @author Adam Lyon W19023403
 */
class Register extends Component {
    constructor(props) {
        super(props)
        this.state = {
            email: "",
            emailErrorMessage: null,
            emailUnderline: "white",

            username: "",
            usernameErrorMessage: null,
            usernameUnderline: "white",

            password1: "",
            password1ErrorMessage: null,
            password1Underline: "white",
            password1Show: false,

            password2: "",
            password2ErrorMessage: null,
            password2Underline: "white",
            password2Show: false,

            registering: false
        }
    }

    /** @param value string Update email state, as text is entered */
    emailChanged = (value) => {
        this.setState({ email: value })
    }
    emailLostFocus = () => {
        if (this.state.email.length === 0) { // nothing entered
            this.setState({ emailErrorMessage: "Should not be empty", emailUnderline: "red" })
            return true
        } else {
            if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.state.email)) { // email is valid
                this.setState({ emailErrorMessage: null, emailUnderline: "white" })
            } else {
                this.setState({ emailErrorMessage: "Not a valid email address", emailUnderline: "red" })
                return true
            }
        }
        return false
    }

    /** @param value string Update username state, as text is entered */
    usernameChanged = (value) => {
        this.setState({ username: value })
    }
    usernameLostFocus = () => {
        if (this.state.username.length === 0) { // nothing entered
            this.setState({ usernameErrorMessage: "Should not be empty", usernameUnderline: "red" })
            return true
        } else {
            if (this.state.username.length < 6) { // username isn't at least 6 characters long
                this.setState({ usernameErrorMessage: "Should be at least 6 characters", usernameUnderline: "red" })
                return true
            } else {
                this.setState({ usernameErrorMessage: null, usernameUnderline: "white" })
            }
        }
        return false
    }

    /** @param value string Update first password state, as text is entered */
    password1Changed = (value) => {
        this.setState({ password1: value })
    }
    password1LostFocus = () => {
        if (this.state.password1.length === 0) { // nothing entered
            this.setState({ password1ErrorMessage: "Should not be empty", password1Underline: "red" })
            return true
        } else {
            if (this.state.password1.length < 6) { // first password isn't at least 6 characters long
                this.setState({ password1ErrorMessage: "Should be at least 6 characters", password1Underline: "red" })
                return true
            } else {
                this.setState({ password1ErrorMessage: null, password1Underline: "white" })
            }
        }
        return false
    }
    /** Toggle first password, between ** and text */
    password1Show = () => {
        this.setState({ password1Show: !this.state.password1Show })
    }

    /** @param value string Update repeat password state, as text is entered */
    password2Changed = (value) => {
        this.setState({ password2: value })
    }
    password2LostFocus = () => {
        if (this.state.password2.length === 0) { // nothing entered
            this.setState({ password2ErrorMessage: "Repeat new password", password2Underline: "red" })
            return true
        } else {
            if (this.state.password1 !== this.state.password2) { // first password does not match the repeated password
                this.setState({ password2ErrorMessage: "Password does not match", password2Underline: "red" })
                return true
            } else {
                this.setState({ password2ErrorMessage: null, password2Underline: "white" })
            }
        }
        return false
    }
    /** Toggle repeat password, between ** and text */
    password2Show = () => {
        this.setState({ password2Show: !this.state.password2Show })
    }
    
    /** 
     * Register button pressed check all inputs are valid,
     * if so create the account and a email verification to the 
     * user and wait, for valid success
     */
    registerPressed = () => {
        /** Check all inputs are valid */
        const emailCheck = this.emailLostFocus()
        const usernameCheck = this.usernameLostFocus()
        const password1Check = this.password1LostFocus()
        const password2Check = this.password2LostFocus()
        
        if (!emailCheck && !usernameCheck && !password1Check && !password2Check) {
            this.setState({ registering: true }) // Registering in process
            auth.createUserWithEmailAndPassword(this.state.email, this.state.password1) // Create user with given email and password
            .then((result) => { // User has been created
                result.user.sendEmailVerification()
                
                /** Create user firestore database profile, with there username and default statistics that can later be incremented */
                db
                .collection("Users")
                .doc(result.user.uid)
                .set({
                    pushToken: null,
                    matchesPlayed: 0,
                    goalsScored: 0,
                    minutesPlayed: 0,
                    username: this.state.username
                })
                /** Set display name with the logged-in user state (easier access, if it's the logged-in user) */
                result.user.updateProfile({
                    displayName: this.state.username
                })

                Alert.alert(
                    "Account created!",
                    "Please verify your account, a email has been sent!"
                )
                
                /** Wait for the account to be verified before logging-in */
                const onIdTokenChangedUnsubscribe = auth.onIdTokenChanged((user) => {
                    if (user && user.emailVerified) {
                        console.log("VERIFIED")
                        this.setState({ registering: false })
                        this.props.update(true)
                        return onIdTokenChangedUnsubscribe(); //unsubscribe
                    }
                    setTimeout(() => {
                      result.user.reload();
                      result.user.getIdToken(/* forceRefresh */ true);
                    }, 5000);
                });
            })
            .catch(() => { // duplicate email, display error message
                this.setState({ registering: false, emailUnderline: "red", emailErrorMessage: "Email already in use" })
            })
        }
    }

    render() {
        /**
         * Render the email, username, first password and reset password fields required
         * for registering an account
         */
        return (
            <ScrollView keyboardShouldPersistTaps={"handled"} style={{ position: "absolute", width: "80%", backgroundColor: "#21A361", marginLeft: "10%", marginTop: StatusBar.currentHeight, borderRadius: 30, height: "auto", maxHeight: "100%"}}>
                <Header color={"white"} title="Register" marginTop={0} />
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
                    onSubmitEditing={() => { this.password1Input.focus() }}
                />
                <Text style={{ marginLeft: "10%", color: "red" }}>{ this.state.emailErrorMessage }</Text>
                <TextInput
                    testID='username'
                    label="Username"
                    selectionColor='white'
                    underlineColor={this.state.usernameUnderline}
                    activeUnderlineColor={this.state.usernameUnderline}
                    backgroundColor="#21A361"
                    style={{ width: "80%", marginLeft: "10%" }}
                    theme={{ colors: { text: "white", placeholder: "white" } }}
                    onChangeText={this.usernameChanged}
                    onBlur={this.usernameLostFocus}
                />
                <Text style={{ marginLeft: "10%", color: "red" }}>{ this.state.usernameErrorMessage }</Text>
                <TextInput
                    testID='password-input'
                    label="Password"
                    secureTextEntry={!this.state.password1Show}
                    right={<TextInput.Icon name={require("../../assets/images/icons/eye.png")} color={"white"} onPress={this.password1Show} />}
                    selectionColor='white'
                    underlineColor={this.state.password1Underline}
                    activeUnderlineColor={this.state.password1Underline}
                    backgroundColor="#21A361"
                    style={{ width: "80%", marginLeft: "10%" }}
                    theme={{ colors: { text: "white", background: "transparent", placeholder: "white" } }}
                    onChangeText={this.password1Changed}
                    onBlur={this.password1LostFocus}
                    blurOnSubmit={false}
                    ref={(input) => { this.password1Input = input }}
                    onSubmitEditing={() => { this.password2Input.focus() }}
                />
                <Text style={{ marginLeft: "10%", color: "red" }}>{ this.state.password1ErrorMessage }</Text>
                <TextInput
                    testID='confirm-password-input'
                    label="Confirm Password"
                    secureTextEntry={!this.state.password2Show}
                    right={<TextInput.Icon name={require("../../assets/images/icons/eye.png")} color={"white"} onPress={this.password2Show} />}
                    selectionColor='white'
                    underlineColor={this.state.password2Underline}
                    activeUnderlineColor={this.state.password2Underline}
                    backgroundColor="#21A361"
                    style={{ width: "80%", marginLeft: "10%" }}
                    theme={{ colors: { text: "white", background: "transparent", placeholder: "white" } }}
                    onChangeText={this.password2Changed}
                    onBlur={this.password2LostFocus}
                    blurOnSubmit={false}
                    ref={(input) => { this.password2Input = input }}
                />
                <Text style={{ marginLeft: "10%", marginBottom: 10, color: "red" }}>{ this.state.password2ErrorMessage }</Text>
                <Button mode='contained' loading={this.state.registering} onPress={this.registerPressed} style={{ width: "60%", marginLeft: "20%", marginVertical: 5, backgroundColor: "orange" }} labelStyle={{fontWeight: "bold", fontSize: 17}}>
                    REGISTER
                </Button>
                <Button mode='contained' onPress={this.props.goBack} style={{ width: "60%", marginLeft: "20%", marginVertical: 5, backgroundColor: "red" }} labelStyle={{fontWeight: "bold", fontSize: 17}}>
                    CANCEL
                </Button>
            </ScrollView>
        )
    }
}

/** Get authentication status, and ability to update the logged-in status on the redux store */
const mapStateToProps = (state) => {
	return {
		authentication: state.authenticateReducer.logged
	}
}
const mapDispatchToProps = (dispatch) => {
    return {
        update: (value) => dispatch(LOGGED_IN_ACTION(value))
    }
}

export default connect(mapStateToProps, mapDispatchToProps) (Register)