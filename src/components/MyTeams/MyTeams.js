import React, { Component } from "react"
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from "react-native"
import { connect } from "react-redux"

import Header from "../Utility/Header"
import { auth, db } from "../Auth/FirebaseInit"
import Kit from "../Utility/Kit"
import { KIT_STYLE } from "../FindTeam/KitData"

/**
 * MyTeams main screen show all the teams
 * the user has joined and any leagues that
 * they referee for
 * 
 * @author Adam Lyon W19023403
 */
class MyTeams extends Component {
	constructor(props) {
		super(props)
		this.state = {
			refereeApplications: [],
			teams: []
		}
	}

	/**
	 * Get all leagues that the user can referee if any
	 */
	getUsersRefereeTeams = () => {
		db
		.collectionGroup("Referees")
		.where("uid", "==", auth.currentUser.uid) // current user
		.where("accepted", "==", true) // must be accepted as ref and not pending application approval/rejection
		.get()
		.then((snapshot) => {
			snapshot.forEach((doc) => { // get league data for every league they referee
				db
				.collection("Leagues")
				.doc(doc.ref.parent.parent.id)
				.get()
				.then(snapshotLeague => {
					if (this.state.refereeApplications.find(app => app.leagueID === doc.ref.id) === undefined) { // for every refresh don't duplicate same record
						this.setState(prevState => ({
							refereeApplications: [...prevState.refereeApplications, {leagueID: doc.ref.id, location: snapshotLeague.data().locationName, matchLength: snapshotLeague.data().matchLength}]
						}))
					} else {
						let oldRecords = this.state.refereeApplications
						let index = this.state.refereeApplications.findIndex(el => el.leagueID === doc.ref.id);
						oldRecords[index] = {leagueID: doc.ref.id, location: snapshotLeague.data().locationName, matchLength: snapshotLeague.data().matchLength}
						this.setState({ refereeApplications: oldRecords })
					}					
				})
			})	
		})
	}

	/**
	 * Get all teams that the user is in and get the team information
	 */
	getUsersTeams = () => {
		this.setState({ teams: [] })
		db
		.collectionGroup("Members")
		.where("uid", "==", auth.currentUser.uid) // logged-on user
		.get()
		.then((snapshot) => {
			snapshot.forEach((doc) => { // for each team in

				var teamData = { // member data
					uid: doc.data().uid,
					number: doc.data().number,
					tAbbreviation: null,
					tName: null,
					kitStyle: null,
					standingPosition: null,
					nextEvent: null,
					season: null,

					leagueID: doc.ref.parent.parent.parent.parent.parent.parent.id,
					division: doc.ref.parent.parent.parent.parent.id,
					teamID: doc.ref.parent.parent.id
					
				}
				doc.ref.parent.parent.parent.parent.parent.parent.get().then(docLeague => {teamData["season"] = docLeague.data().seasons }) // current season

				// Get team information for the ones the user has joined
				db 
				.doc(doc.ref.parent.parent.path)
				.get()
				.then((teamSnapshot) => {
					teamData["tAbbreviation"] = teamSnapshot.data().abbreviation
					teamData["tName"] = teamSnapshot.data().name
					teamData["kitStyle"] = teamSnapshot.data().kit
					teamData["standingPosition"] = teamSnapshot.data().standingPosition
					teamData["nextEvent"] = teamSnapshot.data().nextEvent
					//if (this.state.teams.find(team => team.teamID === teamData.teamID) === undefined) { // for every refresh don't duplicate
						//this.setState(prevState => ({
						//	teams: [...prevState.teams, teamData]
						//}))
					this.setState({ teams: [...this.state.teams, teamData] })
					/*} else {
						let oldRecords = this.state.teams
						let index = this.state.teams.findIndex(el => el.teamID === teamData.teamID);
						oldRecords[index] = teamData
						this.setState({ teams: oldRecords })
					}*/
				})
				.catch((error) => {
					console.log(error)
				})
			})
		})
		.catch((error) => {
			console.log(error)
		})
	}

	/** Update screen if logged-in */
	getAllData = () => {
		if (this.props.authentication) {
			this.getUsersTeams()
			this.getUsersRefereeTeams()
		}
	}

	/**
	 * Every render of myteams refresh the database to keep
	 * data most recent checking for undefined is to prevent
	 * errors for navigation during testing
	 */
	componentDidMount() {
		if (this.props.navigation !== undefined) {
			this.navigationSubscription = this.props.navigation.addListener("focus", this.getAllData);
		}
	}

	/**
	 * Navigate to team selected
	 * @param team JSON team information
	 */
	teamClicked = (team) => {
		this.props.navigation.navigate("Team", {
			team: team
		})
	}

	/**
	 * Preview all matches that can be refereed
	 * @param data JSON league details
	 */
	refereeMatches = (data) => {
		this.props.navigation.navigate("Referee Matches", {
			leagueID: data.leagueID,
			location: data.location[0],
			matchLength: data.matchLength
		})
	}

	render() {
		const month = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        const ordinals = ["", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"]

		/** 
		 * @var refereeApplications component For every league the user referees for display the league location details
		 */
		let refereeApplications = this.state.refereeApplications.map((value, index) => {
			let address = ""
			address = (value.location[0].street !== null)
						? value.location[0].street
						: ""
			address = (value.location[0].subregion !== null)
						? (address === "")
						? value.location[0].subregion
						: address + "\n" + value.location[0].subregion
						: ""
			address = (value.location[0].country !== null)
						? (address === "")
						? value.location[0].country
						: address + "\n" + value.location[0].country
						: ""
			/** Location details into a button to then view matches for that league */
			return (
				<TouchableOpacity key={index} style={{ width: "75%", marginLeft: "12.5%", marginTop: 20, backgroundColor: "green", borderRadius: 10 }} onPress={() => this.refereeMatches(value)} activeOpacity={1}>
					<Text style={{ color: "white", fontSize: 20, textAlign: "center", fontWeight: "bold" }}>REFEREE</Text>
					<Text style={{ color: "white", fontSize: 16, textAlign: "center" }}>{address}</Text>
				</TouchableOpacity>
			)
		})

		/**
		 * @var teams component For every team the user is in show team information / kit and next match date
		 */
		let teams = (this.state.teams !== null)
			? 	
				this.state.teams.map((team, index) => { // for ever team
					let dateEvent = new Date(team.nextEvent)
					return (
						<View key={index}>
							<TouchableOpacity key={index} onPress={() => this.teamClicked(team)} activeOpacity={.9} style={{ width: "80%", marginLeft: "10%", margin: 5, paddingVertical: 5, flexDirection: "row", justifyContent: "center"}}>
								
								<View style={styles.kitContainer}>
									<Kit
										kitLeftLeft={KIT_STYLE[team.kitStyle].kitLeftLeft}
										kitLeft={KIT_STYLE[team.kitStyle].kitLeft}
										kitMiddle={KIT_STYLE[team.kitStyle].kitMiddle}
										kitRight={KIT_STYLE[team.kitStyle].kitRight}
										kitRightRight={KIT_STYLE[team.kitStyle].kitRightRight}
										numberColor={KIT_STYLE[team.kitStyle].numberColor}
										kitNumber={team.number}
										width={17}
										height={100}
										fontSize={46}
									/>
								</View>

								<View style={{ width: "70%", height: "100%" }}>
									<Text style={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: 18 }}>{team.tName}</Text>
									<View style={{ backgroundColor: "white", width: "80%", marginLeft: "auto", marginRight: "auto", height: 1, borderRadius: 100 }}></View>

									<View>
										<Text style={{ color: "white", fontSize: 16, opacity: .9, textAlign: "center", marginTop: 15 }}>
											{team.standingPosition !== 0 ? ("#" + team.standingPosition + " in Division") : ""}
										</Text>
										{
											team.nextEvent !== 0
												? 	
													<View style={{ flexDirection: "row", marginTop: 20 }}>
														<View style={{ flex: .7 }}></View>
														<Text style={{ color: "white" }}>
															NEXT MATCH: {dateEvent.getDate()}
														</Text>
														<Text style={{ color: "white", fontSize: 10 }}>
															{ordinals[dateEvent.getDay()]}
														</Text>
														<Text style={{ color: "white" }}>
															{" " + month[dateEvent.getMonth()].toUpperCase()}
														</Text>
													</View>
												:	
													<Text style={{ textAlign: "right", color: "red", fontSize: 15, marginTop: 20 }}>
														NO MATCHES SCHEDULED
													</Text>
										}
									</View>

								</View>
							</TouchableOpacity>

							<View style={{ backgroundColor: "white", width: "80%", marginLeft: "auto", marginRight: "auto", height: 1, borderRadius: 100 }}></View>
						</View>
					)
				})
			: null
		
		/** User is logged in show screen with teams and refere leagues the user can access */
		if (this.props.authentication) {
			return (
				<View style={styles.container}>
					<Header color={"white"} title={"MY TEAMS"} marginTop={StatusBar.currentHeight+5} />
					{refereeApplications}
					{
						(this.state.refereeApplications.length !== 0)
							? <View style={{ backgroundColor: "white", width: "50%", marginLeft: "auto", marginRight: "auto", height: 2, borderRadius: 100 }}></View>
							: null
					}
					{
						(this.state.teams.length !== 0)
						? teams
						: <Text style={{ color: "white", textAlign: "center", fontSize: 18, marginLeft: "auto", marginRight: "auto", marginTop: 45 }}>You're not in any teams!</Text>
					}
				</View>
			)
		} else {
			/** Can't access content if not logged-in */
			return (
				<View testID='no-content' style={[styles.container, {flexWrap: "nowrap"}]}>
					<Text style={{textAlign: "center", width: "100%", color: "white", "fontSize": 30, fontWeight: "bold"}}>You must be logged in to access this content!</Text>
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
		width: 100
	}
})

const mapStateToProps = (state) => {
	return {
		authentication: state.authenticateReducer.logged
	}
}

export default connect(mapStateToProps) (MyTeams)