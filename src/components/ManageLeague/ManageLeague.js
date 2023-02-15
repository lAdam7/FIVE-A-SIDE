import React, { Component } from "react"
import { View, StyleSheet, StatusBar, BackHandler } from "react-native"
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"

import Header from "../Utility/Header"
import { auth, db } from "../Auth/FirebaseInit"
/** Screens that are rendered for the slider navigation */
import League from "./League"
import Referees from "./Referees"
import Teams from "./Teams"

const TabTop = createMaterialTopTabNavigator() // Slider navigator for managing league

/**
 * Get all the data needed for all screens for managing
 * a league includding season status, editing league details,
 * referee details and team details
 * 
 * @author Adam Lyon W19023403
 */
class ManageLeague extends Component {
    constructor(props) {
        super(props)
        this.state = {
            leagueDetails: null,

            referees: [],
            refereeApplications: [],

            teams: [],
            teamApplications: []
        }
    }

    /** Override back button press, force render of profile screen */
    handleBackPress = () => {
		this.props.navigation.navigate("Profile", {
            screen: "Home"
        })
		return true
	}

    /** 
     * On screeen render add back event listener to call method,
     * get referees in league, divisions/teams and any pending teams
     */
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress) // override back pressed

        /** Get all referees that are in the league, seperating the pending applications and active refs */
        db
        .collection("Leagues")
        .doc(auth.currentUser.uid)
        .collection("Referees")
        .get()
        .then((snapshot) => {
            snapshot.docs.map(doc => {
                const data = doc.data()
                const id = doc.id
                if (doc.data().accepted) {
                    this.setState({ referees: [...this.state.referees, {id, ...data}] })
                } else {
                    this.setState({ refereeApplications: [...this.state.referees, {id, ...data}] })
                }
            })
        })
        .catch((error) => {
            console.log(error)
        })

        /** Detect live updates on league details, to monitor a season starting / ending */
        this.unsubscribe = db
        .collection("Leagues")
        .doc(auth.currentUser.uid)
        .onSnapshot(snapshot => {
            const data = snapshot.data()
            const id = snapshot.id
            this.setState({ leagueDetails: { ...data, id } })
            
            for(var i = 0; i < snapshot.data().divisions; i++) { // Get every division and associated team
                var getTeams = []
                // Get team for division index
                db
                .collection("Leagues")
                .doc(auth.currentUser.uid)
                .collection("Divisions")
                .doc((i+1).toString())
                .collection("Teams")
                .get()
                .then(snapshotTeams => {
                    snapshotTeams.docs.map(doc => {
                        const data = doc.data()
                        const id = doc.id
                        getTeams.push({ id, ...data})
                    })
                    
                    this.setState({ teams: [...this.state.teams, (getTeams.length === 0) ? [] : getTeams ] })
                })

                // Get all pending teams for each division
                db
                .collection("Leagues")
                .doc(auth.currentUser.uid)
                .collection("Divisions")
                .doc((i+1).toString())
                .collection("PendingTeams")
                .get()
                .then(snapshotTeams => {
                    snapshotTeams.docs.map(doc => {
                        const data = doc.data()
                        const id = doc.id
                        const division = i
                        this.setState({ teamApplications: [...this.state.teamApplications, { id, division, ...data }] })
                    })
                })
            }
        })
    }

    componentWillUnmount() { // stop live update on screen not viewing
		this.unsubscribe()
	}

    /**
     * Remove from referee applications array that's being removed, to show to user it's happened
     * @param uid string Referee selected to remove
     */
    removeItem = (uid) => {
        this.setState({refereeApplications: this.state.refereeApplications.filter(function(application) { 
            return application.id !== uid
        })})
    }
    /**
     * Remove from active array that's being removed, to show to user it's happened
     * @param uid string Referee to remove
     */
    removeItemReferee = (uid) => {
        this.setState({referees: this.state.referees.filter(function(application) { 
            return application.id !== uid
        })})
    }
    /**
     * Remove the team application from array, to show to user
     * @param uid string Team ID application to reject
     */
    removeTeamApplication = (uid) => {
        this.setState({teamApplications: this.state.teamApplications.filter(function(application) { 
            return application.id !== uid
        })})
    }
    /**
     * Remove an active team from the array, to show user it's been removed
     * @param teamID string Team ID to remove from division
     * @param division string Divsion the team is in
     */
    removeTeam = (teamID, division) => {
        let teams = this.state.teams
        teams[parseInt(division)-1] = teams[parseInt(division)-1].filter(function(team) {
            return team.id !== teamID
        })
        this.setState({ teams: teams })
    }
    /**
     * Team application been accepted, add to the main team array to show to user
     * @param team JSON team data
     */
    addTeam = (team) => {
        let teams = this.state.teams
        teams[team.division-1].push(team)
        this.setState({ teams: teams  })
    }
    /**
     * Referee application been accepted, add to the main referee array to show user
     * @param uid string Referee to be added
     * @param username string Referees username
     */
    addReferee = (uid, username) => {
        this.setState({ referees: [...this.state.referees, {  
                accepted: true,
                dateAccepted: new Date().getTime(),
                id: uid,
                uid: uid,
                notes: null,
                name: username
            }] 
        })
    }

    /**
     * @param bool boolean The season state to show either end or start season 
     */
    changeSeasonState = (bool) => {
        const currentDetails = this.state.leagueDetails
        currentDetails.seasonInProgress = bool
        this.setState({ leagueDetails: currentDetails })
    }

    /**
     * Render main mange league screen, with the sliding navigator
     * default being set to the "League" screen
     */
    render() {
        return (
            <>
                <View style={styles.container}>
                    <Header title={"MANAGE LEAGUE"} color={"white"} marginTop={StatusBar.currentHeight + 5} />
                </View>
                <TabTop.Navigator screenOptions={{ tabBarInactiveTintColor: "white", tabBarActiveTintColor: "white", tabBarStyle: { backgroundColor: "#21A361", height: 45 }, tabBarIndicatorStyle: { backgroundColor: "white" }}} sceneContainerStyle={{ backgroundColor: "#21A361" }} >
                    <TabTop.Screen 
                        name="League" 
                        children={() => <League leagueDetails={this.state.leagueDetails} teams={this.state.teams} changeSeasonState={this.changeSeasonState} navigation={this.props.navigation} />}
                    />
                    <TabTop.Screen 
                        name="Referees" 
                        children={() => <Referees  refereeApplications={this.state.refereeApplications} referees={this.state.referees} removeItem={this.removeItem} addReferee={this.addReferee} removeItemReferee={this.removeItemReferee} />}
                    />
                    <TabTop.Screen  
                        name="Teams"
                        children={() => <Teams leagueDetails={this.state.leagueDetails} teams={this.state.teams} removeTeamApplication={this.removeTeamApplication} addTeam={this.addTeam} teamApplications={this.state.teamApplications} removeTeam={this.removeTeam} />}
                    />
                </TabTop.Navigator> 
            </> 
        )
    }
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#21A361",		
		paddingBottom: 35
	}
})

export default ManageLeague