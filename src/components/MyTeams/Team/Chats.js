import React, { Component } from "react"
import { ScrollView, View } from "react-native"
import { TextInput, IconButton } from "react-native-paper"

import { auth, db } from "../../Auth/FirebaseInit"
import Chat from "./Chat"

/**
 * Main chat screen and
 * send messages
 * 
 * @author Adam Lyon W19023403
 */
class Chats extends Component {
    constructor(props) {
        super(props)
        this.state = {
            message: ""
        }
    }

    /** @param value string Message box changed */
    MessageChanged = (value) => {
        this.setState({ message: value })
    }

    /**
     * Add message to the firestore chat collection
     * attach user details for kit number, name and
     * timestamp of message
     * 
     * @param message string Message being sent
     */
    SendMessage = (message) => {
        db
        .collection("Leagues")
        .doc(this.props.leagueID)
        .collection("Divisions")
        .doc(this.props.division)
        .collection("Teams")
        .doc(this.props.teamID)
        .collection("Messages")
        .add({
            message: message.trim(), // remove whitespace
            timestamp: Date.now(),
            user: {
                id: auth.currentUser.uid,
                name: auth.currentUser.displayName,
                number: this.props.kitNumber
            }
        })
        this.setState({ message: "" }) // clear message box
    }

    render() {
        /**
         * Render main screen, show all chats and at bottom
         * have message text box and send button to send
         * the entered message, autoscroll to end
         */
        return (
            <>
                <ScrollView
                    ref={ref => {this.scrollView = ref}}
                    onContentSizeChange={() => this.scrollView.scrollToEnd({ animated: false })}
                >
                    {
                        this.props.messages.map((message, index) => { 
                            return(
                                <Chat key={index} message={message} kitStyle={this.props.kitStyle} />
                            )
                        })
                    }
                </ScrollView>
                <View style={{ flexDirection: "row", margin: 5 }}>
                    <TextInput
                        selectionColor='white'
                        underlineColor="white"
                        activeUnderlineColor="white"
                        backgroundColor="#21A361"
                        theme={{ colors: { text: "white", placeholder: "white" } }}
                        style={{ flex: 1 }}
                        mode="flat"
                        label="Message"
                        value={this.state.message}
                        onChangeText={this.MessageChanged}
                        multiline={true}
                    />
                    <IconButton
                        icon={require("../../../assets/images/icons/send.png")}
                        color={"#21A361"}
                        style={{ backgroundColor: "black", alignSelf: "center" }}
                        size={28}
                        onPress={() => this.SendMessage(this.state.message)}
                    />
                </View>
            </>
        )
    }
}

export default Chats