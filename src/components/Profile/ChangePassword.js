import React, { Component } from "react"
import { View, StatusBar, Text, Alert } from "react-native"
import { TextInput, Button } from "react-native-paper"

import Header from "../Utility/Header"
import { auth, authTest } from "../Auth/FirebaseInit"

/**
 * Change password for user logged in
 * 
 * @author Adam Lyon W19023403
 */
class ChangePassword extends Component {
    constructor(props) {
        super(props)
        this.state = {
            currentPassword: "",
            currentPasswordErrorMessage: null,
            currentPasswordUnderline: "white",
            currentPasswordShow: false,

            password1: "",
            password1ErrorMessage: null,
            password1Underline: "white",
            password1Show: false,

            password2: "",
            password2ErrorMessage: null,
            password2Underline: "white",
            password2Show: false
        }
    }

    /** @param value string Current password being entered */
    currentPasswordChanged = (value) => {
        this.setState({ currentPassword: value })
    }
    currentPasswordLostFocus = () => {
        if (this.state.currentPassword.length === 0) { // current password field is blank
            this.setState({ currentPasswordErrorMessage: "Should not be empty", currentPasswordUnderline: "red" })
            return true
        } else {
            this.setState({ currentPasswordErrorMessage: null, currentPasswordUnderline: "white" })
        }
        return false
    }
    /** Toggle show the current password */
    currentPasswordShow = () => {
        this.setState({ currentPasswordShow: !this.state.currentPasswordShow })
    }

    /** @param value string New password first one */
    password1Changed = (value) => {
        this.setState({ password1: value })
    }
    password1LostFocus = () => {
        if (this.state.password1.length === 0) { // new password field is empty
            this.setState({ password1ErrorMessage: "Should not be empty", password1Underline: "red" })
            return true
        } else {
            if (this.state.password1.length < 6) { // password is less than 6 characters
                this.setState({ password1ErrorMessage: "Should be at least 6 characters", password1Underline: "red" })
                return true
            } else {
                this.setState({ password1ErrorMessage: null, password1Underline: "white" })
            }
        }
        return false
    }
    /** Toggle show the new password */
    password1Show = () => {
        this.setState({ password1Show: !this.state.password1Show })
    }

    /** @param value string New password repeat */
    password2Changed = (value) => {
        this.setState({ password2: value })
    }
    password2LostFocus = () => {
        if (this.state.password2.length === 0) { // new repeat password field is empty
            this.setState({ password2ErrorMessage: "Repeat new password", password2Underline: "red" })
            return true
        } else {
            if (this.state.password1 !== this.state.password2) { // new password doesn't match the repeated password
                this.setState({ password2ErrorMessage: "Password does not match", password2Underline: "red" })
                return true
            } else {
                this.setState({ password2ErrorMessage: null, password2Underline: "white" })
            }
        }
        return false
    }
    /** Toggle show the new repeated password */
    password2Show = () => {
        this.setState({ password2Show: !this.state.password2Show })
    }

    /** Change password  */
    changePasswordPressed = () => {
        /** Check all data inputs are valid */
        const currentPassword = this.currentPasswordLostFocus()
        const password1Check = this.password1LostFocus()
        const password2Check = this.password2LostFocus()

        if (!currentPassword && !password1Check && !password2Check) {
            const credential = authTest.EmailAuthProvider.credential(auth.currentUser.email, this.state.currentPassword) 
            auth.currentUser.reauthenticateWithCredential(credential)
            .then(() => { // current password entered matches, change password
                auth.currentUser.updatePassword(this.state.password1)
                .then(() => { // Password update worked notify user
                    Alert.alert(
                        "Password Changed",
                        "Your new password has been set, Please login again with your new details!"
                    )
                    auth.signOut()
                    this.props.navigation.navigate("Find Teams")
                })
            })
            .catch(() => { // incorrect current password
                this.setState({ currentPasswordErrorMessage: "Doesn't match your current password", currentPasswordUnderline: "red" })
            })
        }
    }

    render() {
        /**
         * Render change password screen with 3
         * text inputs for current password, new
         * password and repeated new passwrod, option
         * to choose to change password and cancel
         */
        return (
            <View style={{backgroundColor: "#21A361", flex: 1}}>
                <Header color={"white"} title="CHANGE PASSWORD" marginTop={StatusBar.currentHeight+5} />

                <TextInput
                    testID='current-password-input'
                    label="Current Password"
                    secureTextEntry={!this.state.currentPasswordShow}
                    right={<TextInput.Icon name={require("../../assets/images/icons/eye.png")} color={"white"} onPress={this.currentPasswordShow} />}
                    selectionColor='white'
                    underlineColor={this.state.currentPasswordUnderline}
                    activeUnderlineColor={this.state.currentPasswordUnderline}
                    backgroundColor="#21A361"
                    style={{ width: "80%", marginLeft: "10%" }}
                    theme={{ colors: { text: "white", background: "transparent", placeholder: "white" } }}
                    onChangeText={this.currentPasswordChanged}
                    onBlur={this.currentPasswordLostFocus}
                    blurOnSubmit={false}
                />
                <Text style={{ marginLeft: "10%", color: "red" }}>{ this.state.currentPasswordErrorMessage }</Text>
                
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

                <Button
                    mode="contained"
                    color="#F29F22"
                    style={{ width: "80%", marginLeft: "10%", marginTop: 20 }}
                    labelStyle={{ color: "white", fontWeight: "bold" }}
                    onPress={this.changePasswordPressed}
                >
                    CHANGE PASSWORD
                </Button>

                <Button
                    mode="contained"
                    color="red"
                    style={{ width: "80%", marginLeft: "10%", marginTop: 20 }}
                    labelStyle={{ color: "white", fontWeight: "bold" }}
                    onPress={() => this.props.navigation.goBack()}
                >
                    CANCEL
                </Button>

            </View>
        )  
    }
}

export default ChangePassword