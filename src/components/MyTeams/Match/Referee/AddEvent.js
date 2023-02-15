import React, { Component } from "react"
import { ScrollView, View, StyleSheet, StatusBar } from "react-native"

import Header from "../../../Utility/Header"
import { db } from "../../../Auth/FirebaseInit"
/** Adding all the different events as a referee */
import GiveGoal from "./GiveGoal"
import GiveCard from "./GiveCard"
import GiveSub from "./GiveSub"

/**
 * Add events to a match that is currently being refereed
 * adds the ability to add a goal, card and sub players
 * 
 * @author Adam Lyon W19023403
 */
class AddEvent extends Component {
    constructor(props) {
        super(props)
        this.state = {
            teamA: null,
            teamB: null
        }
    }

    /**
     * Returns the JSON to be added to the firestore for events
     * @param data JSON event data
     */
    playerChosen = (data) => {
        db
        .collection("Leagues")
        .doc(this.props.leagueID)
        .collection("Divisions")
        .doc(this.props.division)
        .collection("Seasons")
        .doc(this.props.season)
        .collection("Matches")
        .doc(this.props.matchID)
        .collection("Events")
        .add({...data, min: this.props.min})
        
        if (data.event === "Red Card") {
            this.props.redCard(data)
        } else if (data.event === "Sub") {
            this.props.sub(data)
        } else if (data.event === "Goal") {
            this.props.goal(data)
        }

        this.props.eventAdded()
    }

    /**
     * Select button to add event
     */
    render() {
        /**
         * @var teamAKit integer Get kit index if data exists
         * @var teamBKit integer Get kit index if data exists
         */
        var teamAKit = (this.props.teamADetails !== null)
                     ? this.props.teamADetails.kit
                     : 1
        var teamBKit = (this.props.teamBDetails !== null)
                     ? this.props.teamBDetails.kit
                     : 1
        return (
            <View style={styles.container}>
                <Header title={this.props.event} color={"white"} marginTop={StatusBar.currentHeight+5} />
                <ScrollView style={{ width: "100%", marginTop: 10 }}>
                    {
                        (this.props.event === "Goal")
                        ? 
                            <GiveGoal 
                                teamAMembers={this.props.teamAMembers} 
                                teamAID={this.props.teamAID} 
                                teamAKit={teamAKit}
                                teamADetails={this.props.teamADetails}

                                teamBMembers={this.props.teamBMembers} 
                                teamBID={this.props.teamBID}
                                teamBKit={teamBKit}
                                teamBDetails={this.props.teamBDetails}

                                playerChosen={this.playerChosen}
                            />
                        : (this.props.event === "Card")
                        ? 
                            <GiveCard 
                                teamAMembers={this.props.teamAMembers} 
                                teamAID={this.props.teamAID} 
                                teamAKit={teamAKit}
                                events={this.props.events}

                                teamBMembers={this.props.teamBMembers} 
                                teamBID={this.props.teamBID}
                                teamBKit={teamBKit}

                                playerChosen={this.playerChosen}
                            />
                        : (this.props.event === "Sub")
                        ? 
                            <GiveSub
                                teamAMembers={this.props.teamAMembers} 
                                teamAID={this.props.teamAID} 
                                teamAKit={teamAKit}

                                teamBMembers={this.props.teamBMembers} 
                                teamBID={this.props.teamBID}
                                teamBKit={teamBKit}

                                playerChosen={this.playerChosen}
                            />
                        : null
                    }
                </ScrollView>
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

export default AddEvent