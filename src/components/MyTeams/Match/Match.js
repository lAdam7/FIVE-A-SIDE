import React, { Component } from "react"
import { View, Text, StyleSheet, StatusBar, Image, BackHandler, ActivityIndicator } from "react-native"
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"

import Header from "../../Utility/Header"
import { auth, db } from "../../Auth/FirebaseInit"
/** Slider navigator components */
import Timeline from "./Timeline"
import Lineups from "./Lineups"
import Statistics from "./Statistics"

const TabTop = createMaterialTopTabNavigator();

/**
 * Base match component with slider navigation for 
 * the timeline, players and match statistics
 * 
 * @author Adam Lyon W19023403
 */
class Match extends Component {
    constructor(props) {
        super(props)
        this.state = {
            showTimeline: true,
            showLineups: false,
            showStatistics: false,

            teamADetails: null,
            teamAMembers: null, // remove soon

            teamBDetails: null,
            teamBMembers: null, // remove soon

            availablePlayers: null,

            season: null,
            division: null,
            matchTimestart: null,
            finished: false,
            leagueID: null,
            live: false,
            matchID: null,

            teamAGoals: null,
            teamBGoals: null,

            currentTime: null,

            events: [],

            players: [],
            userInOneOfTheTeams: false
        }
    }

    /**
     * Get all members for both teams in the match
     * 
     * @param leagueID string The league ID for the match
     * @param division string The division the match is in
     * @param season string current season
     * @param match string match ID
     * @param finished boolean has the match finished
     */
    getMembers = (leagueID, division, season, match, finished, live) => {
        if (!finished && !live) {
             db
            .collection("Leagues")
            .doc(leagueID)
            .collection("Divisions")
            .doc(division)
            .collection("Seasons")
            .doc(season)
            .collection("Matches")
            .doc(match)
            .collection("Available")
            .get()
            .then(availableSnapshot => {
                let available = availableSnapshot.docs.map(player => {
                    const id = player.id
                    const data = player.data()

                    return {id, ...data}
                })
                
                this.setState({ availablePlayers: available })
            })
        } else {
            db
            .collection("Leagues")
            .doc(leagueID)
            .collection("Divisions")
            .doc(division)
            .collection("Seasons")
            .doc(season)
            .collection("Matches")
            .doc(match)
            .collection("Players")
            .get()
            .then(playerSnapshot => {
                let players = playerSnapshot.docs.map(player => {
                    const id = player.id
                    const data = player.data()

                    return {id, ...data}
                })
                
                this.setState({ players: players })
            })
        }
    }

    /**
     * Calculate how many mins the match has started for
     */
    calculateTime = () => {
        const timestamp = Math.floor(Date.now()/1000) - this.state.matchTimestart
        const minutes = (Math.floor(timestamp / 60)).toString().padStart(2, "0")
        this.setState({ currentTime: minutes })
    }

    /**
     * Back button override press, return to required screen
     */
    handleBackPress = () => {
        if (this.props.route.params.fromFixtures || this.props.route.params.team === undefined) {
            this.props.navigation.navigate("HomeTeam")
        } else {
            this.props.navigation.navigate("Team", {
                team: this.props.route.params.team,
                userIn: true
            })
        }
        return true;
    }

    /**
     * On render, subscript to match data changes, 
     * and events being added, start timer
     */
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
        
        this.setState({ userInOneOfTheTeams: this.props.route.params.userIn, teamADetails: this.props.route.params.teamA, teamBDetails: this.props.route.params.teamB, season: this.props.route.params.team.season, matchTimestart: this.props.route.params.matchTimestart, finished: this.props.route.params.finished, leagueID: this.props.route.params.leagueID, division: this.props.route.params.division, live: this.props.route.params.live, matchID: this.props.route.params.matchID })
        this.getMembers(this.props.route.params.leagueID, this.props.route.params.division, this.props.route.params.team.season, this.props.route.params.matchID, this.props.route.params.finished, this.props.route.params.live)
        if (this.props.route.params.live) {
            this.timer = setInterval(this.calculateTime, 1000)
        }

        this.unsubscribeEvents = 
        db
        .collection("Leagues")
        .doc(this.props.route.params.leagueID)
        .collection("Divisions")
        .doc(this.props.route.params.division)
        .collection("Seasons")
        .doc(this.props.route.params.team.season)
        .collection("Matches")
        .doc(this.props.route.params.matchID)
        .collection("Events")
        .orderBy("timestamp", "desc")
        .onSnapshot((snapshot) => {
            let test = snapshot.docs.map(doc => {
                const data = doc.data()
                const id = doc.id
                return {id, ... data}
            })
                
            let teamAGoals = test.filter(event => event.event === "Goal" && event.teamID === this.props.route.params.teamA.id).length
            let teamBGoals = test.filter(event => event.event === "Goal" && event.teamID === this.props.route.params.teamB.id).length
            this.setState({ events: test, teamAGoals: teamAGoals, teamBGoals: teamBGoals })
        })
        
        this.unsubscribeMatch =
        db
        .collection("Leagues")
        .doc(this.props.route.params.leagueID)
        .collection("Divisions")
        .doc(this.props.route.params.division)
        .collection("Seasons")
        .doc(this.props.route.params.team.season)
        .collection("Matches")
        .doc(this.props.route.params.matchID)
        .onSnapshot(snapshot => {
            this.setState({ finished: snapshot.data().finished, live: snapshot.data().live })
        })
    }

    /**
     * On unmount clear timer and unsubscrive from
     * live events updating
     */
    componentWillUnmount() {
        if (this.props.route.params.live) {
            clearInterval(this.timer) 
        }
        this.unsubscribeEvents();
        this.unsubscribeMatch();
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }

    addParticipant = (teamID, number) => {
        let players = this.state.availablePlayers
        if (!this.state.availablePlayers.find(plr => plr.id === auth.currentUser.uid)) {
            players.push({ 
                team: teamID,
                displayName: auth.currentUser.displayName,
                number: number,
                id: auth.currentUser.uid
            })
            this.setState({ availablePlayers: players  })
        }
        
        db
        .collection("Leagues")
        .doc(this.props.route.params.leagueID)
        .collection("Divisions")
        .doc(this.props.route.params.division)
        .collection("Seasons")
        .doc(this.props.route.params.team.season)
        .collection("Matches")
        .doc(this.props.route.params.matchID)
        .collection("Available")
        .doc(auth.currentUser.uid)
        .set({
            team: teamID,
            displayName: auth.currentUser.displayName,
            number: number
        })
    }
    participateMatch = (bool) => {
        if (bool) { // can attend match
            db
            .collection("Leagues")
            .doc(this.props.route.params.leagueID)
            .collection("Divisions")
            .doc(this.props.route.params.division)
            .collection("Teams")
            .doc(this.props.route.params.teamA.id)
            .collection("Members")
            .doc(auth.currentUser.uid)
            .get()
            .then(teamA => {
                if (teamA.data() !== undefined) {
                    this.addParticipant(teamA.id, teamA.data().number)
                } else {
                    db
                    .collection("Leagues")
                    .doc(this.props.route.params.leagueID)
                    .collection("Divisions")
                    .doc(this.props.route.params.division)
                    .collection("Teams")
                    .doc(this.props.route.params.teamB.id)
                    .collection("Members")
                    .doc(auth.currentUser.uid)
                    .get()
                    .then(teamB => {
                        if (teamB.data() !== undefined) {
                            this.addParticipant(teamB.id, teamB.data().number)
                        }  
                    })
                }
            })
        } else { // can't attend match
            this.setState({ availablePlayers: this.state.availablePlayers.filter(player => player.id !== auth.currentUser.uid) })

            db
            .collection("Leagues")
            .doc(this.props.route.params.leagueID)
            .collection("Divisions")
            .doc(this.props.route.params.division)
            .collection("Seasons")
            .doc(this.props.route.params.team.season)
            .collection("Matches")
            .doc(this.props.route.params.matchID)
            .collection("Available")
            .doc(auth.currentUser.uid)
            .get()
            .then((result) => {
                result.ref.delete()
            })
        }
    }

    render() {
        const dateStart = (this.state.matchTimestart !== null) ? new Date(this.state.matchTimestart) : new Date()
        const weekday = ["Sunday", "Monday" ,"Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        const month = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        const ordinals = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"]

        /**
         * Render match screen with teams, score at the top,
         * then the slider navigation renders below with players
         * being the default screen
         */
        return(
            <>
                <View style={styles.container}>
                    <View style={{ width: "90%", marginLeft: "5%", marginBottom: 10 }}>
                        <Header title={"DIVISION " + this.props.route.params.division} color={"white"} marginTop={StatusBar.currentHeight} />
                        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
                            <View style={{ width: 125, height: 100 }}>
                                <Image
                                    source={require("../../../assets/images/badge.png")}
                                    style={{ resizeMode: "stretch", width: 125, height: 100, position: "absolute", marginTop: 5 }}
                                />
                                <Text style={{ color: "white", textAlign: "center", fontSize: 24, marginTop: 30 }}>{(this.state.teamADetails !== null) ? this.state.teamADetails.abbreviation : null}</Text>
                            </View>
                            <View style={{ marginTop: 15 }}>
                                <Text style={{ color: "white", textAlign: "center" }}>Season {(this.state.season !== null) ? this.state.season : null}</Text>
                                {
                                    (this.state.live)
                                    ? <>
                                        <Text style={{ color: "white", textAlign: "center", fontWeight: "bold", fontSize: 24 }}>{(this.state.teamAGoals !== null && this.state.teamBGoals !== null) ? (this.state.teamAGoals + " - " + this.state.teamBGoals) : <ActivityIndicator size="large" color="white" />}</Text>
                                        <Text style={{ color: "red", textAlign: "center", fontWeight: "bold" }}>LIVE {this.state.currentTime}'</Text>
                                    </>
                                    : (this.state.finished)
                                    ? <>
                                        <Text style={{ color: "white", textAlign: "center", fontWeight: "bold", fontSize: 24 }}>{this.state.teamAGoals} - {this.state.teamBGoals}</Text>
                                        <Text style={{ color: "white", textAlign: "center", opacity: .7 }}>MATCH OVER</Text>
                                    </>
                                    :   <>  
                                            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                                                <Text style={{ color: "white", textAlign: "center", fontWeight: "bold", marginTop: 5 }}>{weekday[dateStart.getDay()]} {dateStart.getDate()}</Text>
                                                <Text style={{ color: "white", textAlign: "center", fontWeight: "bold", marginTop: 5, fontSize: 10 }}>{ordinals[Number(String(dateStart.getDate()).slice(-1))]}</Text>
                                            </View>
                                            <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>{month[dateStart.getMonth()]}</Text>
                                            <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>{dateStart.getHours()}:{dateStart.getMinutes()}</Text>
                                        </>
                                }
                                
                            </View>
                            <View style={{ width: 125, height: 100 }}>
                                <Image
                                source={require("../../../assets/images/badge.png")}
                                style={{ resizeMode: "stretch", width: 125, height: 100, position: "absolute", marginTop: 5 }}
                                />
                                <Text style={{ color: "white", textAlign: "center", fontSize: 24, marginTop: 30 }}>{(this.state.teamBDetails !== null) ? this.state.teamBDetails.abbreviation : null}</Text>
                            </View>
                        </View>
                    
                    </View>
              
                </View>
                {
                    (this.state.availablePlayers !== null)
                        ? 
                            <View style={{ backgroundColor: "#21A361", flexDirection: "row" }}>
                                <Text style={{ color: "white", textAlign: "center", fontSize: 16, width: "50%" }}>Lights</Text>
                                <Text style={{ color: "white", textAlign: "center", fontSize: 16, width: "50%" }}>Darks</Text>
                            </View>
                        : null
                }
                <TabTop.Navigator initialRouteName={(!this.state.live) ? "Lineups" : "Timeline"} screenOptions={{ tabBarInactiveTintColor: "white", tabBarActiveTintColor: "white", tabBarStyle: { backgroundColor: "#21A361", height: 45 }, tabBarIndicatorStyle: { backgroundColor: "white" }}} sceneContainerStyle={{ backgroundColor: "#21A361" }} >
                    <TabTop.Screen
                        name="Timeline" 
                        children={() => <Timeline participateMatch={this.participateMatch} availablePlayers={this.state.availablePlayers} userIn={this.state.userInOneOfTheTeams} started={!this.state.live && !this.state.finished} matchTimestart={this.state.matchTimestart} teamADetails={this.state.teamADetails} players={this.state.players} teamBDetails={this.state.teamBDetails} events={this.state.events} />}
                    />
                    <TabTop.Screen 
                        name="Lineups" 
                        children={() => <Lineups players={this.state.players} started={!this.state.live && !this.state.finished} availablePlayers={this.state.availablePlayers} events={this.state.events} teamADetails={this.state.teamADetails} teamBDetails={this.state.teamBDetails} />}
                    />
                    <TabTop.Screen 
                        name="Statistics"
                        children={() => <Statistics teamADetails={this.state.teamADetails} teamBDetails={this.state.teamBDetails} events={this.state.events} />}
                    />
                </TabTop.Navigator> 
            </>
        )
    }
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#21A361"
	}
})

export default Match