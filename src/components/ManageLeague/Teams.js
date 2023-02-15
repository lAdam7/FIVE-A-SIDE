import React, { Component } from "react"
import { ScrollView, View, Text, StyleSheet } from "react-native"
import { Button } from "react-native-paper"

import DropDown from "../Utility/DropDown"
import Kit from "../Utility/Kit"
import { KIT_STYLE } from "../FindTeam/KitData"
import { auth, db } from "../Auth/FirebaseInit"

/**
 * View all teams within league, with option
 * to switch between divisions to find all teams
 * Accept/reject team applications to join a 
 * division
 * 
 * @author Adam Lyon W19023403
 */
class Teams extends Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedDivison: "1",
            showTeamApplications: false
        }
    }

    /** @param value string The selected division in the drop-down */
    setSelectedDivision = (value) => {
        this.setState({ selectedDivison: value })
    }

    /**
     * Update application peneding if it's being accepted or rejected
     * 
     * @param team JSON data of team application of team
     * @param accepted boolean Application being accepted or rejected
     */
    applicationUpdate = (team, accepted) => {
        this.props.removeTeamApplication(team.id) // remove from application array
        
        if (accepted) {
            this.props.addTeam(team) // add to array
            db
            .collection("Leagues")
            .doc(auth.currentUser.uid)
            .collection("Divisions")
            .doc(team.division.toString())
            .collection("Teams")
            .doc(team.id)
            .set(team)
        }

        db
        .collection("Leagues")
        .doc(auth.currentUser.uid)
        .collection("Divisions")
        .doc(team.division.toString())
        .collection("PendingTeams")
        .doc(team.id)
        .get()
        .then(snapshot => {
            snapshot.ref.delete()
        })
    }

    /**
     * Active team being remove from a division
     * @param teamID string team unique ID
     */
    removeTeam = (teamID) => {
        db
        .collection("Leagues")
        .doc(auth.currentUser.uid)
        .collection("Divisions")
        .doc(this.state.selectedDivison)
        .collection("Teams")
        .doc(teamID)
        .get()
        .then((result) => {
            result.ref.delete()
            this.props.removeTeam(teamID, this.state.selectedDivison) // remove from array
        })
        .catch((error) => {
            console.log(error)
        })
    }

    render() {
        const month = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        const ordinals = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"]

        let options = []
        for (var i = 0; i < this.props.teams.length; i++) {
            options.push(i+1)
        }
        /**
         * Show all team applications at all times, with accept and reject
         * options, and all the teams that are in the seleced division with
         * option to remove
         */
        return (
            <ScrollView>
                { // Only show team applications, if league requires request to join
                    this.props.leagueDetails !== null && this.props.leagueDetails.requestToCreateTeam 
                        ?   
                            <Button mode="contained" color="#086134" style={{ marginVertical: 10, borderRadius: 0 }} onPress={() => this.setState({ showTeamApplications: !this.state.showTeamApplications })}>
                                TEAM APPLICATIONS ({this.props.teamApplications.length})
                            </Button>
                        :   null
                }
                { // Iterate through all team applications
                    this.state.showTeamApplications
                    ?
                        this.props.teamApplications !== null && this.props.teamApplications.length > 0
                            ? 
                                this.props.teamApplications.map((team, index) => {
                                    const dateAccepted = new Date(team.created);

                                    return (
                                        <View key={index}>
                                            <View style={{ width: "80%", marginLeft: "10%", flexDirection: "row", justifyContent: "center", backgroundColor: "#086134", borderTopRightRadius: 15, borderTopLeftRadius: 15}}>
                                                <View style={styles.kitContainer}>
                                                    <Kit
                                                        kitLeftLeft={KIT_STYLE[team.kit].kitLeftLeft}
                                                        kitLeft={KIT_STYLE[team.kit].kitLeft}
                                                        kitMiddle={KIT_STYLE[team.kit].kitMiddle}
                                                        kitRight={KIT_STYLE[team.kit].kitRight}
                                                        kitRightRight={KIT_STYLE[team.kit].kitRightRight}
                                                        numberColor={KIT_STYLE[team.kit].numberColor}
                                                        kitNumber={99}
                                                        width={12}
                                                        height={65}
                                                        fontSize={32}
                                                    />
                                                </View>
                                                <View style={{ width: "70%", height: "100%" }}>
                                                    <Text style={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: 18 }}>{team.abbreviation} - {team.name}</Text>
                                                    <View style={{ backgroundColor: "white", width: "80%", marginLeft: "auto", marginRight: "auto", height: 1, borderRadius: 100 }}></View>
                                                    <Text style={{ color: "white", fontSize: 14, marginLeft: 30 }}>Division #{index+1}</Text>
                                                    <Text style={{ color: "white", fontSize: 14, marginLeft: 30 }}>Request to Join: {team.requestToJoin ? "Yes" : "No"}</Text>
                                                    <View style={{ flexDirection: "row", marginLeft: 30}}>
                                                        <Text style={{ color: "white" }}>Created: {dateAccepted.getDate()}</Text>
                                                        <Text style={{ color: "white", fontSize: 10 }}>{ordinals[Number(String(dateAccepted.getDate()).slice(-1))]} </Text>
                                                        <Text style={{ color: "white" }}>{month[dateAccepted.getMonth()]} {dateAccepted.getFullYear()}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <Button mode="contained" style={{ width: "80%", marginLeft: "10%", borderRadius: 0 }} onPress={() => this.applicationUpdate(team, true)}>
                                                ACCEPT
                                            </Button>
                                            <Button mode="contained" color="red" onPress={() => this.applicationUpdate(team, false)} style={{ width: "80%", marginLeft: "10%", borderRadius: 0, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, marginBottom: 15 }}>
                                                REJECT
                                            </Button>
                                        </View>
                                    )
                                
                               
                                })
                            :  // no pending applications
                                <>
                                    <Text style={{ color: "white", textAlign: "center", fontWeight: "bold", fontSize: 20, marginTop: 20 }}>No team applications</Text>
                                    <View style={[styles.line, { backgroundColor: "white", marginTop: 10 }]}></View>
                                </>
                    : null
                }
                <DropDown title={"Division"} options={options} default={"1"} setDropdownValue={this.setSelectedDivision} />
                { // How many teams are in selected division from drop-down
                    this.props.leagueDetails !== null && this.props.teams.length > 0
                        ? <Text style={{ color: "white", textAlign: "center", fontWeight: "bold", fontSize: 18 }}>Teams: {this.props.teams[parseInt(this.state.selectedDivison)-1].length}/{this.props.leagueDetails.maxTeams}</Text>
                        : null
                }
                { // Output message can't remove teams if the season is in progress
                    this.props.leagueDetails !== null && this.props.leagueDetails.seasonInProgress
                        ? <Text style={{ color: "red", textAlign: "center", fontWeight: "bold", fontSize: 14 }}>CAN'T REMOVE TEAMS DURING SEASON*</Text>
                        : null
                }
                <ScrollView style={{ height: "75%" }}>
                    { // All active teams for selected division
                        this.props.teams.length > 0
                        ?
                            this.props.teams[parseInt(this.state.selectedDivison)-1].map((team, index) => {
                                const dateAccepted = new Date(team.created)

                                return (
                                    <View key={index}>
                                        <View style={{ width: "80%", marginLeft: "10%", flexDirection: "row", justifyContent: "center", backgroundColor: "#086134", borderTopRightRadius: 15, borderTopLeftRadius: 15}}>
                                            <View style={styles.kitContainer}>
                                                <Kit
                                                    kitLeftLeft={KIT_STYLE[team.kit].kitLeftLeft}
                                                    kitLeft={KIT_STYLE[team.kit].kitLeft}
                                                    kitMiddle={KIT_STYLE[team.kit].kitMiddle}
                                                    kitRight={KIT_STYLE[team.kit].kitRight}
                                                    kitRightRight={KIT_STYLE[team.kit].kitRightRight}
                                                    numberColor={KIT_STYLE[team.kit].numberColor}
                                                    kitNumber={99}
                                                    width={12}
                                                    height={65}
                                                    fontSize={32}
                                                />
                                            </View>
                                            <View style={{ width: "70%", height: "100%", paddingBottom: 10 }}>
                                                <Text style={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: 18 }}>{team.abbreviation} - {team.name}</Text>
                                                <View style={{ backgroundColor: "white", width: "80%", marginLeft: "auto", marginRight: "auto", height: 1, borderRadius: 100 }}></View>
                                                <Text style={{ color: "white", fontSize: 14, marginLeft: 30 }}>Members: {team.memberCount}/{team.maxMembers}</Text>
                                                <Text style={{ color: "white", fontSize: 14, marginLeft: 30 }}>Request to Join: {team.requestToJoin ? "Yes" : "No"}</Text>
                                                <View style={{ flexDirection: "row", marginLeft: 30}}>
                                                    <Text style={{ color: "white" }}>Created: {dateAccepted.getDate()}</Text>
                                                    <Text style={{ color: "white", fontSize: 10 }}>{ordinals[Number(String(dateAccepted.getDate()).slice(-1))]} </Text>
                                                    <Text style={{ color: "white" }}>{month[dateAccepted.getMonth()]} {dateAccepted.getFullYear()}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <Button mode="contained" onPress={() => { this.removeTeam(team.id) }} disabled={this.props.leagueDetails.seasonInProgress} color="red" style={{ width: "80%", marginLeft: "10%", borderRadius: 0, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, marginBottom: 15 }}>
                                            REMOVE TEAM
                                        </Button>
                                    </View>
                                )
                            })
                        : null
                    }
                </ScrollView>
                
            </ScrollView>
        )
    }
}
/*
<Button mode="contained" style={{ borderRadius: 0 }}>
                    View Division
                </Button>
                */

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
		width: 48,
        paddingVertical: 5
	}
})

export default Teams