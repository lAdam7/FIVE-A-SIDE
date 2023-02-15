import React, { Component } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"

import Kit from "../../../Utility/Kit"
import { KIT_STYLE } from "../../../FindTeam/KitData"

/**
 * Add a sub event to a live match
 * 
 * @author Adam Lyon W19023403
 */
class GiveSub extends Component {
    constructor(props) {
        super(props)
        this.state = {
            playerOff: null,
            teamID: null
        }
    }
    /**
     * Create the JSON required for a sub event, and
     * return to parent component to add to the firestore
     * database
     * 
     * @param playerOff JSON Player going off the pitch
     * @param playerOn JSON Player going on the pitch
     * @param teamID string The team ID for the event
     */
    addSub = (playerOff, playerOn, teamID) => {
        const data = {
            event: "Sub",
            teamID: teamID,
            playerIDOn: playerOn.uid,
            playerIDOff: playerOff.uid,
            timestamp: Math.floor(Date.now()/1000),
            teamA: teamID === this.props.teamAID,
            displayNameOn: playerOn.displayName,
            displayNameOff: playerOff.displayName
        }
        this.props.playerChosen(data)
    }

    /**
     * Holding the player going off, if already selected call the addSub method
     * 
     * @param player JSON Player
     * @param teamID string The team ID for the event
     */
    addPlayer = (player, teamID) => {
        if (this.props.teamAMembers.find(member => member.uid === player.uid) && this.props.teamAMembers.filter(member => !member.redCard).length <= 5 && this.props.teamAMembers.filter(member => !member.active).length <= 0) {
            console.log("Not enough members!")
        } else if (this.props.teamBMembers.find(member => member.uid === player.uid) && this.props.teamBMembers.filter(member => !member.redCard).length <= 5 && this.props.teamBMembers.filter(member => !member.active).length <= 0) {
            console.log("Not enough members!")
        } else if (this.state.playerOff === null) {
            this.setState({ playerOff: player, teamID: teamID })
        } else { // player coming on
            this.addSub(this.state.playerOff, player, teamID )
        }
    }

    /**
     * Show all players that are on the pitch, once selecting that,
     * players that aren't on can then be selected
     */
    render() {
        let teamAPlayers = (this.state.playerOff === null)
            ? this.props.teamAMembers.filter(member => member.active && !member.redCard)
            : this.props.teamAMembers.filter(member => !member.active && !member.redCard)
        let teamBPlayers = (this.state.playerOff === null)
            ? this.props.teamBMembers.filter(member => member.active && !member.redCard)
            : this.props.teamBMembers.filter(member => !member.active && !member.redCard)

        return (
            <View style={{ flexDirection: "row" }}>
                <View style={{ width: "50%" }}>
                    {
                        (this.props.teamAMembers !== null && (this.state.teamID === this.props.teamAID || this.state.teamID === null))
                            ?
                                teamAPlayers.map((player, index) => { // for every team B player, get card status and show user kit with name
                                    if (this.state.playerOff === null || player.uid !== this.state.playerOff.uid) {
                                        return (
                                            <TouchableOpacity onPress={() => this.addPlayer(player, this.props.teamAID)} activeOpacity={1} key={index} style={styles.kitContainer}>
                                                <Kit
                                                    kitLeftLeft={KIT_STYLE[this.props.teamAKit].kitLeftLeft}
                                                    kitLeft={KIT_STYLE[this.props.teamAKit].kitLeft}
                                                    kitMiddle={KIT_STYLE[this.props.teamAKit].kitMiddle}
                                                    kitRight={KIT_STYLE[this.props.teamAKit].kitRight}
                                                    kitRightRight={KIT_STYLE[this.props.teamAKit].kitRightRight}
                                                    numberColor={KIT_STYLE[this.props.teamAKit].numberColor}
                                                    kitNumber={player.number}
                                                />
                                                <Text style={{ color: "white", textAlign: "center", fontSize: 14 }}>{player.displayName}</Text>
                                                <View style={{ backgroundColor: "white", width: "100%", marginLeft: "auto", marginRight: "auto", height: 1, borderRadius: 100 }}></View>
                                            </TouchableOpacity>
                                        )
                                    } else {
                                        return (null)
                                    }
                                })
                            : null
                    }
                </View>

                <View style={{ width: "50%"}}>
                    {
                        (this.props.teamBMembers !== null && (this.state.teamID === this.props.teamBID || this.state.teamID === null))
                            ?
                                teamBPlayers.map((player, index) => { // for every team B player, get card status and show user kit with name
                                    if (this.state.playerOff === null || player.uid !== this.state.playerOff.uid) {
                                        return (
                                            <TouchableOpacity onPress={() => this.addPlayer(player, this.props.teamBID)} activeOpacity={1} key={index} style={styles.kitContainer}>
                                                <Kit
                                                    kitLeftLeft={KIT_STYLE[this.props.teamBKit].kitLeftLeft}
                                                    kitLeft={KIT_STYLE[this.props.teamBKit].kitLeft}
                                                    kitMiddle={KIT_STYLE[this.props.teamBKit].kitMiddle}
                                                    kitRight={KIT_STYLE[this.props.teamBKit].kitRight}
                                                    kitRightRight={KIT_STYLE[this.props.teamBKit].kitRightRight}
                                                    numberColor={KIT_STYLE[this.props.teamBKit].numberColor}
                                                    kitNumber={player.number}
                                                />
                                                <Text style={{ color: "white", textAlign: "center", fontSize: 14 }}>{player.displayName}</Text>
                                                <View style={{ backgroundColor: "white", width: "100%", marginLeft: "auto", marginRight: "auto", height: 1, borderRadius: 100 }}></View>
                                            </TouchableOpacity>
                                        )
                                    } else {
                                        return (null)
                                    }
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

export default GiveSub