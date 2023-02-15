import React, { Component } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"

import Kit from "../../../Utility/Kit"
import { KIT_STYLE } from "../../../FindTeam/KitData"

/**
 * Add a goal event to a live match
 * 
 * @author Adam Lyon W19023403
 */
class GiveGoal extends Component {
    /**
     * Create the JSON required for a goal event, and
     * return to parent component to add to the firestore
     * database
     * 
     * @param player JSON of player
     * @param teamID string team ID event associated with
     */
    addGoal = (player, teamID) => {
        const data = {
            event: "Goal",
            teamID: teamID,
            playerID: player.uid,
            timestamp: Math.floor(Date.now()/1000),
            teamA: teamID === this.props.teamAID,
            teamAAbbreviation: this.props.teamADetails.abbreviation,
            teamBAbbreviation: this.props.teamBDetails.abbreviation,
            displayName: player.displayName
        }
        this.props.playerChosen(data)
    }

    render() {
        /**
         * Show all players that are playing, clicking them
         * adds the goal for the played pressed
         */
        return (
            <View style={{ flexDirection: "row" }}>
                <View style={{ width: "50%" }}>
                    { 
                        (this.props.teamAMembers !== null)
                            ?
                                this.props.teamAMembers.filter(member => member.active && !member.redCard).map((player, index) => { // for every team A player to add goal
                                    return (
                                        <TouchableOpacity onPress={() => this.addGoal(player, this.props.teamAID)} activeOpacity={1} key={index} style={styles.kitContainer}>
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
                                })
                            : null
                    }
                </View>

                <View style={{ width: "50%"}}>
                    { 
                        (this.props.teamBMembers !== null)
                            ?
                                this.props.teamBMembers.filter(member => member.active && !member.redCard).map((player, index) => { // for every team B player to add goal
                                    return (
                                        <TouchableOpacity onPress={() => this.addGoal(player, this.props.teamBID)} activeOpacity={1} key={index} style={styles.kitContainer}>
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

export default GiveGoal