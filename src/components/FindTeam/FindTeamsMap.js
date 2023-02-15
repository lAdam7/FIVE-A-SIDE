import React, { Component } from "react"
import { View, StyleSheet, StatusBar, Text, Pressable, Alert } from "react-native"
import { connect } from "react-redux"
import MapView, { PROVIDER_GOOGLE } from "react-native-maps"
import { Button, TextInput } from "react-native-paper"

import Header from "../Utility/Header"
import { db, auth } from "../Auth/FirebaseInit"
import Map from "../Map/Map"
import Login from "../Auth/Login"
import CreateTeam from "./CreateTeam"
import JoinTeamDivision from "./JoinTeamDivision"

/**
 * First screen the user sees regardless of login state
 * provides the map with all the leagues going into divisions
 * additional components added on top for login functionality,
 * joining team functionaity and applying as a refere
 * 
 * @author Adam Lyon W19023403
 */
class FindTeamsMap extends Component {
	constructor(props) {
		super(props)
		this.state = {
			leagues: null,
			pressedMarker: null,
			loginMenu: false,

			applyReferee: false,
			refereeNotes: "",

			refereeRoles: null,
			joinedTeams: null,

			createTeam: false,
			joinTeam: false
		}
	}

	/** Touching of map, disable all open UI for login / team / referee so only map is visible on screen */
	mapPressed = () => {
		this.setState({ loginMenu: false, pressedMarker: null, applyReferee: false, createTeam: false, joinTeam: false })
	}

	/** Check if selected league, if the user is currently a referee / pending ref */
	findRefApp = (leagueID) => {
		var hasMatch = false;
		for (var index = 0; index < this.state.refereeRoles.length; ++index) {
			var app = this.state.refereeRoles[index];
			if(app.uid == auth.currentUser.uid && app.id == leagueID){
				hasMatch = true;
				return app
			}
		}
		return false;
	}

	/** Check if selected league, if the user is currently a member of any team within it */
	userInLeague = (leagueID) => {
		var hasMatch = false;
		for (var index = 0; index < this.state.joinedTeams.length; ++index) {
			var teams = this.state.joinedTeams[index];
			if(teams.uid == auth.currentUser.uid && teams.leagueID == leagueID){
				hasMatch = true;
				return teams;
			}
		}
		return false;
	}

	/** Get teams the current user is affiliated with, if any */
	getUsersAffiliatedTeams = () => {
		if (this.props.authentication && auth.currentUser && auth.currentUser.uid) { // must be logged-in
			/** Get referee information for any the user is affiliated with */
			db
			.collectionGroup("Referees")
			.where("uid", "==", auth.currentUser.uid)
			.get()
			.then((snapshot) => {
				let ref = snapshot.docs.map(doc => {
					const data = doc.data()
					const id = doc.id
					return {id, ... data}
				})
				this.setState({ refereeRoles: ref })
			})
			.catch((error) => {
				console.log(error)
			})

			/** 
			 * Get all the teams, the user is a member of
			 * then get data on the team (parent collection)
			 * affiliated with the query
			 */
			db
			.collectionGroup("Members")
			.where("uid", "==", auth.currentUser.uid)
			.get()
			.then((snapshot) => {
				let temp = []
				snapshot.docs.map(doc => {
					const data = doc.data()
					const id = doc.id
					const leagueID = doc.ref.parent.parent.parent.parent.parent.parent.id
					const division = doc.ref.parent.parent.parent.parent.id
					const teamID = doc.ref.parent.parent.id
					/** Get team information for what the member is in */
					db
					.collection("Leagues")
					.doc(leagueID)
					.collection("Divisions")
					.doc(division)
					.collection("Teams")
					.doc(teamID)
					.get()
					.then(snapshotTeam => {
						const teamData = snapshotTeam.data()
						const kitStyle = teamData.kit
						const tName = teamData.name
						const tAbbreviation = teamData.abbreviation
						temp.push({ ...data, ...teamData, id, leagueID, division, teamID, kitStyle, tName, tAbbreviation })
					})
				})
				this.setState({ joinedTeams: temp })
			})
			.catch((error) => {
				console.log(error)
			})
		}
	}

	/** Get all leagues and users affiliated data method */
	getAllData = () => {
		db
		.collection("Leagues")
		.get()
		.then((snapshot) => {
			let leagues = snapshot.docs.map(doc => {
				const data = doc.data()
				const id = doc.id
				const season = data.seasons
				return {id, season, ...data}
			})
			this.setState({ leagues: leagues })
		})
		this.getUsersAffiliatedTeams()
	}
	
	/** Every revisit on screen, refresh the data */
	componentDidMount() {
		if (this.props.navigation !== undefined) { 
			this.navigationSubscription = this.props.navigation.addListener("focus", this.getAllData);
		}
	}

	/** User logged in, (happens when screen is already loaded) so get affiliated teams */
	componentDidUpdate(prevProps) {
		if (this.props.authentication !== prevProps.authentication && this.props.authentication) {
			this.getUsersAffiliatedTeams()
		}
	}

	/** Login button pressed, toggle rendering of the login component */
	loginClicked = () => {
		this.setState({ loginMenu: !this.state.loginMenu })
	}

	/** Send referee application to join a league */
	applyReferee = () => {
		db
		.collection("Leagues")
		.doc(this.state.pressedMarker.id)
		.collection("Referees")
		.doc(auth.currentUser.uid)
		.set({
			uid: auth.currentUser.uid,
			accepted: false,
			notes: this.state.refereeNotes,
			dateAccepted: 0,
			name: auth.currentUser.displayName
		})
		.then(() => {
			Alert.alert( // Let the user know an email has sucessfully been sent
                "REFEREE APPLICATION",
                "Your referee appication has been sent, waiting for the league owner to handle your application!"
            )
			this.setState({ applyReferee: false })
			this.getAllData()
		})
		.catch((error) => {
			console.log(error)
		})
	}

	/**
	 * Main component, shows the map, login functionality,
	 * joining, creating teams within a league and applying
	 * as a referee
	 */
  	render() {
		/** @var loginButton component if main login functionality is not displayed, display login button to go to that screen */
		let loginButton = (!this.props.authentication && !this.state.loginMenu)
			? 	
				<Pressable style={{ backgroundColor: "#21A361", width: "90%", position: "absolute", marginLeft: "5%", marginTop: StatusBar.currentHeight + 5, padding: 5, borderRadius: 15}} onPress={this.loginClicked} >
					<Text style = {{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: 32 }}>LOGIN</Text>
				</Pressable>
			: null

		/** @var leagues component Once leagues have been gathered from the firestore database, put the location of the league in a marker to add onto the map */
		let leagues = (this.state.leagues !== null)
			? this.state.leagues.map((league) => {
				return (
					<MapView.Marker
						key={league.id}
						coordinate={{
							latitude: league.location.latitude,
							longitude: league.location.longitude
						}}
						image={
							// If user is in league show a different marker colour
							(this.props.authentication && this.state.joinedTeams !== null && this.userInLeague(league.id))
								? require("../../assets/images/icons/map/joined-marker.png")
								: require("../../assets/images/icons/map/marker.png")
						}
						onPress={() => {
							// Check if user in the selected league for UI difference
							if (this.props.authentication && this.userInLeague(league.id)) {
								this.setState({ pressedMarker: {...this.userInLeague(league.id), ...league} })
							} else {
								this.setState({ pressedMarker: league })
							}
						}}
					/>
				)
			})
			: null

		/** @var pressedMarker component If a marker has been pressed, show the information relevent to that league */
		let pressedMarker = (this.state.pressedMarker !== null && !this.state.applyReferee && !this.state.createTeam)
			? 		  
				<View style={{ padding: 20, position: "absolute", backgroundColor: "red", width: "80%", bottom: 60, marginLeft: "10%", borderRadius: 15, backgroundColor: "#21A361"}}>
					<Text style={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: 22 }}>{(this.state.pressedMarker.divisions === 1) ? "ONE DIVISION" : this.state.pressedMarker.divisions + " DIVISIONS"  }</Text>
					{
						// If only one division promotion/relegation places is not relevent
						(this.state.pressedMarker.divisions === 1) 
							? null 
							: <Text style={{ textAlign: "center", color: "white", fontWeight: "bold" }}>Promotion/Relegation Places: {this.state.pressedMarker.relegationPromotionPlaces}</Text>
					}
					<Text style={{ textAlign: "center", color: "white", fontWeight: "bold" }}>Match Length: {this.state.pressedMarker.matchLength} mins</Text>
					<Text style={{ textAlign: "center", color: "white", fontWeight: "bold" }}>Teams: {this.state.pressedMarker.teamsJoined}/{this.state.pressedMarker.maxTeams * this.state.pressedMarker.divisions}</Text>
					<Text style={{ textAlign: "center", color: "white", fontWeight: "bold" }}>Referees: {this.state.pressedMarker.refereesJoined}</Text>
					<Text style={{ textAlign: "center", color: "white", fontWeight: "bold" }}>Play rival teams {this.state.pressedMarker.teamPlays} time(s) a season</Text>
									
					{
						(this.props.authentication) // must be logged-in
							?
								<>
									{	
										// Change content of button depending if user is a referee for the selected league, app is peneding or not currently one
										(this.state.refereeRoles !== null && this.state.pressedMarker !== null && this.findRefApp(this.state.pressedMarker.id) !== false)
											? 
												<Button
													mode="contained"
													disabled
													style={{ marginTop: 10 }}
												>
												{
													(this.findRefApp(this.state.pressedMarker.id).accepted)
														? "ALREADY A REFEREE"
														: "REFEREE APP PENDING"
												}
												</Button>

											: 
												<Button
													mode="contained"
													style={{ marginTop: 10 }}
													onPress={() => this.setState({ applyReferee: true })}
												>
													APPLY AS REFEREE
												</Button>
									}
									{
										// Change content of button depending if the user is a member associated to the selected league
										(this.state.joinedTeams !== null && this.state.pressedMarker !== null && this.userInLeague(this.state.pressedMarker.id) !== false)
											?	
												<Button
													mode="contained"
													style={{ marginTop: 10 }}
													onPress={() => {
														this.props.navigation.navigate("My Teams", { 
															screen: "Team",
															params: {
																team: this.state.pressedMarker
															}
														})
													}}
												>
													MY TEAMS
												</Button>
											: // Can a team be created within the division
												<>
													<Button
														mode="contained"
														style={{ marginTop: 10 }}
														onPress={() => this.setState({ createTeam: true })}
														disabled={this.state.pressedMarker.teamsJoined === (this.state.pressedMarker.maxTeams * this.state.pressedMarker.divisions)}
													>
														{
															// Max teams in division or not?
															(this.state.pressedMarker.teamsJoined === (this.state.pressedMarker.maxTeams * this.state.pressedMarker.divisions))
															? "MAX TEAMS"
															: "CREATE A TEAM"
														}
													</Button>
													<Button
														mode="contained"
														style={{ marginTop: 10 }}
														onPress={() => this.setState({ joinTeam: true })}
													>
														JOIN A TEAM
													</Button>
										 		</>	
										
									}
								</>
							: // Not logged in, allow user to see current divisions / teams
								<>
									<Text style={{ color: "red", textAlign: "center", fontWeight: "bold", fontSize: 14 }}>Login or Register to Join or Create a team!</Text>
									<Button
										mode="contained"
										style={{ marginTop: 10 }}
										onPress={() => {
											this.props.navigation.navigate("My Teams", { 
												screen: "View Divisions",
												params: {
													league: this.state.pressedMarker
												}
											})
										}}
									>
										{
											// One or multiple divisions in league
											(this.state.pressedMarker.divisions === 1 ? "VIEW DIVISION" : "VIEW DIVISIONS")
										}
									</Button>
								</>
					}			
				</View>	  
			: null // marked not pressed


		let applyReferee = (!this.state.applyReferee) // render the apply referee UI if enabled
			? null
			: 
				<View style={{ padding: 20, position: "absolute", backgroundColor: "red", width: "80%", bottom: 60, marginLeft: "10%", borderRadius: 15, backgroundColor: "#21A361"}}>
					<Header title={"APPLY AS A REFEREE"} color={"white"} marginTop={0} />
						<TextInput
							style={{ marginVertical: 10 }}
							label="Notes"
							multiline={true}
							maxLength={100}
							value={this.state.refereeNotes}
							onChangeText={text => this.setState({ refereeNotes: text })}
						/>
						<Button
							mode="contained"
							style={{ marginTop: 10 }}
							onPress={this.applyReferee}
						>
							SEND APPLICATION
						</Button>
						<Button
							mode="contained"
							style={{ marginTop: 10 }}
							onPress={() => this.setState({ applyReferee: false })}
						>
							CANCEL
						</Button>
				</View>

		/** Login button pressed, render the login component screen */
		let loginMenu = (this.state.loginMenu && !this.props.authentication)
		    ? <Login goBack={this.loginClicked} />
			: null
		
		/** 
		 * Main render, use the variables produced above
		 * with google map
		 */
		return (
			<View style={ styles.container }>
				<Map mapPressed={this.mapPressed} showSearch={this.state.pressedMarker === null} provider={PROVIDER_GOOGLE} leagues={leagues} />
				
				{loginButton}
				{pressedMarker}
				{applyReferee}
				{loginMenu}
				{
					// Creating team or viewing join team division component
					(this.state.pressedMarker !== null && this.state.createTeam)
						? <CreateTeam getAllData={this.getAllData} goBack={this.mapPressed} leagueID={this.state.pressedMarker.id} divisions={this.state.pressedMarker.divisions} />
						: (this.state.pressedMarker !== null && this.state.joinTeam)
							? <JoinTeamDivision goBack={this.mapPressed} navigation={this.props.navigation} leagueID={this.state.pressedMarker.id} maxTeams={this.state.pressedMarker.maxTeams} />
							: null
				}
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	}
})
/** Get authentication state from redux store */
const mapStateToProps = (state) => {
	return {
		authentication: state.authenticateReducer.logged
	}
}

export default connect(mapStateToProps) (FindTeamsMap);