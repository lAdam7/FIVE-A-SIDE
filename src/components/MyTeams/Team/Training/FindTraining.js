import React, { Component } from "react"
import { ScrollView, View, Text, StyleSheet } from "react-native"
import { Button } from "react-native-paper"
import MapView, { PROVIDER_GOOGLE } from "react-native-maps"

import { auth, db } from "../../../Auth/FirebaseInit"
import Map from "../../../Map/Map"

class FindTraining extends Component {
    constructor(props) {
        super(props)
        this.state = {
            training: [],

            pressedMarker: null
        }
    }

    componentDidMount() {
        db
        .collection("Training")
        .get()
        .then(training => {
            let data = training.docs.map(value => {
                return { ...value.data() }
            })
            this.setState({ training: data })
        })
    }

    /** Touching of map, disable all open UI for login / team / referee so only map is visible on screen */
	mapPressed = () => {
		this.setState({ pressedMarker: null })
	}

    organizeTraining = (time, index) => {
        let currentMarker = this.state.pressedMarker
        currentMarker.times.splice(index, 1)
        this.setState({ pressedMarker: currentMarker })
        
        db
        .collection("Training")
        .doc(currentMarker.league + "-" + currentMarker.team)
        .update({
            times: currentMarker.times
        })

        db
        .collection("Training")
        .doc(currentMarker.league + "-" + currentMarker.team)
        .collection("TrainingMatches")
        .add({
            teams: [(currentMarker.league + "-" + currentMarker.team), (this.props.league + "-" + auth.currentUser.uid)],
            teamA: {
                league: currentMarker.league,
                division: currentMarker.division,
                team: currentMarker.team,
                abbreviation: currentMarker.abbreviation,
                name: currentMarker.name,
                kit: currentMarker.kit
            },
            teamB: {
                league: this.props.league,
                division: this.props.division,
                team: auth.currentUser.uid,
                ...this.props.teamData
            },
            start: time.start
        })
    }

    render() {
        const weekday = ["Sunday", "Monday" ,"Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        const month = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        const ordinals = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"]

        let training = 
            this.state.training.filter(training => training.team !== auth.currentUser.uid).map((session) => {
				return (
					<MapView.Marker
						key={session.team}
						coordinate={{
							latitude: session.location.latitude,
							longitude: session.location.longitude
						}}
						image={ require("../../../../assets/images/icons/map/marker.png") }
						onPress={() => { this.setState({ pressedMarker: session }) }}
					/>
				)
			})
        
        let address = ""
        if (this.state.pressedMarker !== null) {
			address = (this.state.pressedMarker.locationName.street !== null)
						? this.state.pressedMarker.locationName.street
						: ""
			address = (this.state.pressedMarker.locationName.subregion !== null)
						? (address === "")
						? this.state.pressedMarker.locationName.subregion
						: address + "\n" + this.state.pressedMarker.locationName.subregion
						: ""
			address = (this.state.pressedMarker.locationName.country !== null)
						? (address === "")
						? this.state.pressedMarker.locationName.country
						: address + "\n" + this.state.pressedMarker.locationName.country
						: ""
        }

        let pressedMarker = (this.state.pressedMarker === null)
            ? null
            : 
                <View style={{ padding: 20, position: "absolute", backgroundColor: "red", width: "80%", bottom: 60, marginLeft: "10%", borderRadius: 15, backgroundColor: "#21A361"}}>
                    <Text style={{ color: "white", fontSize: 16, textAlign: "center", fontWeight: "bold" }}>{address}</Text>
                    {
                        this.state.pressedMarker.times.map((time, index) => (
                            <View key={index} style={{ borderWidth: 1, borderRadius: 12, borderColor: "white", marginVertical: 5 }}>
                                <View style={{ justifyContent: "center" }}>
                                    <View style={{ flexDirection: "row", justifyContent: "center" }}>
                                        <Text style={{ color: "white", textAlign: "center", marginTop: 5, fontSize: 14 }}>{weekday[new Date(time.start).getDay()]} {new Date(time.start).getDate()}</Text>
                                        <Text style={{ color: "white", textAlign: "center", marginTop: 5, fontSize: 10 }}>{ordinals[Number(String(new Date(time.start).getDate()).slice(-1))]}</Text>
                                    </View>
                                    <Text style={{ color: "white", textAlign: "center", fontSize: 14 }}>{month[new Date(time.start).getMonth()]} </Text>
                                    <Text style={{ color: "white", textAlign: "center", fontSize: 14 }}>{new Date(time.start).getHours()}:{new Date(time.start).getMinutes()} {(new Date(time.start).getHours() >= 12) ? "PM" : "AM"} </Text>
                                </View>
                            <Button
                                mode="contained"
                                style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomRightRadius: 12, borderBottomLeftRadius: 12 }}
                                onPress={() => { this.organizeTraining(time, index) }}
                            >
                                TAKE
                            </Button>
                            </View>
                        ))
                    }
                </View>
        return (
            <>
                <Map 
                    showSearch={this.state.pressedMarker === null} 
                    mapPressed={this.mapPressed}
                    provider={PROVIDER_GOOGLE} 
                    leagues={training}
                />
                {pressedMarker}
            </>
        )
    }
}

const styles = StyleSheet.create({
	kitContainer: {
		width: 65,
        marginVertical: 5
	}
})

export default FindTraining