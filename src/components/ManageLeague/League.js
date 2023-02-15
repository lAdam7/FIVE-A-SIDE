import React, { Component } from "react"
import { View, Text, StyleSheet, ActivityIndicator } from "react-native"
import RNDateTimePicker from "@react-native-community/datetimepicker"
import { Button } from "react-native-paper"

import { db, auth } from "../Auth/FirebaseInit"
import LeagueDetails from "./LeagueDetails"

/**
 * Manage league screen start/end season if allowed
 * and modify any league settings if a season isn't
 * currently active
 * 
 * @author Adam Lyon W19023403
 */
class League extends Component {
    constructor(props) {
        super(props)
        this.state = {
            startingSeasonCalendar: false,
            date: new Date(),
            divisions: [],
            editingTimes: false,

            creating: false
        }
    }

    /** Render for editing times UI, toggle */
    editingTimes = () => {
        this.setState({ editingTimes: !this.state.editingTimes })
    }

    /** Starting a season, every division must have an even amount of teams */
    startSeasonEvenTeamCheck = () => {
        let divisionsNeedingTeams = []
        for (var i = 0; i < this.props.teams.length; i++) {
            if (this.props.teams[i].length % 2 !== 0) {
                divisionsNeedingTeams.push(i+1)     
            }
        }
        return divisionsNeedingTeams
    }

    /** Select a date the season starts */
    clickedStartSeason = () => {
        this.setState({ startingSeasonCalendar: true })
    }

    /** 
     * Date entered and start, create the new season document with the startDate
     * ready for the firebase cloud functions to produce the rest
     */
    startSeason = (startDate) => {
        // Find how many seasons have occured
        db
        .collection("Leagues")
        .doc(auth.currentUser.uid)
        .get()
        .then(snapshot => {
            db
            .collection("Leagues")
            .doc(auth.currentUser.uid)
            .collection("Divisions")
            .doc("1")
            .collection("Seasons")
            .doc((parseInt(snapshot.data().seasons)+1).toString())
            .set({
                startDate: startDate.getTime()
            })
            
        })
        this.setState({ creating: true })
    }

    /**
     * Season end pressed, update season in progress
     * ready for cloud functions to finalize the season
     */
    endSeason = () => {
        db
        .collection("Leagues")
        .doc(auth.currentUser.uid)
        .update({
            "seasonInProgress": false
        })
        .then(res => {
            this.props.changeSeasonState(false)
        })
    }
    
    /**
     * Select date from the picker, once selected this method is called with the results
     * 
     * @param event JSON is the event a set if not likely cancel so don't start season
     * @param date integer Timestamp of selected date from calendar
     */
    setDate = (event, date) => {
        if (event.type === "set") {
            this.setState({ date: new Date(date), startingSeasonCalendar: false })
            this.startSeason(new Date(date))
        } else {
            this.setState({ startingSeasonCalendar: false })
        }
    }

    /**
     * Output league address, season status if active or not
     * and the settings set for the league
     */
    render() {
        /** @var address JSON Output address of the locaton of the league */
        let address = ""
        if (this.props.leagueDetails !== null) {
            address = (this.props.leagueDetails.locationName[0].street !== null)
                    ? this.props.leagueDetails.locationName[0].street
                    : ""
            address = (this.props.leagueDetails.locationName[0].subregion !== null)
                    ? (address === "")
                    ? this.props.leagueDetails.locationName[0].subregion
                    : address + "\n" + this.props.leagueDetails.locationName[0].subregion
                    : ""
            address = (this.props.leagueDetails.locationName[0].country !== null)
                    ? (address === "")
                    ? this.props.leagueDetails.locationName[0].country
                    : address + "\n" + this.props.leagueDetails.locationName[0].country
                    : ""
        }

        /**
         * @var teamsEvenCheck array Any divisions that don't have an even amount of teams in it
         * @var maxDate date The max date the user can select on the picker
         */
        const teamsEvenCheck = (this.props.leagueDetails !== null && !this.props.leagueDetails.seasonInProgress) ? this.startSeasonEvenTeamCheck() : null
        const maxDate = new Date()
        maxDate.setFullYear(maxDate.getFullYear() + 1)

        return (
            <View style={{ flex: 1 }}>
                <Text style={{ textAlign: "center", fontWeight: "bold", fontSize: 18, color: "white" }}>{address}</Text>
                { // Once league details got, check if the season has started or ended provide buttons, if can be started and odd teams in any division output to user
                    this.props.leagueDetails !== null && !this.state.editingTimes
                        ?   
                            this.props.leagueDetails.seasonInProgress
                                ?
                                    <Button mode="contained" style={{ borderRadius: 0 }} onPress={this.endSeason}>
                                        END SEASON
                                    </Button>
                                : 
                                    <>
                                        <Button mode="contained" style={{ borderRadius: 0 }} disabled={teamsEvenCheck.length !== 0 || this.props.leagueDetails.teamsJoined === 0 } onPress={this.clickedStartSeason}>
                                            START SEASON
                                        </Button>
                                        {
                                            teamsEvenCheck.length !== 0
                                                ?
                                                    teamsEvenCheck.map((value, index) => {
                                                        return (
                                                            <Text key={index} style={{ textAlign: "center", color: "red", fontWeight: "bold", fontSize: 16 }}>Division {value} Odd Amount of Teams</Text>
                                                        )   
                                                    })
                                                : null
                                        }
                                    </>  
                        : null
                }
                { // Season creating in progress, show activity indicator so user knows something is happening and not allow spam pressing
                    (this.state.creating && this.props.leagueDetails !== null && !this.props.leagueDetails.seasonInProgress)
                    ? 
                        <View>
                            <ActivityIndicator size={100} color={"white"} />
                            <Text style={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: 20 }}>Creating Season...</Text>
                        </View>
                    : null
                    
                }
                { // Selecting date for start of season render to screen
                    this.state.startingSeasonCalendar
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
                { // Output text if season is in progress, that settings can't be changed
                    this.props.leagueDetails !== null && this.props.leagueDetails.seasonInProgress
                    ? <Text style={{ color: "red", textAlign: "center", fontWeight: "bold", fontSize: 14 }}>LEAGUES SETTINGS CAN'T BE CHANGED DURING A SEASON*</Text>
                    : null
                }
                { // Change location of league
                    (!this.state.editingTimes)
                    ?
                        <Button
                        mode="contained"
                        style={{ backgroundColor: "orange" }}
                        labelStyle={{ fontWeight: "bold", fontSize: 18 }}
                        onPress={() => this.props.navigation.navigate("League Location", {
                                league: this.props.leagueDetails
                        })}
                        >
                            CHANGE LOCATION
                        </Button>    
                    : null
                }
                { // Modify league details
                    (this.props.leagueDetails !== null)
                    ? <LeagueDetails editingTimes={this.editingTimes} showForm={this.state.editingTimes} league={this.props.leagueDetails} />   
                    : null
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        padding: 20,
    },
    datePickerStyle: {
        width: 200,
        marginTop: 20,
    },
})

export default League