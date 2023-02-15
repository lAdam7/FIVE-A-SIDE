import React, { Component } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { db } from "../Auth/FirebaseInit"

/**
 * Feed that requires just text to be outputted
 * as the event. Events covered:
 * 
 * New Referee
 * Season Started
 * Promotion & Relegation
 * 
 * @author Adam Lyon W19023403
 */
class FeedText extends Component {
    render() {
        const month = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        const ordinals = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"]
        let dateEvent = (this.props.post.seasonStart !== undefined) ? new Date(this.props.post.seasonStart) : new Date()
        /**
         * Display just text content, thenrender the required 
         * text depending on the event and varying fields each event has
         */
        return (
           <View>
                {
                      (this.props.post.event === "New Referee")
                    ?   
                        <TouchableOpacity 
                            activeOpacity={1}
                            onPress={() => {
                                db
                                .collection("Leagues")
                                .doc(this.props.post.leagueID)
                                .get()
                                .then(leagueSnapshot => {
                                    this.props.navigation.navigate("My Teams", { 
                                        screen: "View Divisions",
                                        params: {
                                            league: {
                                                id: this.props.post.leagueID,
                                                divisions: leagueSnapshot.data().divisions,
                                                seasons: leagueSnapshot.data().seasons
                                            }
                                        }
                                    })
                                })   
                            }}
                        >
                            <Text style={styles.textBlock}>
                                <Text style={styles.bold}>{this.props.post.username} </Text>
                                <Text> has joined the league as a referee!</Text>
                            </Text>
                        </TouchableOpacity>
                    : (this.props.post.event === "Season Started")
                    ? (this.props.post.divisions > 1)
                    ?   
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={() => {
                                db
                                .collection("Leagues")
                                .doc(this.props.post.leagueID)
                                .get()
                                .then(leagueSnapshot => {
                                    this.props.navigation.navigate("My Teams", { 
                                        screen: "View Divisions",
                                        params: {
                                            league: {
                                                id: this.props.post.leagueID,
                                                divisions: leagueSnapshot.data().divisions,
                                                seasons: leagueSnapshot.data().seasons
                                            }
                                        }
                                    })
                                })   
                            }}
                        >
                            <Text style={styles.textBlock}>
                                <Text>A new season will be starting on the </Text>
                                <Text style={styles.bold}>{dateEvent.getDate()}</Text>
                                <Text style={{ fontWeight: "bold", fontSize: 10 }}>{ordinals[Number(String(dateEvent.getDate()).slice(-1))]} </Text>
                                <Text style={styles.bold}>{month[dateEvent.getMonth()]}. Featuring </Text>
                                <Text style={styles.bold}>{this.props.post.divisions} divisions! </Text>
                                <Text>Matches this season will be </Text>
                                <Text style={styles.bold}>{this.props.post.matchLength} minutes </Text>
                                <Text>long with the top and bottom {this.props.post.promotionRelegation} placed teams at the end of the season facing promotion and relegation. </Text>
                                <Text>You're in </Text>
                                <Text style={styles.bold}>division {this.props.post.divisionIn} </Text>
                                <Text>and will play </Text>
                                <Text style={styles.bold}>{this.props.post.matches} matches </Text>
                                <Text>this season!</Text>
                            </Text>
                        </TouchableOpacity>
                    :   
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={() => {
                                db
                                .collection("Leagues")
                                .doc(this.props.post.leagueID)
                                .get()
                                .then(leagueSnapshot => {
                                    this.props.navigation.navigate("My Teams", { 
                                        screen: "View Divisions",
                                        params: {
                                            league: {
                                                id: this.props.post.leagueID,
                                                divisions: leagueSnapshot.data().divisions,
                                                seasons: leagueSnapshot.data().seasons
                                            }
                                        }
                                    })
                                })   
                            }}
                        >
                            <Text style={styles.textBlock}>
                                <Text>A new season will be starting on the </Text>
                                <Text style={styles.bold}>{dateEvent.getDate()}</Text>
                                <Text style={{ fontWeight: "bold", fontSize: 10 }}>{ordinals[Number(String(dateEvent.getDate()).slice(-1))]} </Text>
                                <Text style={styles.bold}>{month[dateEvent.getMonth()]} </Text>
                                <Text>Matches this season will be </Text>
                                <Text style={styles.bold}>{this.props.post.matchLength} minutes </Text>
                                <Text>long. You will play </Text>
                                <Text style={styles.bold}>{this.props.post.matches} matches </Text>
                                <Text>this season!</Text>
                            </Text>
                        </TouchableOpacity>
                    : (this.props.post.event === "Promotion & Relegation")
                    ?   
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={() => {
                                db
                                .collection("Leagues")
                                .doc(this.props.post.leagueID)
                                .get()
                                .then(leagueSnapshot => {
                                    this.props.navigation.navigate("My Teams", { 
                                        screen: "View Divisions",
                                        params: {
                                            league: {
                                                id: this.props.post.leagueID,
                                                divisions: leagueSnapshot.data().divisions,
                                                seasons: leagueSnapshot.data().seasons
                                            }
                                        }
                                    })
                                }) 
                            }}
                        >
                            {
                                (this.props.post.teamsUp.length === 0) 
                                ? 
                                    <Text style={styles.textBlock}>
                                        <Text>Relegation time now </Text>
                                        <Text style={styles.bold}>season {this.props.post.season} </Text>
                                        <Text>has concluded! We see </Text>
                                        <Text style={styles.bold}>
                                            {
                                                this.props.post.teamsDown.map(value => {
                                                    return value.teamName
                                                }).join(" and ")
                                            }
                                        </Text>
                                        <Text> unfortunately finishing at the bottom of the table and moving down a division.</Text>
                                    </Text>
                                : (this.props.post.teamsDown.length === 0)
                                    ?
                                        <Text style={styles.textBlock}>
                                            <Text>Promotion time now </Text>
                                            <Text style={styles.bold}>season {this.props.post.season} </Text>
                                            <Text>has concluded! We see </Text>
                                            <Text style={styles.bold}>
                                                {
                                                    this.props.post.teamsUp.map(value => {
                                                        return value.teamName
                                                    }).join(" and ")
                                                } 
                                            </Text>
                                            <Text> topping the table this season and moving up a division.</Text>
                                        </Text>
                                    :
                                        <Text style={styles.textBlock}>
                                            <Text>Promotion and Relegation time now </Text>
                                            <Text style={styles.bold}>season {this.props.post.season} </Text>
                                            <Text>has concluded! We see </Text>
                                            <Text style={styles.bold}>
                                                {
                                                    this.props.post.teamsUp.map(value => {
                                                        return value.teamName
                                                    }).join(" and ")
                                                } 
                                            </Text>
                                            <Text> topping the table this season and moving up a division with </Text>
                                            <Text style={styles.bold}>
                                                {
                                                    this.props.post.teamsDown.map(value => {
                                                        return value.teamName
                                                    }).join(" and ")
                                                }
                                            </Text>
                                            <Text> unfortunately finishing at the bottom of the table and moving down a division.</Text>
                                        </Text>
                            }
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
        paddingVertical: 5,
        lineHeight: 18
    },
    bold: {
        fontWeight: "bold"
    },
    kitContainer: {
		width: 48,
        paddingVertical: 5
	}
})

export default FeedText