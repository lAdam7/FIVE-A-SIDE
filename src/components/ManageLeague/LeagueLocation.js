import React, { Component } from "react"
import { View, StyleSheet, StatusBar, Text } from "react-native"
import { IconButton, Button } from "react-native-paper"
import * as Location from "expo-location"

import Map from "../Map/Map"
import { auth, db } from "../Auth/FirebaseInit"

/**
 * Create a league first screen with the map component,
 * adding a back button alongisde additional center marker
 * with bottom UI for the DONE button
 * 
 * @author Adam Lyon W19023403
 */
class LeagueLocation extends Component {
	constructor(props) {
		super(props)
		this.state = {
			latitude: null,
			longitude: null,
			pressedDone: false,
			location: null,
			locationPosition: null
		}
	}
	/**
	 * @param value JSON location of current map position
	 */
	regionChanged = (value) => {
		this.setState({
			latitude: value.latitude,
			longitude: value.longitude
		})
	}
	/** Back button pressed, stop rendering the map screen */
	backPressed = () => {
		if (!this.state.pressedDone) {
			this.props.navigation.goBack()
		} else {
			this.setState({ pressedDone: false })
		}
	}

	/** Once location chosen, get the location details with the latidue and longitude and update firestore */
	donePressed = async () => {
		this.setState({ pressedDone: true })
		
		let latitude = this.state.latitude
		let longitude = this.state.longitude
		let response = await Location.reverseGeocodeAsync({ // get address from latitude and longitude
			latitude: latitude,
			longitude: longitude
		})
        
		/** Update league location */
        db
        .collection("Leagues")
        .doc(this.props.route.params.league.id)
        .update({
            "location": {
                latitude: latitude,
				longitude: longitude
            },
            "locationName": response
        })
        .then(() => {
            this.props.navigation.goBack()
        })   
	}
	
	/**
	 * Render map with a back button, and center icon for the new
	 * league location for update
	 */
  	render() {
		return (
			<View style={ styles.container }>
				<Map regionChanged={this.regionChanged} disabled={!this.state.pressedDone} />
				
				<IconButton
						style={ styles.icon }
						icon={require("../../assets/images/icons/arrow-left-circle.png")}
						color={"yellow"}
						size={50}
						onPress={this.backPressed}
					/>
				<View style={styles.iconBox}></View>

				<View style={styles.fixedMarker} pointerEvents="none" >
					<View style={{backgroundColor: "green", width: 76, height: 76, position: "absolute", borderRadius: 38}}></View>
					<View style={{ backgroundColor: "white", width: 60, height: 60, position: "absolute", borderRadius: 38 }}></View>
					<IconButton
						icon={require("../../assets/images/icons/football.png")}
						color={"black"}
						size={76}
					/>
				</View>

				<View style={{ position: "absolute", width: "80%", backgroundColor: "#21A361", marginLeft: "10%", borderRadius: 30, padding: 10, bottom: 30}}>
					<Text style={{ textAlign: "center", marginBottom: 10, fontWeight: "bold", fontSize: 17, color: "white" }}>CHOOSE NEW LEAGUE LOCATION</Text>
					<Button mode='contained' onPress={this.donePressed} style={{ width: "60%", marginLeft: "20%", marginVertical: 5, backgroundColor: "blue", borderRadius: 30 }} labelStyle={{fontWeight: "bold", fontSize: 17}} >
						DONE
					</Button>
				</View>
				
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	icon: {
		position: 'absolute',
		marginLeft: 15,
		marginTop: StatusBar.currentHeight,
		zIndex: 5
	},
	iconBox: {
		position: "absolute",
		marginLeft: 27.5,
		marginTop: StatusBar.currentHeight + 12.25,
		borderRadius: 50,
		width: 50,
		height: 50,
		backgroundColor: "#21A361"
	},
	fixedMarker: {
		position: "absolute",
		top: 0, 
		left: 0, 
		right: 0, 
		bottom: 0, 
		justifyContent: 'center', 
		alignItems: 'center'
	}
})

export default LeagueLocation