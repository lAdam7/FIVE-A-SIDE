import React, { Component } from "react"
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image, ActivityIndicator, ScrollView } from "react-native"

import { db } from "../../../Auth/FirebaseInit"
import Kit from "../../../Utility/Kit"
import { KIT_STYLE } from "../../../FindTeam/KitData"

class ParticipatingPlayers extends Component {
    constructor(props) {
        super(props)
        this.state = {
            teamAMembers: [],
            teamBMembers: []
        }
    }

    componentDidMount() {
        db
        .collection("Leagues")
        .doc(this.props.league)
        .collection("Divisions")
        .doc(this.props.division)
        .collection("Teams")
        .doc(this.props.teamA)
        .collection("Members")
        .get()
        .then(teamAMemberSnapshot => {
            let teamAMembers = teamAMemberSnapshot.docs.map(doc => {
                const id = doc.id
                const data = doc.data()
                const active = false
                const redCard = false
                return { id, ...data, active, redCard }
            })
            this.setState({ teamAMembers: teamAMembers })
        })

        db
        .collection("Leagues")
        .doc(this.props.league)
        .collection("Divisions")
        .doc(this.props.division)
        .collection("Teams")
        .doc(this.props.teamB)
        .collection("Members")
        .get()
        .then(teamBMemberSnapshot => {
            let teamBMembers = teamBMemberSnapshot.docs.map(doc => {
                const id = doc.id
                const data = doc.data()
                const active = false
                const redCard = false
                return { id, ...data, active, redCard }
            })
            this.setState({ teamBMembers: teamBMembers })
        })

    }

    selectedPlayer = (teamA, index) => {
        ///console.log(player)
        if (teamA) {
            let teamAMembers = [...this.state.teamAMembers]
            teamAMembers[index].active = (teamAMembers.filter(member => member.active).length >= 5 && !teamAMembers[index].active) ? false : !teamAMembers[index].active
            this.props.setParticipatingPlayers(teamAMembers, this.state.teamBMembers)
            this.setState({ teamAMembers: teamAMembers })
        } else { // teamB
            let teamBMembers = [...this.state.teamBMembers]
            teamBMembers[index].active = (teamBMembers.filter(member => member.active).length >= 5 && !teamBMembers[index].active) ? false : !teamBMembers[index].active
            this.props.setParticipatingPlayers(this.state.teamAMembers, teamBMembers)
            this.setState({ teamBMembers: teamBMembers })
        }
    }

    render() {
        let teamAKit = (this.props.teamADetails === null) ? 0 : this.props.teamADetails.kit
        let teamBKit = (this.props.teamBDetails === null) ? 0 : this.props.teamBDetails.kit
        if (this.props.teamADetails !== null && this.props.teamBDetails !== null) {
            return (
                <View>
                    <Text style={styles.text}>Select 5 starting players for each team</Text>
                    <ScrollView style={{ marginTop: 10, height: "82%" }}>
                        <View style={{ flexDirection: "row" }}>
    
                            <View style={{ width: "50%" }}>
                                {
                                    this.state.teamAMembers.map((member, index) => {
                                        return (
                                            <TouchableOpacity 
                                                onPress={() => this.selectedPlayer(true, index)}
                                                activeOpacity={1} 
                                                key={index} 
                                                style={[styles.kitContainer, { backgroundColor: (member.active) ? "blue" : "transparent" , borderRadius: 12, padding: 10 }]}
                                            >
                                                <Kit
                                                    kitLeftLeft={KIT_STYLE[teamAKit].kitLeftLeft}
                                                    kitLeft={KIT_STYLE[teamAKit].kitLeft}
                                                    kitMiddle={KIT_STYLE[teamAKit].kitMiddle}
                                                    kitRight={KIT_STYLE[teamAKit].kitRight}
                                                    kitRightRight={KIT_STYLE[teamAKit].kitRightRight}
                                                    numberColor={KIT_STYLE[teamAKit].numberColor}
                                                    kitNumber={member.number}
                                                />
                                                <Text style={{ color: "white", textAlign: "center", fontSize: 14 }}>{member.displayName}</Text>
                                                <View style={{ backgroundColor: "white", width: "100%", marginLeft: "auto", marginRight: "auto", height: 1, borderRadius: 100 }}></View>
                                            </TouchableOpacity>
                                        )
                                    })
                                }
                            </View>

                            <View style={{ width: "50%" }}>
                                {
                                    this.state.teamBMembers.map((member, index) => {
                                        return (
                                            <TouchableOpacity 
                                                onPress={() => this.selectedPlayer(false, index)}
                                                activeOpacity={1} 
                                                key={index} 
                                                style={[styles.kitContainer, { backgroundColor: (member.active) ? "blue" : "transparent" , borderRadius: 12, padding: 10 }]}
                                            >
                                                <Kit
                                                    kitLeftLeft={KIT_STYLE[teamBKit].kitLeftLeft}
                                                    kitLeft={KIT_STYLE[teamBKit].kitLeft}
                                                    kitMiddle={KIT_STYLE[teamBKit].kitMiddle}
                                                    kitRight={KIT_STYLE[teamBKit].kitRight}
                                                    kitRightRight={KIT_STYLE[teamBKit].kitRightRight}
                                                    numberColor={KIT_STYLE[teamBKit].numberColor}
                                                    kitNumber={member.number}
                                                />
                                                <Text style={{ color: "white", textAlign: "center", fontSize: 14 }}>{member.displayName}</Text>
                                                <View style={{ backgroundColor: "white", width: "100%", marginLeft: "auto", marginRight: "auto", height: 1, borderRadius: 100 }}></View>
                                            </TouchableOpacity>
                                        )
                                    })
                                }
                            </View>
    
                        </View>
                    </ScrollView>
                </View>  
            )
        } else {
            return (
                <View>

                </View>
            )
        }
        
    }
}

const styles = StyleSheet.create({
	kitContainer: {
		width: 110,
        marginLeft: "auto",
        marginRight: "auto",
        marginVertical: 5
	},
	text: {
		textAlign: "center",
		color: "white",
		fontWeight: "bold",
		fontSize: 20
	}
})

export default ParticipatingPlayers