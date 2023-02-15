import React, { Component } from "react"
import { View, Text, ScrollView, Alert } from "react-native"
import { Button, Switch } from "react-native-paper"

import Header from "../Utility/Header"
import { db, auth } from "../Auth/FirebaseInit"
import LeagueDays from "./LeagueDays"
import DropDown from "../Utility/DropDown"

/**
 * Information required for creating a league including
 * division count, promotion and relegation features, match
 * length, max teams per division, how many times a team plays
 * the same team in a season and the days/times the matches occurs
 * 
 * @author Adam Lyon W19023403
 */
class CreateLeagueInfo extends Component {
    constructor(props) {
        super(props)
        this.state = {
            divisionsEnabled: true,

            divisions: 3,
            divisionsUnderline: "white",
            divisionsErrorMessage: null,

            promotionRelegationEnabled: true,

            promotionRelegationPosition: "",
            promotionRelegationPositionUnderline: "white",
            promotionRelegationPositionErrorMessage: null,

            matchLength: "",
            matchLengthUnderline: "white",
            matchLengthErrorMessage: null,

            requestToCreateTeamEnabled: false,

            maxTeams: 2,
            maxTeamsUnderline: "white",
            maxTeamsErrorMessage: null,

            teamsPlay: "",
            teamsPlayUnderline: "white",
            teamsPlayErrorMessage: null,

            divisionData: null,
            timeError: false
        }
    }

    divisionData = (data) => {
        this.setState({ divisionData: data })
    }

    divisionsEnabled = () => {
        if (this.state.divisionsEnabled) { this.setState({ divisions: 1 }) }
        this.setState({ divisionsEnabled: !this.state.divisionsEnabled })
    }

    promotionRelegationEnabled = () => {
        this.setState({ promotionRelegationEnabled: !this.state.promotionRelegationEnabled })
    }

    requestToCreateTeamEnabled = () => {
        this.setState({ requestToCreateTeamEnabled: !this.state.requestToCreateTeamEnabled })
    }

    timeError = (bool) => {
        this.setState({ timeError: bool })
    }

    addDivisions = () => {
        let newData = []
        if (this.state.divisionData !== undefined) {
            const json = this.state.divisionData
            Object.keys(json).forEach(function(key) {
                let test = json[key].map((timeSlot, index) => {
                    return (timeSlot[0] + " " + timeSlot[1])
                })
                newData.push(test)
            });
        }
        
        const divisions = (this.state.divisionsEnabled && Number.isInteger(+this.state.divisions)) ? parseInt(this.state.divisions) : 1
        for (let i = 1; i <= divisions; i++) {

            db
            .collection("Leagues")
            .doc(auth.currentUser.uid)
            .collection("Divisions")
            .doc(i.toString())
            .set({
                times: newData[i-1]
            })
            .then(() => {
                Alert.alert(
                    "League Created!",
                    "You can now manage your league!"
                )
                this.props.navigation.navigate("Profile", {
                    screen: "Home"
                })
            })
            .catch((error) => {
                console.log(error)
            })

        }
    }

    createLeague = () => {
        let canAdd = true
        let divisionsChecked = 0
        if (this.state.divisionData !== null) {
            const json = this.state.divisionData
            const maxTeams = this.state.maxTeams/2
            const divisions = this.state.divisions
            Object.keys(json).forEach(function(key) {
                if (json[key].length !== maxTeams && parseInt(key.replace( /^\D+/g, '')) <= divisions) {
                    canAdd = false
                }
                if (parseInt(key.replace( /^\D+/g, '')) <= divisions) {
                    divisionsChecked++
                } 
            });
        }

        if (!canAdd || divisionsChecked !== this.state.divisions) {
            console.log("Times are not all entered!")
        } else {

            db
            .collection("Leagues")
            .doc(auth.currentUser.uid)
            .set(({
                location: this.props.locationPosition,
                locationName: this.props.location,
                seasonStarted: false,
                divisions: (this.state.divisionsEnabled && Number.isInteger(+this.state.divisions)) ? parseInt(this.state.divisions) : 1,
                relegationPromotion: this.state.promotionRelegationEnabled,
                relegationPromotionPlaces: this.state.promotionRelegationPosition,
                matchLength: this.state.matchLength,
                requestToCreateTeam: this.state.requestToCreateTeamEnabled,
                maxTeams: this.state.maxTeams,
                teamPlays: this.state.teamsPlay,
    
                seasons: 0,
                seasonInProgress: false,
                teamsJoined: 0,
                refereesJoined: 0
            }))
            .then(() => {
                this.addDivisions()
            })
            .catch((error) => {
                console.log(error)
            })
        }
    }

    setDivisionCount = (value) => {
        this.setState({ divisions: value })
    }

    setPromotionRelegationCount = (value) => {
        this.setState({ promotionRelegationPosition: value })
    }

    setMatchLength = (value) => {
        this.setState({ matchLength: value })
    }

    setMaxTeams = (value) => {
        this.setState({ maxTeams: value })
        
    }

    setPlaysAnother = (value) => {
        this.setState({ teamsPlay: value })
    }

    render() {
        let address = ""
        if (this.props.location !== null && this.props.location.length > 0 && this.props.location[0].postalCode !== null) {
            address = (this.props.location[0].street !== null)
                    ? this.props.location[0].street
                    : ""
            address = (this.props.location[0].subregion !== null)
                    ? (address === "")
                    ? this.props.location[0].subregion
                    : address + "\n" + this.props.location[0].subregion
                    : ""
            address = (this.props.location[0].country !== null)
                    ? (address === "")
                    ? this.props.location[0].country
                    : address + "\n" + this.props.location[0].country
                    : ""
        } else {    
            //console.log("Issue with location...")
        }

            return (
                <ScrollView style={{ position: "absolute", width: "80%", backgroundColor: "#21A361", marginLeft: "10%", bottom: 30, borderRadius: 30, height: "80%"}}>
                    <Header color={"white"} title="Create League" marginTop={0} />
                    <Text style={{ textAlign: "center", fontWeight: "bold", fontSize: 18, color: "white" }}>{address}</Text>

                    <View style={{flexDirection: "row", alignItems: "center", marginLeft: "10%"}}>
                        <Text style={{color: "white"}}>Enable Divisions within League</Text>
                        <Switch value={this.state.divisionsEnabled} onValueChange={this.divisionsEnabled} color="#0000FF" />
                        <Button testID="toggleDivision" onPress={this.divisionsEnabled} style={{ display: "none" }}>Test</Button>
                    </View>
                    
                    {this.state.divisionsEnabled ?
                        <View>
                            <DropDown title={"How many divisions?"} options={[2, 3, 4, 5]} default={3} setDropdownValue={this.setDivisionCount} />
                            <View testID="DivisionCount" style={{flexDirection: "row", alignItems: "center", marginLeft: "10%"}}>
                                <Text style={{color: "white"}}>Promotion/Relegation</Text>
                                <Switch value={this.state.promotionRelegationEnabled} onValueChange={this.promotionRelegationEnabled} color="#0000FF" />
                                <Button testID="toggleProRel" onPress={this.promotionRelegationEnabled} style={{ display: "none" }}>Test</Button>
                            </View>
                            {this.state.promotionRelegationEnabled 
                                ? <DropDown title={"Teams to be Promoted/Relegated"} options={[1, 2, 3, 4, 5]} default={2} setDropdownValue={this.setPromotionRelegationCount} />
                                : null
                            }
                        </View>
                        : null   
                    }
                    <DropDown title={"How many minutes per match?"} options={[20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90]} default={50} setDropdownValue={this.setMatchLength} />

                    <View style={{flexDirection: "row", alignItems: "center", marginLeft: "10%"}}>
                        <Text style={{color: "white"}}>Request to Create Team</Text>
                        <Switch value={this.state.requestToCreateTeamEnabled} onValueChange={this.requestToCreateTeamEnabled} color="#0000FF" />
                    </View> 

                    <DropDown title={(this.state.divisionsEnabled) ? "Max Teams per Division" : "Max Teams"} options={[2, 4, 6, 8, 10, 12, 14, 16, 18, 20]} default={8} setDropdownValue={this.setMaxTeams} />

                    <DropDown title={"Times a team plays another"} options={[1, 2, 3, 4 ,5]} default={3} setDropdownValue={this.setPlaysAnother} />
                    
                    <LeagueDays matchLength={this.state.matchLength} timeError={this.timeError} maxTeams={this.state.maxTeams} divisionData={this.divisionData} divisions={(this.state.divisionsEnabled && Number.isInteger(+this.state.divisions)) ? parseInt(this.state.divisions) : 1 } />
      
                    <Button onPress={this.createLeague}>
                        CREATE LEAGUE
                    </Button>

                </ScrollView>
            )    
    }
}

export default CreateLeagueInfo