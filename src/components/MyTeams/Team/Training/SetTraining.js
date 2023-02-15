import React, { Component } from "react"
import { ScrollView, View, Text, StyleSheet, StatusBar, TouchableOpacity } from "react-native"
import { Button, Switch, IconButton } from "react-native-paper"
import MapView, { PROVIDER_GOOGLE } from "react-native-maps"
import * as Location from "expo-location"
import RNDateTimePicker from "@react-native-community/datetimepicker"

import Map from "../../../Map/Map"
import { auth, db } from "../../../Auth/FirebaseInit"

class SetTraining extends Component {
    constructor(props) {
        super(props)
        this.state = {
            trainings: [],

            settingLocation: false,
            latitude: null,
			longitude: null,
            choosingDate: false,
            date: new Date(),
            choosingTime: false
        }
    }
    
    componentDidMount() {
        db
        .collection("Training")
        .doc(this.props.league + "-" + auth.currentUser.uid)
        .get()
        .then(result => {
            if (result.exists) {
                const data = result.data()
                this.setState({ trainings: data.times })
            }
        })
    }
    /*
    componentDidUpdate(prevProps) {
        if (this.props.trainingAvailability !== prevProps.trainingAvailability) {
            this.setState({ divisionData: this.props.trainingAvailability })
        }
    }*/

    settingLocation = () => {
        this.setState({ settingLocation: !this.state.settingLocation })
    }

    updateLocation = async () => {
        let latitude = this.state.latitude
		let longitude = this.state.longitude

		let response = await Location.reverseGeocodeAsync({ // get location details from latitude and longitude
			latitude: latitude,
			longitude: longitude
		})
        this.settingLocation()
        db
        .collection("Leagues")
        .doc(this.props.league)
        .collection("Divisions")
        .doc(this.props.division)
        .collection("Teams")
        .doc(auth.currentUser.uid)
        .update({
            trainingLocation: {
                latitude: latitude,
                longitude: longitude
            },
            trainingName: response[0]
        })
    }

    /** Set region to current location */
	regionChanged = (value) => {
		this.setState({
			latitude: value.latitude,
			longitude: value.longitude
		})
	}

    chooseDateTime = () => {
        this.setState({ choosingDate: !this.state.choosingDate })
    }

    setDate = (event, date) => {
        if (event.type === "set") {
            this.setState({ date: new Date(date), choosingDate: false, choosingTime: true })
        } else {
            this.setState({ choosingDate: false })
        }
    }

    setTime = (event, date) => {
        if (event.type === "set") {
            this.setState({ date: new Date(date), choosingTime: false })
            this.addTraining(new Date(date))
        } else {
            this.setState({ choosingTime: false })
        }
    }

    updateTeam = (data) => {
        if (data.length === 0) {
            db
            .collection("Training")
            .doc(this.props.league + "-" + auth.currentUser.uid)
            .get()
            .then(data => {
                if (data.exists) {
                    db
                    .collection("Training")
                    .doc(this.props.league + "-" + auth.currentUser.uid)
                    .update({
                        active: false,
                        times: []
                    })
                }
            })
        } else {
            db
            .collection("Training")
            .doc(this.props.league + "-" + auth.currentUser.uid)
            .set({
                league: this.props.league,
                division: this.props.division,
                team: auth.currentUser.uid,
                times: data,
                location: this.props.location,
                locationName: this.props.locationName,
                active: true,
                ...this.props.teamData
            })
        }
    }

    addTraining = (date) => {
        let currentTraining = [...this.state.trainings]
        currentTraining.push({start: date.getTime()})
        this.updateTeam(currentTraining)
        this.setState({ trainings: currentTraining })
    }

    removeTime = (index) => {
        let getTrainings = this.state.trainings
        getTrainings.splice(index, 1)
        this.updateTeam(getTrainings)
        this.setState({ trainings: getTrainings })
    }

    render() {
        const weekday = ["Sunday", "Monday" ,"Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        const month = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        const ordinals = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"]

        const maxDate = new Date()
        maxDate.setFullYear(maxDate.getFullYear() + 1)
        return (
            (!this.state.settingLocation)
                ? 
                    <View>
                        <View>
                            <Button
                                mode="contained"
                                onPress={this.settingLocation}
                                style={{ borderRadius: 0 }}
                            >
                                SET LOCATION
                            </Button>
                            <Text style={{ color: "white", textAlign: "center", fontWeight: "bold", fontSize: 20, marginTop: 15 }}>Training Availability</Text>
                            <Button
                                mode="contained"
                                onPress={this.chooseDateTime}
                                color="blue"
                                style={{ borderRadius: 0 }}
                            >
                                ADD DATE / TIME
                            </Button>
                            {
                                this.state.trainings.map((training, index) => 
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        key={index}
                                        style={{ backgroundColor: "green", marginVertical: 5, borderRadius: 12, width: "60%", marginLeft: "20%", padding: 10 }}
                                        onPress={() => { this.removeTime(index) }}
                                    >
                                        <View style={{ justifyContent: "center" }}>
                                            <View style={{ flexDirection: "row", justifyContent: "center" }}>
                                                <Text style={{ color: "white", textAlign: "center", marginTop: 5, fontSize: 18 }}>{weekday[new Date(training.start).getDay()]} {new Date(training.start).getDate()}</Text>
                                                <Text style={{ color: "white", textAlign: "center", marginTop: 5, fontSize: 10 }}>{ordinals[Number(String(new Date(training.start).getDate()).slice(-1))]}</Text>
                                            </View>
                                            <Text style={{ color: "white", textAlign: "center", fontSize: 18 }}>{month[new Date(training.start).getMonth()]} </Text>
                                            <Text style={{ color: "white", textAlign: "center", fontSize: 18 }}>{new Date(training.start).getHours()}:{new Date(training.start).getMinutes()} {(new Date(training.start).getHours() >= 12) ? "PM" : "AM"} </Text>
                                            
                                        </View>
                                    </TouchableOpacity> 
                                )
                            }
                            {
                                (this.state.choosingDate)
                                    ? 
                                        <RNDateTimePicker 
                                            mode="date" 
                                            value={this.state.date} 
                                            onChange={this.setDate}
                                            minimumDate={new Date()}
                                            maximumDate={maxDate}
                                        />
                                    : null
                            }
                            {
                                (this.state.choosingTime)
                                    ? 
                                        <RNDateTimePicker 
                                            mode="time" 
                                            value={this.state.date} 
                                            onChange={this.setTime}
                                        />
                                    : null
                            }
                        </View>
                    </View>
                : 
                    <View style={ styles.container }>
                        <Map 
                            showSearch={true} 
                            provider={PROVIDER_GOOGLE} 
                            regionChanged={this.regionChanged}
                        />

                        <Button
                            mode="contained"
                            color="blue"
                            style={{ borderRadius: 0 }}
                            onPress={this.updateLocation}
                        >
                            UPDATE LOCATION
                        </Button>
                        <View style={styles.fixedMarker} pointerEvents="none" >
                            <View style={{backgroundColor: "green", width: 76, height: 76, position: "absolute", borderRadius: 38}}></View>
                            <View style={{ backgroundColor: "white", width: 60, height: 60, position: "absolute", borderRadius: 38 }}></View>
                            <IconButton
                                icon={require("../../../../assets/images/icons/football.png")}
                                color={"black"}
                                size={76}
                            />
				        </View>
                    </View>
            
        )
    }
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	icon: {
		position: "absolute",
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
		justifyContent: "center", 
		alignItems: "center"
	}
})

export default SetTraining