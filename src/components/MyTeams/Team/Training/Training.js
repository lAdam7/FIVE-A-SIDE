import React, { Component } from "react"
import { ScrollView, View, Text, StyleSheet, StatusBar } from "react-native"
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"

import Header from "../../../Utility/Header"
import { auth, db } from "../../../Auth/FirebaseInit"

import FindTraining from "./FindTraining"
import SetTraining from "./SetTraining"

const TabTop = createMaterialTopTabNavigator();

class Training extends Component {
    constructor(props) {
        super(props)
        this.state = {
            location: null,
            locationName: null,
            teamData: {}
        }
    }

    componentDidMount() {
        db
        .collection("Leagues")
        .doc(this.props.route.params.league)
        .collection("Divisions")
        .doc(this.props.route.params.division)
        .collection("Teams")
        .doc(auth.currentUser.uid)
        .get()
        .then(teamSnapshot => {
            this.setState({ location: teamSnapshot.data().trainingLocation, locationName: teamSnapshot.data().trainingName, teamData: { abbreviation: teamSnapshot.data().abbreviation, name: teamSnapshot.data().name, kit: teamSnapshot.data().kit } })
        })
    }

    render() {
        return (
            <>
                <Header title={"Sort Training"} color={"white"} marginTop={StatusBar.currentHeight} />
				<TabTop.Navigator screenOptions={{ tabBarInactiveTintColor: "white", tabBarActiveTintColor: "white", tabBarStyle: { backgroundColor: "#21A361", height: 45 }, tabBarIndicatorStyle: { backgroundColor: "white" }}} sceneContainerStyle={{ backgroundColor: "#21A361" }} >
                    <TabTop.Screen name="Find Training" children={() => <FindTraining teamData={this.state.teamData} league={this.props.route.params.league} division={this.props.route.params.division} />} />
                    <TabTop.Screen name="Set Training" children={() => <SetTraining teamData={this.state.teamData} location={this.state.location} locationName={this.state.locationName} division={this.props.route.params.division} league={this.props.route.params.league} />} />    
                </TabTop.Navigator> 
            </>
        )
    }
}
export default Training