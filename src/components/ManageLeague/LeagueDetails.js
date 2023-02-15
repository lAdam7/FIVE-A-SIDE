import React, { Component } from "react"
import { ScrollView, View, Text, Switch } from "react-native"
import { Button } from "react-native-paper"

import DropDown from "../Utility/DropDown"
import LeagueDays from "../CreateLeague/LeagueDays"
import { auth, db } from "../Auth/FirebaseInit"

/**
 * Edit league details for if divisions should be enaled, promotion relegation 
 * features if multiple divisions, match length, request to create a team, max teams per
 * division, how many times a team plays another and the selected times
 * 
 * @author Adam Lyon W19023403
 */
class LeagueDetails extends Component {
    constructor(props) {
        super(props)
        this.state = {
            divisionsEnabled: this.props.league.divisions !== 1,

            divisions: this.props.league.divisions,
            divisionsUnderline: "white",
            divisionsErrorMessage: null,

            promotionRelegationEnabled: this.props.league.relegationPromotion,

            promotionRelegationPosition: this.props.league.relegationPromotionPlaces,
            promotionRelegationPositionUnderline: "white",
            promotionRelegationPositionErrorMessage: null,

            matchLength: this.props.league.matchLength,
            matchLengthUnderline: "white",
            matchLengthErrorMessage: null,

            requestToCreateTeamEnabled: this.props.league.requestToCreateTeam,

            maxTeams: this.props.league.maxTeams,
            maxTeamsUnderline: "white",
            maxTeamsErrorMessage: null,

            teamsPlay: this.props.league.teamPlays,
            teamsPlayUnderline: "white",
            teamsPlayErrorMessage: null,

            divisionData: null,
            timeError: false
        }
    }

    /**
     * Get the divisions and the different day/times
     * entered for a match
     */
    componentDidMount() {
        let divData = {}
        db
        .collection("Leagues")
        .doc(auth.currentUser.uid)
        .collection("Divisions")
        .get()
        .then(snapshot => {
            snapshot.docs.map(doc => {
                if (divData["id" + doc.id] === undefined) { // division not added
                    divData["id" + doc.id] = []
                }
                doc.data().times.forEach(element => { // for each time entered get into format required for editing
                    let day = element.substring(0, element.indexOf(" "))
                    let time = element.substring(element.indexOf(" ")+1, element.length)
                    divData["id" + doc.id].push([day, time])
                })
            })
            this.setState({ divisionData: divData })
        })
    }
    /** Times/Day data for the divisions */
    divisionData = (data) => {
        this.setState({ divisionData: data })
    }
    /** Multiple or singular division toggle */
    divisionsEnabled = () => {
        this.setState({ divisionsEnabled: !this.state.divisionsEnabled })
    }
    /** Divisions have promotion and relegation features */
    promotionRelegationEnabled = () => {
        this.setState({ promotionRelegationEnabled: !this.state.promotionRelegationEnabled })
    }
    /** Do you need to request to create a team */
    requestToCreateTeamEnabled = () => {
        this.setState({ requestToCreateTeamEnabled: !this.state.requestToCreateTeamEnabled })
    }
    /** Not enough times selected, depending on maxTeams */
    timeError = (bool) => {
        this.setState({ timeError: bool })
    }

    /**
     * Map the day/time data to the format
     * required for the firestore functionality
     */
    addDivisions = () => {
        let newData = []
        if (this.state.divisionData !== undefined) { // got curent days/times
            const json = this.state.divisionData
            Object.keys(json).forEach(function(key) {
                let test = json[key].map((timeSlot, index) => { // format correctly
                    return (timeSlot[0] + " " + timeSlot[1])
                })
                newData.push(test)
            });
        }
        
        /** Get how many divisions need updating */
        const divisions = (this.state.divisionsEnabled && Number.isInteger(+this.state.divisions)) ? parseInt(this.state.divisions) : 1
        for (let i = 1; i <= divisions; i++) { // for each division update times
            db
            .collection("Leagues")
            .doc(auth.currentUser.uid)
            .collection("Divisions")
            .doc(i.toString())
            .set({
                times: newData[i-1]
            })
            .then(() => {
                // times updated
            })
            .catch((error) => {
                console.log(error)
            })
        }
    }
    /** 
     * How many divisions in league
     * 
     * @param value string Division 
     */
    setDivisionCount = (value) => {
        this.setState({ divisions: value })
    }
    /**
     * How many teams get promoted and relegated between division
     * 
     * @param value integer Places to be promoted/relegated available
     */
    setPromotionRelegationCount = (value) => {
        this.setState({ promotionRelegationPosition: value })
    }
    /**
     * @param value integer How many mins per match
     */
    setMatchLength = (value) => {
        this.setState({ matchLength: value })
    }
    /**
     * @param value integer Max teams per division
     */
    setMaxTeams = (value) => {
        this.setState({ maxTeams: value })
    }
    /**
     * @param value integer How many times a team plays another in a season
     */
    setPlaysAnother = (value) => {
        this.setState({ teamsPlay: value })
    }

    render() {
        /** Modify league details, for viewing league */
        return (
            <ScrollView style={{ width: "80%", backgroundColor: "#21A361", marginLeft: "10%", borderRadius: 30, marginTop: 10}}>
                {
                    (!this.props.showForm)
                        ? 
                            <>
                                <View style={{flexDirection: "row", alignItems: "center", marginLeft: "10%"}}>
                                    <Text style={{color: "white"}}>Enable Divisions within League</Text>
                                    <Switch value={this.state.divisionsEnabled} onValueChange={this.divisionsEnabled} color="#0000FF" />
                                </View>
                
                                { // Multple divisions show promotion relegation options if so
                                    this.state.divisionsEnabled 
                                        ?
                                            <>
                                                <DropDown title={"How many divisions?"} options={[2, 3, 4, 5]} default={this.state.divisions} setDropdownValue={this.setDivisionCount} />
                                                <View style={{flexDirection: "row", alignItems: "center", marginLeft: "10%"}}>
                                                    <Text style={{color: "white"}}>Promotion/Relegation</Text>
                                                    <Switch value={this.state.promotionRelegationEnabled} onValueChange={this.promotionRelegationEnabled} color="#0000FF" />
                                                </View>
                                                {this.state.promotionRelegationEnabled 
                                                    ? <DropDown title={"Teams to be Promoted/Relegated"} options={[1, 2, 3, 4, 5]} default={this.props.league.relegationPromotionPlaces} setDropdownValue={this.setPromotionRelegationCount} />
                                                    : null
                                                }
                                            </>
                                        : null   
                                }
                                <DropDown title={"How many minutes per match?"} options={[20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90]} default={this.props.league.matchLength} setDropdownValue={this.setMatchLength} />

                                <View style={{flexDirection: "row", alignItems: "center", marginLeft: "10%"}}>
                                    <Text style={{color: "white"}}>Request to Create Team</Text>
                                    <Switch value={this.state.requestToCreateTeamEnabled} onValueChange={this.requestToCreateTeamEnabled} color="#0000FF" />
                                </View> 

                                <DropDown title={(this.state.divisionsEnabled) ? "Max Teams per Division" : "Max Teams"} options={[2, 4, 6, 8, 10, 12, 14, 16, 18, 20]} default={this.props.league.maxTeams} setDropdownValue={this.setMaxTeams} />

                                <DropDown title={"Times a team plays another"} options={[1, 2, 3, 4 ,5]} default={this.props.league.teamPlays} setDropdownValue={this.setPlaysAnother} />
                
                            </>
                        : null
            }
            
            <LeagueDays matchLength={this.state.matchLength} timeError={this.timeError} maxTeams={this.state.maxTeams} divisionData={this.divisionData} editingTimes={this.props.editingTimes} startData={this.state.divisionData} divisions={(this.state.divisionsEnabled && Number.isInteger(+this.state.divisions)) ? parseInt(this.state.divisions) : 1 } />
            
            { // If allowed to update show button to update settings
                (!this.props.showForm)
                    ?
                        <Button
                            mode="contained"
                        >
                            UPDATE LEAGUE
                        </Button>
                    : null
            }
            </ScrollView>
        )    
    }
}

export default LeagueDetails