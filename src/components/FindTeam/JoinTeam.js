import React, { Component } from "react"
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from "react-native"
import { Button } from "react-native-paper"

import Header from "../Utility/Header"
import { db, auth } from "../Auth/FirebaseInit"
import Kit from "../Utility/Kit"
import { KIT_STYLE } from "./KitData"

/**
 * Joining a team within a division, ability
 * to request to join, or join a team
 * 
 * @author Adam Lyon W19023403
 */
class JoinTeam extends Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedTeam: null,
            availableNumbers: []
        }
    }

    /**
     * Team selected, get the members that is 
     * in that team within the selected division
     * 
     * @param team JSON of selected team 
     */
    teamSelected = (team) => {
        db
        .collection("Leagues")
        .doc(this.props.leagueID)
        .collection("Divisions")
        .doc(this.props.division.toString())
        .collection("Teams")
        .doc(team.id)
        .collection("Members")
        .get()
        .then(snapshot => {
            // Get members kit numbers, to know what's available
            let inUse = []
            snapshot.docs.map(doc => {
				inUse.push(doc.data().number)
			})
            this.setState({ selectedTeam: team, availableNumbers: inUse })
        })
    }

    /**
     * If selected kit number is free, add the user as a member to the team
     * with required data for a member
     * 
     * @param number integer Check the selected kit number is not used by anyone else in the team
     */
    numberSelected = (number) => {
        if (!this.state.availableNumbers.find(k => k === number)) {
            db
            .collection("Leagues")
            .doc(this.props.leagueID)
            .collection("Divisions")
            .doc(this.props.division.toString())
            .collection("Teams")
            .doc(this.state.selectedTeam.id)
            .collection("Members")
            .doc(auth.currentUser.uid)
            .set({
                number: number,
                goalsScored: 0,
                matchesPlayed: 0,
                minutesPlayed: 0,
                displayName: auth.currentUser.displayName,
                created: new Date().getTime(),
                uid: auth.currentUser.uid
            })
            .then(() => {
                // Successfully added user, navigate to my teams
                this.props.goBack()
                this.props.navigation.navigate("My Teams")
            })
        }
    }

    render() {
        /**
         * Join a team selected and choose 
         * unique kit number thats available
         */
        return (
            <View style={{ height: 325 }}>
                <Header title={"JOIN TEAM"} color={"white"} marginTop={0} />
                {
                    (this.state.selectedTeam === null) // no team currently selected
                        ?
                            this.props.teams.map((team, index) => { // iterate through each team within division and output needed components
                                return (
                                    <View key={index} style={{ borderWidth: .75, margin: 5, flexDirection: "row", borderColor: "white", borderRadius: 15}}>
                                        <View style={styles.kitContainer}>
                                            <Kit
                                                kitLeftLeft={KIT_STYLE[team.kit].kitLeftLeft}
                                                kitLeft={KIT_STYLE[team.kit].kitLeft}
                                                kitMiddle={KIT_STYLE[team.kit].kitMiddle}
                                                kitRight={KIT_STYLE[team.kit].kitRight}
                                                kitRightRight={KIT_STYLE[team.kit].kitRightRight}
                                                numberColor={KIT_STYLE[team.kit].numberColor}
                                                kitNumber={Math.floor((Math.random() * 99) + 1)}
                                                width={12}
                                                height={65}
                                                fontSize={32}
                                            />
                                        </View>

                                        <View style={{ width: "70%", height: "100%", margin: 10 }}>
                                            <Text style={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: 18 }}>{team.name}</Text>
                                            <View style={{ backgroundColor: "white", width: "80%", marginLeft: "auto", marginRight: "auto", height: 1, borderRadius: 100 }}></View>
                                            <Text style={{ color: "white", textAlign: "center" }}>Members: {team.memberCount}/{team.maxMembers}</Text>
                                            {
                                                (true === true) // request to join team
                                                    ?   <Button
                                                            mode="contained"
                                                            style={{ height: 34, padding: 0, width: "90%", marginLeft: "5%" }}
                                                            onPress={() => this.teamSelected(team)}
                                                        >
                                                        JOIN
                                                        </Button>
                                                    :   <Button
                                                            mode="contained"
                                                            style={{ height: 34, padding: 0, width: "90%", marginLeft: "5%", backgroundColor: "#F29F22" }}
                                                        >
                                                        REQUEST TO JOIN
                                                        </Button>
                                            }
                                        </View>
                                    </View>
                                )
                            })
                        :  // Select a kit number, must be available within selected team
                            <ScrollView>
                                <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start"}}>
                                    { 
                                        [...Array(99)].map((e, i) =>
                                            <TouchableOpacity key={i} activeOpacity={1} onPress={() => this.numberSelected(i+1)}>
                                                <Text style={{ fontWeight: "bold", backgroundColor: (this.state.availableNumbers.find(k => k === i+1) ? "red" : "#19804c"), color: "white", margin: 5, height: 30, width: 30, textAlign: "center", borderRadius: 10, textAlignVertical: "center" }}>{i+1}</Text>
                                            </TouchableOpacity>
                                        ) 
                                    }
                                </View>
                            </ScrollView>
                        
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#21A361",
		flex: 1,
		flexWrap: "wrap",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-start",
		paddingBottom: 35
	},
	kitContainer: {
		width: 65,
        marginVertical: 15,
	}
})

export default JoinTeam