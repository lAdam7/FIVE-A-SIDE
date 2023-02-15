import React, { Component } from "react"
import { ScrollView, View, Text, StyleSheet } from "react-native"
import { Button } from "react-native-paper"

import Kit from "../../Utility/Kit"
import { KIT_STYLE } from "../../FindTeam/KitData"
import { auth, db } from "../../Auth/FirebaseInit"

/**
 * All players that are in the team
 * being viewed
 * 
 * @author Adam Lyon W19023403
 */
class Players extends Component {

    /** Logged-in member leaving team remove from members collection within the team */
    leaveTeam = () => {
        db
        .collection("Leagues")
        .doc(this.props.leagueID)
        .collection("Divisions")
        .doc(this.props.division.toString())
        .collection("Teams")
        .doc(this.props.teamID)
        .collection("Members")
        .doc(auth.currentUser.uid)
        .get()
        .then(snapshot => {
            snapshot.ref.delete()
        })
    }

    render() {
        const month = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        const ordinals = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"]

        /**
         * Display all players and their stats
         * for just the team
         */
        return (
            <View>
                {
                    (auth.currentUser !== null && this.props.teamID === auth.currentUser.uid)
                        ?
                            <Button
                                mode="contained"
                                style={{ marginTop: 5 }}
                                onPress={() => {
                                    this.props.navigation.navigate("My Teams", { 
                                        screen: "Training",
                                        params: {
                                            league: this.props.leagueID,
                                            division: this.props.division.toString()
                                        }
                                    })
                                }}
                            >
                                Organize Training
                            </Button>
                        : null
                }
                <ScrollView style={{ width: "80%", marginLeft: "10%" }}>
                    {
                        this.props.kitStyle !== undefined
                            ?
                                this.props.players.map((player, index) => ( // For every player in the team
                                    <View key={index} style={{ backgroundColor: "#086134", marginTop: 10, borderRadius: 12, paddingHorizontal: 10 }}>
                                        <View  style={{ flexDirection: "row" }}>

                                            <View style={styles.kitContainer}>
                                                <Kit
                                                    kitLeftLeft={KIT_STYLE[this.props.kitStyle].kitLeftLeft}
                                                    kitLeft={KIT_STYLE[this.props.kitStyle].kitLeft}
                                                    kitMiddle={KIT_STYLE[this.props.kitStyle].kitMiddle}
                                                    kitRight={KIT_STYLE[this.props.kitStyle].kitRight}
                                                    kitRightRight={KIT_STYLE[this.props.kitStyle].kitRightRight}
                                                    numberColor={KIT_STYLE[this.props.kitStyle].numberColor}
                                                    kitNumber={player.number}
                                                    width={16}
                                                    height={85}
                                                    fontSize={40}
                                                />
                                            </View>

                                            <View style={{ flex: 1 }}>
                                                <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "bold", color: "white" }}>{player.displayName}</Text>
                                                <View style={{ backgroundColor: "white", width: "70%", marginLeft: "15%", height: 1, borderRadius: 100 }}></View>
                                                <Text style={{ marginLeft: 40, marginTop: 5, color: "white" }}>Matches Played: {player.matchesPlayed}</Text>
                                                <Text style={{ marginLeft: 40, marginTop: 5, color: "white" }}>Goals Scored: {player.goalsScored}</Text>
                                                <Text style={{ marginLeft: 40, marginTop: 5, color: "white" }}>Minutes Played: {player.minutesPlayed}</Text>
                                            </View>
                                            
                                        </View>

                                        <View style={{ flexDirection: "row", marginLeft: "auto", marginRight: "auto", paddingVertical: 8 }}>
                                            <Text style={{ color: "orange", fontWeight: "bold" }}>Member Since: {new Date(player.created).getDate()}</Text>
                                            <Text style={{ color: "orange", fontWeight: "bold", fontSize: 10 }}>{ordinals[Number(String(new Date(player.created).getDate()).slice(-1))]} </Text>
                                            <Text style={{ color: "orange", fontWeight: "bold" }}>{month[new Date(player.created).getMonth()]} {new Date(player.created).getFullYear()}</Text>
                                        </View>
                                        
                                    </View>
                                ))
                            : null
                    }
                    {
                        (this.props.logged && auth.currentUser.uid !== this.props.leagueID)
                        ? // Can leave team, if user is a member of it
                            <Button mode="contained" onPress={this.leaveTeam} style={{ backgroundColor: "red", marginTop: 10 }}>
                                LEAVE TEAM
                            </Button>
                        : null
                    }
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
	kitContainer: {
		width: 65,
        marginVertical: 5
	}
})

export default Players