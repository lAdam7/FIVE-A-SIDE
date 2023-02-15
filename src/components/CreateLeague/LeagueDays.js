import React, { Component } from "react"
import { View, StyleSheet, Text } from "react-native"
import { Button } from "react-native-paper"

import SetLeagueDays from "./SetLeagueDays"

/** Get all the times to populate for the drop-down */
function GetAvailableTimes() {
    var times = [];
    for (let hour = 5; hour < 22; hour++) {
        for (let min = 0; min < 12; min++ ) {
            var minute = (min*5).toString().padStart(2, "0")
            times.push(hour + ":" + minute)
        }
    }
    return times
} 

/** Add the length of a match to the start time, so the match finish time is known */
function addMinutes(time, minsToAdd) {
    function D(J){ return (J<10? '0':'') + J}
    var piece = time.split(':')
    var mins = piece[0]*60 + +piece[1] + minsToAdd
  
    return D(mins%(24*60)/60 | 0) + ':' + D(mins%60)
} 

/**
 * View all the days/times for each league
 * handling itneraction with the component 
 * to update/remove these times
 * 
 * @author Adam Lyon W19023403
 */
class LeagueDays extends Component {
    constructor(props) {
        super(props)
        this.state = {
            divisions: {},
            viewingLeague: false,
            viewingLeagueDivision: null
        }

        this.removeTime = this.removeTime.bind(this)
        this.addTime = this.addTime.bind(this)
    }
    
    componentDidMount() {
        if (this.props.divisions === undefined) {
            this.setState({ divisions: [] })
        }
    }

    /**
     * On update of teams requires
     * more or sometimes less times/days to be
     * selected for each division
     */
    componentDidUpdate(prevProps) {
        if (this.props.divisions !== undefined) {
            if (this.props.maxTeams !== prevProps.maxTeams) {
                const divisions = this.state.divisions // how many divisions
                const maxTeams = this.props.maxTeams // max teams per division
                Object.keys(divisions).forEach(function(key) {
                    if (divisions[key].length > (maxTeams/2)) { // remove any time/dates if too many exist on reduction of max teams
                        divisions[key] = divisions[key].slice(0, maxTeams/2) 
                    }
                })
                this.setState({ divisions: divisions })
            } else if (this.props.startData !== prevProps.startData) {
                this.setState({ divisions: this.props.startData })
            }
        }
        
    }
    
    /**
     * Stop editing times, return to main component /
     * un-render selecting dates/times
     */
    clearDisableTimes = () => {
        this.setState({ viewingLeague: false })
        this.props.divisionData(this.state.divisions)
        if(typeof editingTimes == 'function') { 
            this.props.editingTimes()
        }
    }
    
    /** @param division string division selecting dates/times for */
    setDivisionTimes = (division) => {
        if(typeof editingTimes == 'function') { 
            this.props.editingTimes()
        }
        this.setState({ viewingLeague: true, viewingLeagueDivision: division })         
    }

    /** @param indexRemove integer The day/time to be removed for the selected division remove index clicked */
    removeTime = (indexRemove) => {
        var json = this.state.divisions
        var array = (this.props.divisions !== undefined) ? json[("id") + this.state.viewingLeagueDivision] : json
        array.splice(indexRemove, 1)
        this.setState({ divisions: json })
    }

    /**
     * Add new day/time to the selected division
     * 
     * @param day string Day the match is e.g. Monday
     * @param startTime string Time match starts e.g. '10:15'
     */
    addTime = (day, startTime) => {
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        const times = GetAvailableTimes() // Get times array

        var json = this.state.divisions
        var array = (this.props.divisions !== undefined) ? json[("id") + this.state.viewingLeagueDivision] : json
        if (array === undefined) { // doesn't exist, create day/time json for day/time to be added
            json[("id") + this.state.viewingLeagueDivision] = []
            array = json[("id") + this.state.viewingLeagueDivision]
        }

        array.push([day, startTime]) // add day/time
        array.sort(function(a, b) { // sort the list Monday-Sunday order then Time order
            if (a[0] === b[0]) { // already sorted by day, sort by time now
                return times.indexOf(a[1]) - times.indexOf(b[1]);
            } else { // sort by day
                return days.indexOf(a[0]) - days.indexOf(b[0]);
            }
        });
        this.setState({ divisions: json })
        if (this.props.divisions === undefined) {
            this.props.divisionData(json)
        }
    }

    render() {
        let arrayIterate = (this.props.divisions !== undefined) ? [...Array(this.props.divisions)] : [...Array(1)]
        /**
         * View all league day/times
         * with button to edit using 
         * SetLeagueDays component
         */
        return (
            <>
                { 
                    (this.state.viewingLeague) 
                        ? // Modify selected division day/times
                            <SetLeagueDays 
                                goBack={this.clearDisableTimes} 
                                maxTimes={this.props.maxTeams/2} 
                                matchLength={this.props.matchLength} 
                                divisions={this.state.divisions} 
                                viewingDivision={this.state.viewingLeagueDivision} 
                                addTime={this.addTime} 
                                removeTime={this.removeTime} 
                            /> 
                        : // Show all division with current day/times for each and option to modify
                            <>
                                <Text style={{ color: "white", textAlign: "center", fontSize: 18 }}>{(this.props.divisions !== undefined) ? "Match Times" : "Training Times"}</Text>
                                <View style={[styles.line, { backgroundColor: "white" }]}></View>
                                {
                                    arrayIterate.map((e, i) => // for every division
                                        <View key={i} style={{ paddingVertical: 10 }}>
                                            {
                                                (this.props.divisions !== undefined)
                                                    ? <Text style={{ color: "white", textAlign: "center", fontSize: 17, fontWeight: "bold" }}>Division - {i+1}</Text>
                                                    : <Text style={{ color: "white", textAlign: "center", fontSize: 17, fontWeight: "bold" }}>Add Times</Text>
                                            }
                                            
                                            <View style={[styles.line2, { backgroundColor: "white" }]}></View>
                                            {
                                                (this.props.divisions !== undefined)
                                                    ?
                                                        <Text style={{ color: "red", textAlign: "center", fontWeight: "bold" }}>
                                                            {(this.state.divisions["id" + (i+1)] === undefined ? 0 : this.state.divisions["id" + (i+1)].length)}/{this.props.maxTeams/2} Times Selected
                                                        </Text>
                                                    : null
                                            }
                                            
                                            {
                                                (this.props.divisions !== undefined && this.state.divisions["id" + (i+1)] !== undefined)
                                                ? 
                                                (
                                                    this.state.divisions["id" + (i+1)].map((e, i) => 
                                                        <Text style={{ color: "white", textAlign: "center" }} key={(i+1) + "" + i}>{e[0]}: {e[1]} - {addMinutes(e[1], this.props.matchLength)}</Text>
                                                    )
                                                )
                                                : (this.props.divisionData !== null && this.props.divisions === undefined && Array.isArray(this.state.divisions))
                                                    ?
                                                        this.state.divisions.map((e, i) => 
                                                            <Text style={{ color: "white", textAlign: "center" }} key={(i+1) + "" + i}>{e[0]}: {e[1]}</Text>
                                                        )
                                                    : null
                                            }
                                            {
                                                (this.props.divisions !== undefined)
                                                    ?
                                                        <Button onPress={() => {this.setDivisionTimes(i+1)}}>
                                                            SET DIVISION {i+1} TIMES
                                                        </Button>
                                                    :
                                                        <Button onPress={this.setDivisionTimes}>
                                                            ADD TRAINING TIMES
                                                        </Button>
                                            }
                                            
                                        </View>
                                    )
                                }
                            </>
                }
            </>
        )
    }
}

const styles = StyleSheet.create({
    line: {
        width: "40%",
        marginLeft: "auto",
        marginRight: "auto",
        height: 2,
        borderRadius: 100
    },
    line2: {
        width: "60%",
        marginLeft: "auto",
        marginRight: "auto",
        height: .5,
        borderRadius: 100
    }
})

export default LeagueDays