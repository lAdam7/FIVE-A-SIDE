import React, { Component } from "react"
import { View, Text, StyleSheet } from "react-native"

import Kit from "../../Utility/Kit"
import { KIT_STYLE } from "../../FindTeam/KitData"
import { auth } from "../../Auth/FirebaseInit"

/**
 * For each individual chat, style 
 * on left if user is not the one logged on with kit,
 * if message from logged in user the text appears
 * on the right
 * 
 * @author Adam Lyon W19023403
 */
class Chat extends Component {
    render() {
        const date = new Date(this.props.message.timestamp)
        /** Message is from logged-on user */
        if (auth.currentUser !== null && auth.currentUser.uid === this.props.message.user.id) {
            return (
                <View style={{ flexDirection: "row" }}>
                    <View style={{ flex: 1 }}></View>
                    <View>
                        <View style={{ backgroundColor: "#086134", padding: 5, paddingHorizontal: 15, borderRadius: 7, marginTop: 10, maxWidth: 225, marginRight: 10 }}>
                            <Text style={{ color: "white", fontSize: 16 }}>{this.props.message.message}</Text>
    
                            <View style={{ flexDirection: "row" }}>
                                <View style={{ flex: 1 }}></View>
                                <Text style={{ color: "white", fontSize: 10 }}>{date.getHours() + ":" + date.getMinutes().toString().padStart(2, "0")} {(date.getHours() >= 12) ? "PM" : "AM"}</Text>
                            </View>

                        </View>
                    </View>
                </View>
            )
        } else { /** Message is from a different user, put on left and with kit */
            return (
                <View style={{ flexDirection: "row" }}>
                    <View style={styles.kitContainer}>
                        {
                            (this.props.kitStyle === undefined)
                            ? null
                            :   
                                <Kit
                                    kitLeftLeft={KIT_STYLE[this.props.kitStyle].kitLeftLeft}
                                    kitLeft={KIT_STYLE[this.props.kitStyle].kitLeft}
                                    kitMiddle={KIT_STYLE[this.props.kitStyle].kitMiddle}
                                    kitRight={KIT_STYLE[this.props.kitStyle].kitRight}
                                    kitRightRight={KIT_STYLE[this.props.kitStyle].kitRightRight}
                                    numberColor={KIT_STYLE[this.props.kitStyle].numberColor}
                                    kitNumber={this.props.message.user.number}
                                    width={12}
                                    height={65}
                                    fontSize={32}
                                />
                        }
                    </View>

                    <View>
                        <View style={{ backgroundColor: "#086134", padding: 5, paddingHorizontal: 15, borderRadius: 7, marginTop: 10, maxWidth: 225, marginRight: 10 }}>
                            <Text style={{ color: "white", fontSize: 13, opacity: .7 }}>{this.props.message.user.name}</Text>
                            <Text style={{ color: "white", fontSize: 16 }}>{this.props.message.message}</Text>
    
                            <View style={{ flexDirection: "row" }}>
                                <View style={{ flex: 1 }}></View>
                                <Text style={{ color: "white", fontSize: 10 }}>{date.getHours() + ":" + date.getMinutes().toString().padStart(2, "0")} {(date.getHours() >= 12) ? "PM" : "AM"}</Text>
                            </View>
                            
                        </View>
                    </View>  
                    
                </View>
            )
        }
    }
}

const styles = StyleSheet.create({
	kitContainer: {
		width: 65,
        marginVertical: 5
	}
})

export default Chat