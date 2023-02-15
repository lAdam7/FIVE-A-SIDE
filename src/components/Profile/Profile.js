import React, { Component } from "react"
import { ScrollView, View, Text, StyleSheet, Pressable, StatusBar } from "react-native"
import { connect } from "react-redux"

import { auth, db } from "../Auth/FirebaseInit"
import Header from "../Utility/Header"
import Kit from "../Utility/Kit"

/**
 * Users profile, shows content only if logged in,
 * shows the users kit if they're in a club, alongside statistics
 * with options to create your own league, changepassword and
 * logout functionality
 * 
 * @author Adam Lyon W19023403
 */
class Profile extends Component {
	constructor(props) {
		super(props)
		this.state = {
			manageLeague: null,
			userData: null
		}
		this.logout = this.logout.bind(this)
	}

	/**
	 * Check if the user manages a league and
	 * get data for logged-in users to display statistics
	 */
	getData = () => {
		if (this.props.authentication) {
			db
			.collection("Leagues")
			.doc(auth.currentUser.uid)
			.get()
			.then((result) => { // user manages a league
				this.setState({ manageLeague: (result.data() === undefined) ? false : true })
			})
			.catch((error) => {
				console.log(error)
			})

			db
			.collection("Users")
			.doc(auth.currentUser.uid)
			.get()
			.then(snapshot => { // users global data for wins / mins played and and matches played
				this.setState({ userData: snapshot.data() })
			})
			.catch(error => {
				console.log(error)
			})
		}	
	}
	
	/** Every screen load call getData navigation undefined check to assist auto tests */
	componentDidMount() {
		if (this.props.navigation !== undefined) {
			this.navigationSubscription = this.props.navigation.addListener("focus", this.getData);
		}
	}
	
	/** Logout, return to main screen and call firebase method to clear credentials */
	logout() {
		this.props.navigation.navigate("Find Teams")
		auth.signOut()
	}

	/**
	 * Show team kit for first team joined, users
	 * global stats for all their teams for mins played,
	 * matches played and goals scored, Create/manage league
	 * options, change password and logout
	 */
	render() {
		if (this.props.authentication) {
			return (
				<ScrollView testID='profile'>
					<View style={styles.container}>

					<Header color={"white"} title={"PROFILE"} marginTop={StatusBar.currentHeight+5} />

					<View style={styles.kitContainer}>
						<Kit kitLeftLeft={"#000000"} kitLeft={"#FFFFFF"} kitMiddle={"#000000"} kitRight={"#FFFFFF"} kitRightRight={"#000000"} numberColor={"#FF0000"} numberBorderColor={"#00FF00"} kitNumber={25} />
					</View>

					<Text style={styles.statReason}>Total Matches Played</Text>
					<Text style={styles.statCircle}>{this.state.userData !== null ? this.state.userData.matchesPlayed : ""}</Text>

					<Text style={styles.statReason}>Total Goals Scored</Text>
					<Text style={styles.statCircle}>{this.state.userData !== null ? this.state.userData.goalsScored : ""}</Text>

					<Text style={styles.statReason}>Total Minutes Played</Text>
					<Text style={styles.statCircle}>{this.state.userData !== null ? this.state.userData.minutesPlayed : ""}</Text>

					{
						this.state.manageLeague === false && (
							<Pressable style={[styles.button, { backgroundColor: "#00D3FF", borderTopLeftRadius: 25, borderTopRightRadius: 25 }]} onPress={() => { this.props.navigation.navigate("Create League") }}>
								<Text style={styles.buttonText}>CREATE OWN LEAGUE</Text>
							</Pressable>
						)
					}
					{
						this.state.manageLeague === true && (
							<Pressable style={[styles.button, { backgroundColor: "#00D3FF", borderTopLeftRadius: 25, borderTopRightRadius: 25 }]} onPress={() => { this.props.navigation.navigate("Manage League") }}>
								<Text style={styles.buttonText}>MANAGE LEAGUE</Text>
							</Pressable>
						)
					}

					<Pressable style={[styles.button, {backgroundColor: "#F29F22"}]} onPress={() => { this.props.navigation.navigate("Change Password") }}>
						<Text style={styles.buttonText}>CHANGE PASSWORD</Text>
					</Pressable>

					<Pressable style={[styles.button, { backgroundColor: "#FF0011", borderBottomLeftRadius: 25, borderBottomRightRadius: 25 }]} onPress={this.logout} >
						<Text style={styles.buttonText}>LOGOUT</Text>
					</Pressable>
					
					</View>
				</ScrollView>
			)
		} else {
			return (
				<View testID='no-content' style={[styles.container, {flexWrap: "nowrap"}]}>
					<Text style={{textAlign: "center", width: "100%", color: "white", "fontSize": 30, fontWeight: "bold"}}>You must be logged in to access this content!</Text>
				</View>
			)
		}
	}
}

const styles = StyleSheet.create({
	button: {
		flexBasis: "70%",
		marginLeft: "15%",
		marginRight: "15%",
		width: "60%",
		padding: 8
	},
	buttonText: {
		textAlign: "center",
		color: "white",
		fontWeight: "bold",
		fontSize: 17
	},
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
		marginRight: "auto"
	},
	statReason: {
		width: "100%",
		textAlign: "center",
		color: "white",
		fontSize: 17
	},
	statCircle: {
		textAlign: "center",
		borderColor: "white",
		borderWidth: 2,
		height: 80,
		width: 80,
		lineHeight: 80,
		borderRadius: 40,
		color: "white",
		fontWeight: "bold",
		fontSize: 30,
		marginLeft: "auto",
		marginRight: "auto",
		marginBottom: 25
	}
})

/** Get current authentication state */
const mapStateToProps = (state) => {
	return {
		authentication: state.authenticateReducer.logged
	}
}

export default connect(mapStateToProps) (Profile)