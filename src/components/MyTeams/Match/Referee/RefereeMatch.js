import React, { Component } from "react"
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image, ActivityIndicator } from "react-native"
import { Button } from "react-native-paper"
import { Audio } from "expo-av"

import { db } from "../../../Auth/FirebaseInit"
import AddEvent from "./AddEvent"
import ParticipatingPlayers from "./ParticipatingPlayers"

/**
 * Refree match screen get all match data, live 
 * updates on events and score and display the timer 
 * at top, with component for events below
 * 
 * @author Adam Lyon W19023403
 */
class RefereeMatch extends Component {
    constructor(props) {
        super(props)
        this.state = {
            matchID: null, // unique match id for current game
            leagueID: null, // unique league ID the team is in
            division: null,
            season: null,
            matchLength: 0, // how long the match is
            matchStart: null, // timestamp the match started
            currentTime: null, // holds current timer
            teamA: null,
            teamAMembers: [], 
            teamADetails: null,
            teamAScore: null,

            halfTimeStarted: null,
            halfTimeEnded: null,

            teamB: null,
            teamBMembers: [],
            teamBDetails: null,
            teamBScore: null,

            eventType: null, // card/sub/goal
            addingEvent: false,

            matchData: null,

            events: [],
            startingLeague: false,
            min: 0
        }
    }

    /** Unsubscrive to message listening on leaving screen */
    onFocusLost = () => {
        this.unsubscribe()
        this.unsubscribe2()
    }

    /**
     * On render of screen, subscrive to live updates of match data, to get scores 
     * and timing events when changed, and subscrive to changed for events being added
     */
    componentDidMount() {
        if (this.props.navigation !== undefined) {
			this.navigationSubscription = this.props.navigation.addListener("blur", this.onFocusLost);
		}

        this.setState({ matchID: this.props.route.params.matchID, leagueID: this.props.route.params.leagueID, division: this.props.route.params.division, season: this.props.route.params.season, matchLength: this.props.route.params.matchLength })
        
        this.unsubscribe = 
        db
        .collection("Leagues")
        .doc(this.props.route.params.leagueID)
        .collection("Divisions")
		.doc(this.props.route.params.division)
		.collection("Seasons")
		.doc(this.props.route.params.season)
		.collection("Matches")
        .doc(this.props.route.params.matchID)
        .onSnapshot((doc) => {
            this.setState({ matchStart: doc.data().start, teamA: doc.data().teamA, teamB: doc.data().teamB, matchData: doc.data(), teamAScore: doc.data().teamAScore, teamBScore: doc.data().teamBScore, halfTimeStarted: (doc.data().halfTimeStarted === undefined) ? null : doc.data().halfTimeStarted, halfTimeEnded: (doc.data().halfTimeEnded === undefined) ? null : doc.data().halfTimeEnded })
            if (this.state.currentTime === null) {
                this.timer = setInterval(this.calculateTime, 1000)
            }
        })

        this.unsubscribe2 = 
        db
        .collection("Leagues")
        .doc(this.props.route.params.leagueID)
        .collection("Divisions")
        .doc(this.props.route.params.division)
        .collection("Seasons")
        .doc(this.props.route.params.season)
        .collection("Matches")
        .doc(this.props.route.params.matchID)
        .collection("Events")
        .onSnapshot(snapshot => {
            let allEvents = []
            snapshot.forEach((doc) => { 
                const id = doc.id
                const data = doc.data()
                allEvents.push({ id, ...data })
            })
            this.setState({ events: allEvents })
        })
    }

    getMembers = () => {
        db
        .collection("Leagues")
        .doc(this.state.leagueID)
        .collection("Divisions")
        .doc(this.state.division)
        .collection("Seasons")
        .doc(this.state.season)
        .collection("Matches")
        .doc(this.state.matchID)
        .collection("Players")
        .get()
        .then(playerSnapshot => {
            let playerA = []
            let playerB = []
            playerSnapshot.docs.map(doc => {
                const data = doc.data()
                if (data.teamID === this.state.teamA) {
                    playerA.push({ ...data })
                } else { // team B
                    playerB.push({ ...data })
                }
            })
            this.setState({ teamAMembers: playerA, teamBMembers: playerB })
        })
    }

    /**
     * Get team data and members for both teams
     */
    componentDidUpdate(prevProps, prevState) {
        /** get teamA data */
        if (this.state.teamA !== prevState.teamA) {
            this.getMembers()

            db
            .collection("Leagues")
            .doc(this.props.route.params.leagueID)
            .collection("Divisions")
            .doc(this.props.route.params.division)
            .collection("Teams")
            .doc(this.state.teamA)
            .collection("Members")
            .get()
            .then((snapshot) => {
                let test = snapshot.docs.map(doc => {
                    const data = doc.data()
                    const id = doc.id

                    return {id, ... data}
                })
                //this.setState({ teamAMembers: test })
            })
            .catch((error) => {
                console.log(error)
            })

            db
            .collection("Leagues")
            .doc(this.props.route.params.leagueID)
            .collection("Divisions")
            .doc(this.props.route.params.division)
            .collection("Teams")
            .doc(this.state.teamA)
            .get()
            .then(snapshot => {
                this.setState({ teamADetails: snapshot.data() })
            })
        } 

        /** Get teamB data */
        if (this.state.teamB !== prevState.teamB) {
            db
            .collection("Leagues")
            .doc(this.props.route.params.leagueID)
            .collection("Divisions")
            .doc(this.props.route.params.division)
            .collection("Teams")
            .doc(this.state.teamB)
            .collection("Members")
            .get()
            .then((snapshot) => {
                let test = snapshot.docs.map(doc => {
                    const data = doc.data()
                    const id = doc.id

                    return {id, ... data}
                })
                //this.setState({ teamBMembers: test })
            })
            .catch((error) => {
                console.log(error)
            })

            db
            .collection("Leagues")
            .doc(this.props.route.params.leagueID)
            .collection("Divisions")
            .doc(this.props.route.params.division)
            .collection("Teams")
            .doc(this.state.teamB)
            .get()
            .then(snapshot => {
                this.setState({ teamBDetails: snapshot.data() })
            })
        }
    }

    goal = (event) => {
        if (event.teamA) {
            this.setState({ teamAScore: this.state.teamAScore + 1 })
        } else { // team B
            this.setState({ teamBScore: this.state.teamBScore + 1 })
        }
    }

    sub = (event) => {
        db
        .collection("Leagues")
        .doc(this.state.leagueID)
        .collection("Divisions")
        .doc(this.state.division)
        .collection("Seasons")
        .doc(this.state.season)
        .collection("Matches")
        .doc(this.state.matchID)
        .collection("Players")
        .doc(event.playerIDOff)
        .update({
            active: false
        })
        .then(() => {
            db
            .collection("Leagues")
            .doc(this.state.leagueID)
            .collection("Divisions")
            .doc(this.state.division)
            .collection("Seasons")
            .doc(this.state.season)
            .collection("Matches")
            .doc(this.state.matchID)
            .collection("Players")
            .doc(event.playerIDOn)
            .update({
                active: true
            })
            .then(() => {
                this.getMembers()
            })
        })
    }

    redCard = (event) => {
        db
        .collection("Leagues")
        .doc(this.state.leagueID)
        .collection("Divisions")
        .doc(this.state.division)
        .collection("Seasons")
        .doc(this.state.season)
        .collection("Matches")
        .doc(this.state.matchID)
        .collection("Players")
        .doc(event.playerID)
        .update({
            redCard: true
        })
        .then(() => {
            this.getMembers()
        })
    }

    /** 
     * Calculate time the match is in based off timestart, 
     * padd to always have two 0's for minutes and seconds
     */
    calculateTime = async () => {
        if (this.state.matchStart !== null) {
            let startingTimer = (this.state.halfTimeStarted === null) 
                ? this.state.matchStart
                : (this.state.halfTimeEnded === null)
                    ? Math.floor(Date.now()/1000) - ((this.state.matchLength/2)*60)
                    : this.state.halfTimeEnded - (this.state.matchLength*30)

            const timestamp = Math.floor(Date.now()/1000) - startingTimer // time diff
            const minutes = (Math.floor(timestamp / 60)).toString().padStart(2, "0") // add 0's if needed
            const seconds = (timestamp - (minutes*60)).toString().padStart(2, "0") // add 0's if needed
            this.setState({ currentTime: minutes + ":" + seconds, min: minutes })
        }
    }

    /**
     * Start match event, update to live to
     * allow everyone to see it's live on their
     * devices / allow events to be added
     */
    startMatch = () => {
        this.setState({ startingLeague: true })

        let teamA = this.state.teamAMembers
        teamA.map((team, index) => {
            delete team.created
            delete team.matchesPlayed
            delete team.minutesPlayed
            delete team.goalsScored
            delete team.id
            team.teamID = this.state.teamA
        })
        let teamB = this.state.teamBMembers
        teamB.map((team, index) => {
            delete team.created
            delete team.matchesPlayed
            delete team.minutesPlayed
            delete team.goalsScored
            delete team.id
            team.teamID = this.state.teamB
        })
        
        let allPlayers = [...teamA, ...teamB]
        allPlayers.map((player, index) => {
            db
            .collection("Leagues")
            .doc(this.state.leagueID)
            .collection("Divisions")
            .doc(this.state.division)
            .collection("Seasons")
            .doc(this.state.season)
            .collection("Matches")
            .doc(this.state.matchID)
            .collection("Players")
            .doc(player.uid)
            .set(player)
        })
        
        db
        .collection("Leagues")
        .doc(this.state.leagueID)
        .collection("Divisions")
		.doc(this.state.division)
		.collection("Seasons")
		.doc(this.state.season)
		.collection("Matches")
        .doc(this.state.matchID)
        .update({
            live: true,
            start: Math.floor(Date.now()/1000)
        })
        this.timer = setInterval(this.calculateTime, 1000) // set timer
    }

    /** Clear timer and unsubscribe to live data */
    componentWillUnmount = () => {
        clearInterval(this.timer) // clear timer
        this.unsubscribe()
        this.unsubscribe2()
    }

    /** Currently adding an event status */
    eventAdded = () => {
        this.setState({ eventType: null, addingEvent: false })
    }
    
    /** Start half time, start second half, and call full time button pressed */
    matchHalfFullTime = () => {
        let params
        if (this.state.halfTimeStarted === null) { // half time started
            params = { halfTimeStarted: Math.floor(Date.now()/1000) }
        } else if (this.state.halfTimeEnded === null) { // starting second half
            params = { halfTimeEnded: Math.floor(Date.now()/1000) }
        } else if (this.state.halfTimeEnded !== null && Math.floor(Date.now()/1000) > this.state.halfTimeEnded + ((this.state.matchLength*30)*.95)) { // full time
            params = { live: false, finished: true } // full time
        }
        /**
         * If a selection abobe occurs, update the firestore database with the JSON set
         */
        if (params !== undefined) {
            db
            .collection("Leagues")
            .doc(this.props.route.params.leagueID)
            .collection("Divisions")
            .doc(this.props.route.params.division)
            .collection("Seasons")
            .doc(this.props.route.params.season)
            .collection("Matches")
            .doc(this.props.route.params.matchID)
            .set(params, { merge: true })
        }   
    }

    setParticipatingPlayers = (teamA, teamB) => {
        this.setState({ teamAMembers: teamA, teamBMembers: teamB })
    }
    
    /**
     * Render both team badges, match time progress, alongside
     * additional events to add to a match
     */
    render() {
        if (this.state.teamA !== null && this.state.teamB !== null) { // data has been loaded from firestore
            return (
                <>
                    <View style={styles.container}>
                        <View style={{ width: "90%", marginLeft: "5%", marginTop: StatusBar.currentHeight + 15 }}>
                            <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
                                <View style={{ width: 125, height: 100 }}>
                                    <Image
                                        source={require("../../../../assets/images/badge.png")}
                                        style={{ resizeMode: "stretch", width: 125, height: 100, position: "absolute", marginTop: 5 }}
                                    />
                                    <Text style={{ color: "white", textAlign: "center", fontSize: 24, marginTop: 30 }}>{(this.state.teamADetails !== null) ? this.state.teamADetails.abbreviation : null}</Text>
                                </View>

                                <View style={{ marginTop: 25 }}>
                                    { // show timer if match is active
                                        (this.state.matchData !== null && this.state.matchData.live) || (this.state.matchData !== null && this.state.matchData.finished) 
                                            ?   (this.state.teamAScore !== null && this.state.teamBScore !== null && this.state.currentTime !== null)
                                                    ?   <>
                                                            <Text style={{ color: "white", textAlign: "center", fontWeight: "bold", fontSize: 24 }}>{this.state.matchData.finished ? "" : this.state.currentTime}</Text>
                                                            <Text style={{ color: "white", textAlign: "center", fontWeight: "bold", fontSize: 24 }}>{this.state.teamAScore +  " - " + this.state.teamBScore}</Text>
                                                        </>
                                                    : <ActivityIndicator size={"large"} color={"white"} />    
                                            :   <>
                                                    <Text style={{ color: "white", textAlign: "center", fontWeight: "bold", fontSize: 24 }}>{this.state.matchLength}</Text>
                                                    <Text style={{ color: "white", textAlign: "center", opacity: .7 }}>MINUTE MATCH</Text>
                                                </>
                                    }
                                </View>

                                <View style={{ width: 125, height: 100 }}>
                                        <Image
                                            source={require("../../../../assets/images/badge.png")}
                                            style={{ resizeMode: "stretch", width: 125, height: 100, position: "absolute", marginTop: 5 }}
                                        />
                                        <Text style={{ color: "white", textAlign: "center", fontSize: 24, marginTop: 30 }}>{(this.state.teamBDetails !== null) ? this.state.teamBDetails.abbreviation : null}</Text>
                                </View>

                            </View>
                            { // add event buttons, render component selected
                                this.state.teamA !== null && this.state.teamB !== null && this.state.matchData !== null && this.state.matchData.live
                                ?   <>
                                        <TouchableOpacity
                                            style={{ backgroundColor: "green", height: "25%", width: "90%", marginLeft: "5%", borderRadius: 20, margin: 10 }}
                                            activeOpacity={1}
                                            disabled={this.state.halfTimeStarted && !this.state.halfTimeEnded}
                                            onPress={() => this.setState({ eventType: "Goal", addingEvent: true })}
                                        >
                                            <Text style={{ textAlign: "center", textAlignVertical: "center", color: "white", height: "100%", fontWeight: "bold", fontSize: 20 }}>GOAL</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={{ backgroundColor: "green", height: "25%", margin: 10, width: "90%", marginLeft: "5%", borderRadius: 20 }}
                                            activeOpacity={1}
                                            disabled={this.state.halfTimeStarted && !this.state.halfTimeEnded}
                                            onPress={() => this.setState({ eventType: "Card", addingEvent: true })}
                                        >
                                            <Text style={{ textAlign: "center", textAlignVertical: "center", color: "white", height: "100%", fontWeight: "bold", fontSize: 20 }}>CARD</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={{ backgroundColor: "green", height: "25%", margin: 10, width: "90%", marginLeft: "5%", borderRadius: 20 }}
                                            activeOpacity={1}
                                            disabled={this.state.halfTimeStarted && !this.state.halfTimeEnded}
                                            onPress={() => this.setState({ eventType: "Sub", addingEvent: true })}
                                        >
                                            <Text style={{ textAlign: "center", textAlignVertical: "center", color: "white", height: "100%", fontWeight: "bold", fontSize: 20 }}>SUBSTITUTION</Text>
                                        </TouchableOpacity>

                                        <Button
                                            mode="contained"
                                            disabled={ // disable half time / full time button if it's not within the timeframe of .95 time required
                                                (this.state.halfTimeStarted === null)
                                                ? (this.state.matchStart !== null && Math.floor(Date.now()/1000)) > this.state.matchStart + ((this.state.matchLength*30)*.95) ? false : true
                                                : (this.state.halfTimeEnded === null)
                                                    ? false
                                                    : (this.state.halfTimeEnded !== null && Math.floor(Date.now()/1000)) > this.state.halfTimeEnded + ((this.state.matchLength*30)*.95) ? false : true
                                            }
                                            onPress={this.matchHalfFullTime}
                                        >
                                            {
                                                (this.state.halfTimeStarted === null) ? "HALF TIME" : (this.state.halfTimeEnded === null) ? "START SECOND HALF" : "FULL TIME"
                                            }
                                        </Button>
                                    </>
                                : (this.state.matchData.finished) // match has finished?
                                    ? <Text style={{ textAlign: "center", textAlignVertical: "center", flex: 1, color: "white", fontSize: 28, fontWeight: "bold" }}>MATCH HAS CONCLUDED</Text>
                                    : (this.state.teamAMembers !== null && this.state.teamBMembers !== null && !this.state.startingLeague)
                                        ?
                                            <View>
                                                <Button 
                                                    onPress={this.startMatch}
                                                    disabled={this.state.teamAMembers.filter(plr => plr.active).length < 5 || this.state.teamBMembers.filter(plr => plr.active).length < 5}
                                                >
                                                    START MATCH
                                                </Button>
                                                {
                                                    (this.state.teamAMembers.filter(plr => plr.active).length < 5 || this.state.teamBMembers.filter(plr => plr.active).length < 5)
                                                        ? <Text style={{ color: "red", textAlign: "center", fontSize: 16 }}>Each team needs 5 players selected!</Text>
                                                        : null
                                                }
                                                <ParticipatingPlayers setParticipatingPlayers={this.setParticipatingPlayers} teamADetails={this.state.teamADetails} teamBDetails={this.state.teamBDetails} league={this.state.leagueID} division={this.state.division} season={this.state.season} match={this.state.matchID} teamA={this.state.teamA} teamB={this.state.teamB} />
                                            </View>
                                        : null
                                        
                            }
                        </View>
                    </View>
                    { // curent event being added, let component render correct screen nested
                        (this.state.addingEvent)
                        ?   <AddEvent 
                                min={this.state.min}

                                event={this.state.eventType}
                                events={this.state.events} 

                                leagueID={this.props.route.params.leagueID}
                                division={this.props.route.params.division}
                                season={this.props.route.params.season}
                                matchID={this.props.route.params.matchID}

                                teamAID={this.state.teamA}
                                teamBID={this.state.teamB}

                                teamAMembers={this.state.teamAMembers} 
                                teamADetails={this.state.teamADetails}

                                teamBMembers={this.state.teamBMembers} 
                                teamBDetails={this.state.teamBDetails} 

                                eventAdded={this.eventAdded}
                                redCard={this.redCard}
                                sub={this.sub}
                                goal={this.goal}
                            />
                        :   null
                    }
                </>
            )
        } else {
            return ( // Still loading data
                <View style={styles.container}> 
                    
                </View>
            )
        }
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
		width: 110,
        marginLeft: "auto",
        marginRight: "auto",
        marginVertical: 5
	}
})

export default RefereeMatch