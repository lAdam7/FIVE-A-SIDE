import React, { Component } from "react"
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from "react-native"

/**
 * Show brief of upcoming match utilized
 * for fixtures screen, team overview and
 * referee games
 * 
 * @author Adam Lyon W19023403
 */
class MatchBrief extends Component {
    constructor(props) {
        super(props)
    }

    /** Match brief selected */
    matchClicked = () => {
        /** Referee mode, send them to the referee screen for the match */
        if (this.props.referee) {
            this.props.navigation.navigate("Referee Match", { 
                matchID: this.props.matchID,
                leagueID: this.props.leagueID,
                season: this.props.season,
                division: this.props.division,
                matchLength: this.props.matchLength
            })
        } else {
            /** Normal mode, send to match brief (no ref features) */
            this.props.navigation.navigate("My Teams", { 
                screen: "Match",
                params: {
                    leagueID: this.props.leagueID,
                    finished: this.props.finished,
                    live: this.props.live,
                    matchID: this.props.matchID,
                    season: this.props.season,
                    division: this.props.division,
                    matchTimestart: this.props.matchTimestamp,
                    teamA: this.props.teamA,
                    teamB: this.props.teamB,
                    fromFixtures: this.props.fromFixtures,
                    team: this.props.team,
                    userIn: this.props.userIn
                }
            })
        }
    }
    
    render() {
        const dateStart = (this.props.start !== null) ? new Date(this.props.start) : new Date()
        const weekday = ["Sunday", "Monday" ,"Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        const month = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        const ordinals = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"]
        return(
            <TouchableOpacity onPress={this.matchClicked} activeOpacity={1} style={{ paddingVertical: 5, height: 120 }}>

                <View style={{ flexDirection: "row" }}>
                    <Text style={{ color: "white", height: 20 }}>Season {this.props.season} - Match {this.props.matchIndex}</Text>
                    {
                        (this.props.live) // Match is live add text to standout
                            ? 
                                <>
                                    <Text style={{ color: "red", height: 20, fontWeight: "bold", paddingLeft: 25 }}>LIVE</Text>
                                    <ActivityIndicator style={{ paddingBottom: -5, paddingLeft: 10 }} size={18} color={"red"} />
                                </>
                            : null
                    }
                </View>
                
                <View style={{ flexDirection: "row", width: "100%" }}>
                    <View style={{ height: 45 }}>
                        <View style={{ width: 45, height: 35 }}>
                            <Image
                                source={require("../../assets/images/badge.png")}
                                style={{ resizeMode: "stretch", width: 45, height: 35, position: "absolute", marginTop: 5 }}
                            />
                            <Text style={{ color: "white", textAlign: "center", fontSize: 11, marginTop: 10 }}>{this.props.teamA.abbreviation}</Text>
                        </View>
                    
                    </View>
                    <Text style={{ textAlignVertical: "center", width: "70%", paddingLeft: 25, color: "white", fontWeight: "bold", fontSize: 15 }}>{this.props.teamA.name}</Text>
                    { // Show current score if the match has finished or is live for teamA
                        (this.props.finished || this.props.live)
                            ? <Text style={{ textAlignVertical: "center", textAlign: "center", color: "white", fontWeight: "bold", fontSize: 24 }}>{this.props.teamA.score}</Text>
                            : null
                    }
                </View>
                
                { // Match upcoming display the date / time the match will start
                    (this.props.finished || this.props.live)
                    ? null
                    : 
                        <View style={{ position: "absolute", right: 0, top: 5, bottom: 5, justifyContent: "center" }}>
                            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                                <Text style={{ color: "white", textAlign: "center", marginTop: 5 }}>{weekday[dateStart.getDay()]} {dateStart.getDate()}</Text>
                                <Text style={{ color: "white", textAlign: "center", marginTop: 5, fontSize: 10 }}>{ordinals[Number(String(dateStart.getDate()).slice(-1))]}</Text>
                            </View>
        
                            <Text style={{ color: "white", textAlign: "center" }}>{month[dateStart.getMonth()]} </Text>
                            <Text style={{ color: "white", textAlign: "center" }}>{dateStart.getHours()}:{dateStart.getMinutes()}</Text>
                            <Text style={{ color: "white", textAlign: "center" }}>{dateStart.getFullYear()}</Text>
                        </View>
                }

                <View style={{ flexDirection: "row", width: "100%" }}>
                    <View style={{ height: 45 }}>
                        <View style={{ width: 45, height: 35 }}>
                            <Image
                                source={require("../../assets/images/badge.png")}
                                style={{ resizeMode: "stretch", width: 45, height: 35, position: "absolute", marginTop: 5 }}
                            />
                            <Text style={{ color: "white", textAlign: "center", fontSize: 11, marginTop: 10 }}>{this.props.teamB.abbreviation}</Text>
                        </View>
                    
                    </View>
                    <Text style={{ textAlignVertical: "center", width: "70%", paddingLeft: 25, color: "white", fontWeight: "bold", fontSize: 15 }}>{this.props.teamB.name}</Text>
                    { // Show current score if the match has finished or is live for teamB
                        (this.props.finished || this.props.live)
                        ? <Text style={{ textAlignVertical: "center", textAlign: "center", color: "white", fontWeight: "bold", fontSize: 24 }}>{this.props.teamB.score}</Text>
                        : null
                    }
                </View>

                <View style={{ backgroundColor: "white", width: "100%", height: 1, borderRadius: 100 }}></View>
            </TouchableOpacity>
        )
    }
}

export default MatchBrief