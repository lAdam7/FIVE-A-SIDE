import React, { Component } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"

import Kit from "../../../Utility/Kit"
import { KIT_STYLE } from "../../../FindTeam/KitData"

/**
 * Add a card event to a live match
 * 
 * @author Adam Lyon W19023403
 */
class GiveCard extends Component {
    /**
     * Create the JSON required for a card event, and
     * return to parent component to add to the firestore
     * database
     * 
     * @param player JSON of player
     * @param teamID string team ID event associated with
     */
    addCard = (player, teamID) => {
        const data = {
            event: (this.props.events.filter(event => event.playerID === player.uid).length) === 1 ? "Red Card" : "Yellow Card",
            teamID: teamID,
            playerID: player.uid,
            timestamp: Math.floor(Date.now()/1000),
            teamA: teamID === this.props.teamAID,
            displayName: player.displayName
        }

        this.props.playerChosen(data)
    }
    
    render() {
        /**
         * Show all players that are playing, with current card state highlighted in background colour
         * colurs can be none, yellow and red
         */
        return (
            <View style={{ flexDirection: "row" }}>
                <View style={{ width: "50%" }}>
                    { 
                        (this.props.teamAMembers !== null)
                            ?
                                this.props.teamAMembers.filter(member => member.active).map((player, index) => { // for every team A player, get card status and show user kit with name
                                    let cardCount = this.props.events.filter(event => (event.event === "Yellow Card" || event.event === "Red Card") && event.playerID === player.uid).length
                                    return (
                                        <TouchableOpacity onPress={() => (cardCount !== 2) ? this.addCard(player, this.props.teamAID) : null} activeOpacity={1} key={index} style={[styles.kitContainer, { backgroundColor: (cardCount === 0) ? "transparent" : (cardCount === 1) ? "yellow" : "red" , borderRadius: 12, padding: 10 }]}>
                                            <Kit
                                                kitLeftLeft={KIT_STYLE[this.props.teamAKit].kitLeftLeft}
                                                kitLeft={KIT_STYLE[this.props.teamAKit].kitLeft}
                                                kitMiddle={KIT_STYLE[this.props.teamAKit].kitMiddle}
                                                kitRight={KIT_STYLE[this.props.teamAKit].kitRight}
                                                kitRightRight={KIT_STYLE[this.props.teamAKit].kitRightRight}
                                                numberColor={KIT_STYLE[this.props.teamAKit].numberColor}
                                                kitNumber={player.number}
                                            />
                                            <Text style={{ color: "black", textAlign: "center", fontSize: 14, fontWeight: "bold" }}>{player.displayName}</Text>
                                        </TouchableOpacity>
                                    )
                                })
                            : null
                    }
                </View>

                <View style={{ width: "50%"}}>
                    { 
                        (this.props.teamBMembers !== null)
                            ?
                                this.props.teamBMembers.filter(member => member.active).map((player, index) => { // for every team B player, get card status and show user kit with name
                                    let cardCount = this.props.events.filter(event => (event.event === "Yellow Card" || event.event === "Red Card") && event.playerID === player.uid).length
                                    return (
                                        <TouchableOpacity onPress={() => (cardCount !== 2) ? this.addCard(player, this.props.teamBID) : null} activeOpacity={1} key={index} style={[styles.kitContainer, { backgroundColor: (cardCount === 0) ? "transparent" : (cardCount === 1) ? "yellow" : "red" , borderRadius: 12, padding: 10 }]}>
                                            <Kit
                                                kitLeftLeft={KIT_STYLE[this.props.teamBKit].kitLeftLeft}
                                                kitLeft={KIT_STYLE[this.props.teamBKit].kitLeft}
                                                kitMiddle={KIT_STYLE[this.props.teamBKit].kitMiddle}
                                                kitRight={KIT_STYLE[this.props.teamBKit].kitRight}
                                                kitRightRight={KIT_STYLE[this.props.teamBKit].kitRightRight}
                                                numberColor={KIT_STYLE[this.props.teamBKit].numberColor}
                                                kitNumber={player.number}
                                            />
                                            <Text style={{ color: "black", textAlign: "center", fontSize: 14, fontWeight: "bold" }}>{player.displayName}</Text>
                                        </TouchableOpacity>
                                    )
                                })
                            : null
                    }
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#21A361",
        position: "absolute",
        zIndex: 5,
		width: "100%", 
        height: "100%",
	},
    kitContainer: {
		width: 110,
        marginLeft: "auto",
        marginRight: "auto",
        marginVertical: 5
	}
})

export default GiveCard