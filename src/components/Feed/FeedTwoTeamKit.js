import React, { Component } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';

import { db } from "../Auth/FirebaseInit"
import Kit from "../Utility/Kit"
import { KIT_STYLE } from "../FindTeam/KitData"

/**
 * Feed that requires two teams to be displayed,
 * showing both there badges and team kits, with 
 * kit number if provided: events covered:
 * 
 * Points Shared
 * 
 * @author Adam Lyon W19023403
 */
class FeedTwoTeamKit extends Component {
    render() {
        /**
         * Display both team badges, alongside there kits, then
         * render the required text depeneding on the event and
         * varying text fields each event can have
         */
        return (
            <View>
                <View style={styles.flexRow}>
                    <View style={styles.badgeContainer}>
                        <Image
                            style={styles.badge}
                            source={require("../../assets/images/badge.png")}
                        />
                        <Text style={styles.badgeAbbreviation}>{this.props.post.teamAAbbreviation}</Text>
                    </View>

                    <View style={styles.kitContainer}>
                        <Kit
                            kitLeftLeft={KIT_STYLE[this.props.post.teamAKit].kitLeftLeft}
                            kitLeft={KIT_STYLE[this.props.post.teamAKit].kitLeft}
                            kitMiddle={KIT_STYLE[this.props.post.teamAKit].kitMiddle}
                            kitRight={KIT_STYLE[this.props.post.teamAKit].kitRight}
                            kitRightRight={KIT_STYLE[this.props.post.teamAKit].kitRightRight}
                            numberColor={KIT_STYLE[this.props.post.teamAKit].numberColor}
                            width={12}
                            height={75}
                            fontSize={32}
                        />
                    </View>
                    <View style={styles.kitContainer}>
                        <Kit
                            kitLeftLeft={KIT_STYLE[this.props.post.teamBKit].kitLeftLeft}
                            kitLeft={KIT_STYLE[this.props.post.teamBKit].kitLeft}
                            kitMiddle={KIT_STYLE[this.props.post.teamBKit].kitMiddle}
                            kitRight={KIT_STYLE[this.props.post.teamBKit].kitRight}
                            kitRightRight={KIT_STYLE[this.props.post.teamBKit].kitRightRight}
                            numberColor={KIT_STYLE[this.props.post.teamBKit].numberColor}
                            width={12}
                            height={75}
                            fontSize={32}
                        />
                    </View>

                    <View style={styles.badgeContainer}>
                        <Image
                            style={styles.badge}
                            source={require("../../assets/images/badge.png")}
                        />
                        <Text style={styles.badgeAbbreviation}>{this.props.post.teamBAbbreviation}</Text>
                    </View>
                    
                </View>
                {
                      (this.props.post.event === "Points Shared")
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
                                    console.log(matchData.data())
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
                                <Text>The points are shared between</Text>
                                <Text style={styles.bold}> {this.props.post.teamName}</Text>
                                <Text> and </Text>
                                <Text style={styles.bold}>{this.props.post.teamB}</Text>
                                <Text> with the final score being {this.props.post.score} - {this.props.post.score}</Text>
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
        width: 50, 
        height: 44,
        marginTop: "auto", 
        marginBottom: "auto"
    },
    badge: {
        resizeMode: "stretch", 
        width: 50,
        height: 44, 
        position: "absolute"
    },
    badgeAbbreviation: {
        color: "white", 
        textAlign: "center", 
        fontSize: 13, 
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
        paddingVertical: 5,
        marginHorizontal: 10
	}
})

export default FeedTwoTeamKit