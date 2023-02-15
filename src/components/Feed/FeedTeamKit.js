import React, { Component } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';

import { db } from "../Auth/FirebaseInit"
import Kit from "../Utility/Kit"
import { KIT_STYLE } from "../FindTeam/KitData"

/**
 * Feed that require a team badge and their kit
 * to be displayed, events covered:
 * 
 * WinStreak
 * Winless Drought Ends
 * Match Winners
 * Milestone
 * Season Ended
 * New Team
 * 
 * @author Adam Lyon W19023403
 */
class FeedTeamKit extends Component {
    render() {
        /**
         * Display the team badge and relevent kit style,
         * including kit number if one is provided, then
         * render the required text depending on the event and
         * varying fields each event has
         */
        return (
            <View>
                <View style={styles.flexRow}>
                    <View style={styles.badgeContainer}>
                        <Image
                            style={styles.badge}
                            source={require("../../assets/images/badge.png")}
                        />
                        <Text style={styles.badgeAbbreviation}>{this.props.post.teamAbbreviation}</Text>
                    </View>

                    <View style={styles.kitContainer}>
                        <Kit
                            kitLeftLeft={KIT_STYLE[this.props.post.kitID].kitLeftLeft}
                            kitLeft={KIT_STYLE[this.props.post.kitID].kitLeft}
                            kitMiddle={KIT_STYLE[this.props.post.kitID].kitMiddle}
                            kitRight={KIT_STYLE[this.props.post.kitID].kitRight}
                            kitRightRight={KIT_STYLE[this.props.post.kitID].kitRightRight}
                            numberColor={KIT_STYLE[this.props.post.kitID].numberColor}
                            kitNumber={this.props.post.kitNumber}
                            width={12}
                            height={75}
                            fontSize={32}
                        />
                    </View>
                    
                </View>

                {
                      (this.props.post.event === "WinStreak")
                    ?   
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={() => {
                                this.props.navigation.navigate("My Teams", { 
                                    screen: "Match",
                                    params: {
                                        leagueID: this.props.post.leagueID,
                                        finished: true,
                                        live: false,
                                        matchID: this.props.post.match,
                                        season: this.props.post.season,
                                        division: this.props.post.division,
                                        matchTimestart: 0,
                                        teamA: this.props.teamA,
                                        teamB: this.props.teamB,
                                        team: this.props.team
                                    }
                                })
                            }}
                        >
                            <Text style={styles.textBlock}>
                                <Text style={styles.bold}>{this.props.post.teamName}</Text>
                                <Text> are now on a {this.props.post.count} winstreak, after beating {this.props.post.teamBeaten}!</Text>
                            </Text>
                        </TouchableOpacity>
                    : (this.props.post.event === "Winless Drought Ends")
                    ?   <Text style={styles.textBlock}>
                            <Text style={styles.bold}>{this.props.post.teamName}</Text>
                            <Text> end their {this.props.post.lossStreak} consecutive losing steak, with a win over </Text>
                            <Text style={styles.bold}>{this.props.post.teamBeaten}</Text>
                            <Text> with the final score being {this.props.post.teamAScore} - {this.props.post.teamBScore}</Text>
                        </Text>
                    : (this.props.post.event === "Match Winners")
                    ?   
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={() => {
                                db
                                .collection("Leagues")
                                .doc(this.props.post.leagueID)
                                .collection("Divisions")
                                .doc(this.props.post.division)
                                .collection("Seasons")
                                .doc(this.props.post.season)
                                .collection("Matches")
                                .doc(this.props.post.match)
                                .get()
                                .then(matchData => {
                                    this.props.navigation.navigate("My Teams", { 
                                        screen: "Match",
                                        params: {
                                            leagueID: this.props.post.leagueID,
                                            finished: true,
                                            live: false,
                                            matchID: this.props.post.match,
                                            season: this.props.post.season,
                                            division: this.props.post.division,
                                            matchTimestart: 0,
                                            teamA: {
                                                id: matchData.data().teamA,
                                                kit: this.props.post.teamAKit,
                                                name: this.props.post.teamName,
                                                abbreviation: this.props.post.teamAAbbreviation
                                            },
                                            teamB: {
                                                id: matchData.data().teamB,
                                                kit: this.props.post.teamBKit,
                                                name: this.props.post.teamB,
                                                abbreviation: this.props.post.teamBAbbreviation
                                            }
                                        }
                                    })
                                })
                            }}
                        >
                            <Text style={styles.textBlock}>
                                <Text style={styles.bold}>{this.props.post.teamName}</Text>
                                <Text> take a win over </Text>
                                <Text style={styles.bold}>{this.props.post.teamBeaten}</Text>
                                <Text> with the final score being {this.props.post.teamAScore} - {this.props.post.teamBScore}</Text>
                            </Text>
                        </TouchableOpacity>
                    
                    : (this.props.post.event === "Milestone")
                    ?   
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={() => {
                                db 
                                .collection("Leagues")
                                .doc(this.props.post.leagueID)
                                .get()
                                .then((leagueSnapshot) => {
                                    db
                                    .collection("Leagues")
                                    .doc(this.props.post.leagueID)
                                    .collection("Divisions")
                                    .doc(this.props.post.division)
                                    .collection("Teams")
                                    .doc(this.props.post.teamID)
                                    .get()
                                    .then(teamSnapshot => {
                                        this.props.navigation.navigate("My Teams", { 
                                            screen: "Team",
                                            params: {
                                                team: {
                                                    leagueID: this.props.post.leagueID,
                                                    division: this.props.post.division,
                                                    teamID: this.props.post.teamID,
                                                    season: leagueSnapshot.data().seasons,
                                                    tAbbreviation: this.props.post.teamAbbreviation,
                                                    tName: this.props.post.teamName,
                                                    kitStyle: teamSnapshot.data().kit
                                                }
                                            }
                                        })
                                    }) 
                                })
                                .catch((error) => {
                                    console.log(error)
                                })
                            }}
                        >
                            <Text style={styles.textBlock}>
                                <Text style={styles.bold}>{this.props.post.username} </Text>
                                <Text>has reached </Text>
                                <Text style={styles.bold}>{this.props.post.amount} </Text>
                                <Text>{this.props.post.achievement} for </Text>
                                <Text style={styles.bold}>{this.props.post.teamName}! </Text>
                            </Text>
                        </TouchableOpacity>
                        
                    : (this.props.post.event === "Season Ended")
                    ?   
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={() => {
                                this.props.navigation.navigate("My Teams", { 
                                    screen: "Team",
                                    params: {
                                        team: {
                                            leagueID: this.props.post.leagueID,
                                            division: this.props.post.division,
                                            teamID: this.props.post.teamID,
                                            season: this.props.post.season,
                                            tAbbreviation: this.props.post.teamAbbreviation,
                                            tName: this.props.post.teamName,
                                            kitStyle: this.props.post.kitID
                                        }
                                    }
                                })
                            }}
                        >
                            <Text style={styles.textBlock}>
                                <Text style={styles.bold}>Season {this.props.post.season} </Text>
                                <Text>has finished! After particpating in </Text>
                                <Text style={styles.bold}>{this.props.post.matches} matches </Text>
                                <Text>this season </Text>
                                <Text style={styles.bold}>{this.props.post.teamName} </Text>
                                <Text>have won the season taking </Text>
                                <Text style={styles.bold}>{this.props.post.wins} match </Text>
                                <Text>wins this season!</Text>
                            </Text>
                        </TouchableOpacity>
                    
                    : (this.props.post.event === "New Team")
                    ?
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => {

                            db 
                            .collection("Leagues")
                            .doc(this.props.post.leagueID)
                            .get()
                            .then((leagueSnapshot) => {

                                db
                                .collection("Leagues")
                                .doc(this.props.post.leagueID)
                                .collection("Divisions")
                                .doc(this.props.post.division)
                                .collection("Teams")
                                .doc(this.props.post.teamID)
                                .get()
                                .then(teamSnapshot => {
                                    this.props.navigation.navigate("My Teams", { 
                                        screen: "Team",
                                        params: {
                                            team: {
                                                leagueID: this.props.post.leagueID,
                                                division: this.props.post.division,
                                                teamID: this.props.post.teamID,
                                                season: leagueSnapshot.data().seasons,
                                                tAbbreviation: this.props.post.teamAbbreviation,
                                                tName: this.props.post.teamName,
                                                kitStyle: teamSnapshot.data().kit
                                            }
                                        }
                                    })
                                }) 
                            })
                            .catch((error) => {
                                console.log(error)
                            })
                        }}
                    >
                    <Text style={styles.textBlock}>
                        <Text>A new team has joined your division! Introducing </Text>
                        <Text style={styles.bold}>{this.props.post.teamName}! </Text>
                    </Text>
                </TouchableOpacity>
                    
                    
                    : null
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
	flexRow: {
		flexDirection: "row",
        justifyContent: "space-evenly"
	},
    badgeContainer: {
        width: 80, 
        height: 70,
        marginTop: "auto", 
        marginBottom: "auto",
        marginLeft: -20
    },
    badge: {
        resizeMode: "stretch", 
        width: 80,
        height: 70, 
        position: "absolute"
    },
    badgeAbbreviation: {
        color: "white", 
        textAlign: "center", 
        fontSize: 22, 
        marginTop: 8
    },
    textBlock: {
        flex: 1, 
        color: "white", 
        paddingVertical: 5
    },
    bold: {
        fontWeight: "bold"
    },
    kitContainer: {
		width: 48,
        paddingVertical: 5
	}
})

export default FeedTeamKit