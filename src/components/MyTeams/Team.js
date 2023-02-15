import React, { Component } from "react"
import { StyleSheet, StatusBar, BackHandler } from "react-native"
import { connect } from "react-redux"
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"

import Header from "../Utility/Header"
import { auth, db } from "../Auth/FirebaseInit"
/** Every slide navigator component */
import Overview from "./Team/Overview"
import PointsTable from "./Team/PointsTable"
import Players from "./Team/Players"
import Chats from "./Team/Chats"

const TabTop = createMaterialTopTabNavigator();

/**
 * For Team view get all data required for the
 * slider navigator componenets for match overview,
 * points table, players and chats
 * 
 * @author Adam Lyon W19023403
 */
class Team extends Component {
	constructor(props) {
		super(props)
		this.state = {
			teams: [],
			messages: [],
			table: [],
			players: [],
			winRate: null,

			kitStyle: 0,
			kitNumber: 0,

			userIn: false
		}
	}

	/**
	 * If logged in subscrive to messages for auto updating,
	 * Get table data for the current season,
	 * Get all members info and check if user is in the team,
	 */
	getTeamInfo = () => {
		this.setState({ kitStyle: this.props.route.params.team.kitStyle, kitNumber: this.props.route.params.team.number })
		if (this.props.authentication) { // subscribe to new messages
			this.unsubscribe = 
			db
			.collection("Leagues")
			.doc(this.props.route.params.team.leagueID)
			.collection("Divisions")
			.doc(this.props.route.params.team.division)
			.collection("Teams")
			.doc(this.props.route.params.team.teamID)
			.collection("Messages")
			.orderBy("timestamp")
			.onSnapshot((snapshot) => {
				let test = snapshot.docs.map(doc => {
					const data = doc.data()
					const id = doc.id

					return {id, ... data}
				})
				this.setState({ messages: test })
			})
		}
		
		/** 
		 * Get all table data for current / most recent season and calculate points
		 * based on wins and losses, and calculate the season win rate from the stats
		 */
		db
		.collection("Leagues")
		.doc(this.props.route.params.team.leagueID)
		.collection("Divisions")
		.doc(this.props.route.params.team.division)
		.collection("Seasons")
		.doc(this.props.route.params.team.season.toString())
		.collection("Table")
		.get()
		.then(snapshot => {
			let winRate = null
			
			let table = snapshot.docs.map(doc => {
				const data = doc.data()
				const id = doc.id
				const pts = (data.wins * 3) + data.draws
				const played = data.wins + data.draws + data.losses
				const gd = Math.floor(Math.random() * 8) + 1

				if (data.teamName === this.props.route.params.team.tName) {
					if (played === 0) {
						winRate = 100
					} else {
						winRate = Math.round(((2 * data.wins + data.draws) / (2 * played)) * 100)
					}
					
				}
				return {id, pts: pts, played: played, gd, ... data}
			})
			this.setState({ table: table, winRate: winRate })
		})

		/** Get all members in the team */
		let foundMember = false
		db
		.collection("Leagues")
		.doc(this.props.route.params.team.leagueID)
		.collection("Divisions")
		.doc(this.props.route.params.team.division)
		.collection("Teams")
		.doc(this.props.route.params.team.teamID)
		.collection("Members")
		.get()
		.then(snapshot => {
			let members = snapshot.docs.map(doc => {
				const id = doc.id
				const data = doc.data()
				if (this.props.authentication && id === auth.currentUser.uid) { foundMember = true }
				return {id, ...data}
			})
			this.setState({ players: members, userIn: foundMember })
		})
	}

	/** Override back press, go to view all teams on back */
	handleBackPress = () => {
		if (this.props.authentication) {
			this.props.navigation.navigate("HomeTeam")    
        	return true;
		} else {
			return false
		}  
    }

	/** Unsubscribe to message listening on leaving screen */
	onFocusLost = () => {
		if (this.props.authentication) {
			this.unsubscribe()
		}
	}

	/** 
	 * On render, detect on back press and add listeners for 
	 * viewing and unviewing this screen
	 */
	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
		if (this.props.navigation !== undefined) {
			this.navigationSubscription = this.props.navigation.addListener("focus", this.getTeamInfo);
			this.navigationSubscription = this.props.navigation.addListener("blur", this.onFocusLost);
		}
	}

	/** Different team being shown, reload get matches */
	componentDidUpdate(prevProps) {
		if (this.props.route.params.team.teamID !== prevProps.route.params.team.teamID) {
			this.getTeamInfo()
			this.props.navigation.navigate("Matches")
		}
	}

	render() {
		/**
		 * Team main component, link to the
		 * slide navigator with matches/overview
		 * being the default component to render
		 */
		return (
			<>
				<Header title={this.props.route.params.team.tName} color={"white"} marginTop={StatusBar.currentHeight} />
				<TabTop.Navigator screenOptions={{ tabBarInactiveTintColor: "white", tabBarActiveTintColor: "white", tabBarStyle: { backgroundColor: "#21A361", height: 45 }, tabBarIndicatorStyle: { backgroundColor: "white" }}} sceneContainerStyle={{ backgroundColor: "#21A361" }} >
                    <TabTop.Screen name="Matches" children={() => <Overview userIn={this.state.userIn} team={this.props.route.params.team} navigation={this.props.navigation} winRate={this.state.winRate} />} />
                    <TabTop.Screen name="Table" children={() => <PointsTable table={this.state.table} leagueID={this.props.route.params.team.leagueID} division={this.props.route.params.team.division} season={this.props.route.params.team.season} navigation={this.props.navigation} />} />
                    <TabTop.Screen name="Players" children={() => <Players players={this.state.players} leagueID={this.props.route.params.team.leagueID} division={this.props.route.params.team.division} logged={this.props.authentication} teamID={this.props.route.params.team.teamID} navigation={this.props.navigation} kitStyle={this.state.kitStyle} />} />	
					{
						this.state.userIn
						&&
						<TabTop.Screen name="Chat" children={() => <Chats messages={this.state.messages} kitStyle={this.state.kitStyle} kitNumber={this.state.kitNumber} leagueID={this.props.route.params.team.leagueID} teamID={this.props.route.params.team.teamID} division={this.props.route.params.team.division} />} />
					}
                </TabTop.Navigator> 
			</>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#21A361",
		flex: 1,
		flexWrap: "wrap",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "flex-start",
		paddingBottom: 35
	},
	kitContainer: {
		width: 110
	}
})
/** Get authentication state from redux store */
const mapStateToProps = (state) => {
	return {
		authentication: state.authenticateReducer.logged
	}
}

export default connect(mapStateToProps) (Team)