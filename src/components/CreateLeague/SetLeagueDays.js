import React, { Component } from "react"
import { View, StyleSheet, Text } from "react-native"
import { Button } from "react-native-paper"

import DropDown from "../Utility/DropDown"

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
  
    return D(mins%(24*60)/60 | 0) + ':' + D(mins%60); 
} 

/**
 * Enter day/time in dropdowns, remove any
 * current date/time for the selected division
 * 
 * @author Adam Lyon W19023403
 */
class SetLeagueDays extends Component {
    constructor(props) {
        super(props)
        this.state = {
            openDay: false,
            valueDay: null,
            itemsDay: [{label: 'Monday', value: 'Monday'}, {label: 'Tuesday', value: 'Tuesday'}, {label: 'Wednesday', value: 'Wednesday'}, {label: 'Thursday', value: 'Thursday'}, {label: 'Friday', value: 'Friday'}, {label: 'Saturday', value: 'Saturday'}, {label: 'Sunday', value: 'Sunday'}],
            
            openTime: false,
            valueTime: null,
            itemsTime: GetAvailableTimes()
        }

        this.setValueDay = this.setValueDay.bind(this)
        this.setOpenDay = this.setOpenDay.bind(this)
        this.setItemsDay = this.setItemsDay.bind(this)

        this.setValueTime = this.setValueTime.bind(this)
        this.setOpenTime = this.setOpenTime.bind(this)
        this.setItemsTime = this.setItemsTime.bind(this)
    }

    /** Selecting day drop-down */
    setOpenDay(open) {
        this.setState({ openDay: open })
    }
    /** New value selected for day */
    setValueDay(callback) {
        this.setState(state => ({
            valueDay: callback(state.valueDay)
        }))
    }
    /** All days to populate the drop-down */
    setItemsDay(callback) {
        this.setState(state => ({
            itemsDay: callback(state.itemsDay)
        }))
    }

    /** Selecting time drop-down */
    setOpenTime(open) {
        this.setState({
            openTime: open
        })
    }
    /** New value selected for time */
    setValueTime(callback) {
        this.setState(state => ({
            valueTime: callback(state.valueTime)
        }))
    }
    /** All times to populate the drop-down */
    setItemsTime(callback) {
        this.setState(state => ({
            itemsTime: callback(state.itemsTime)
        }))
    }

    /** Add new day/time send to parent component (LeagueDays) */
    addDayTime = () => {
        this.props.addTime(this.state.valueDay, this.state.valueTime)
    }
    /** Setting of day */
    setDay = (value) => {
        this.setState({ valueDay: value })
    }
    /** Setting of time */
    setTime = (value) => {
        this.setState({ valueTime: value })
    }

    render() {
        const { itemsTime } = this.state;
        let addedTimes = (this.props.divisions[("id" + this.props.viewingDivision)] === undefined)
            ? this.props.divisions
            : this.props.divisions[("id" + this.props.viewingDivision)]

        /** 
         * Setting league days for selected division
         */
        return (
            <View style={styles.container} >
                <Text style={{ color: "white", textAlign: "center", fontSize: 24, fontWeight: "bold" }}>Current Times</Text>
                

                <DropDown 
                    title={"Select a day"} 
                    options={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]} 
                    default={"Monday"} 
                    setDropdownValue={this.setDay} 
                />

                <DropDown 
                    title={"Select starting time"} 
                    options={itemsTime} 
                    default={"12:30"} 
                    setDropdownValue={this.setTime} 
                />
 
                <Button onPress={this.addDayTime} disabled={(this.props.divisions !== undefined && this.props.viewingDivision !== undefined && this.props.divisions[("id" + this.props.viewingDivision)] !== undefined) ? this.props.divisions[("id" + this.props.viewingDivision)].length >= this.props.maxTimes : false}>
                    ADD
                </Button>
                <Button onPress={this.props.goBack}>
                    BACK
                </Button>
                { // Can't enter anymore times
                    (this.props.divisions !== undefined && this.props.divisions[("id" + this.props.viewingDivision)] !== undefined && this.props.divisions[("id" + this.props.viewingDivision)].length >= this.props.maxTimes)
                        ? <Text style={{ textAlign: "center", color: "red", marginTop: 5, fontWeight: "bold" }}>MAX TIMES ENTERED</Text>
                        : null
                }
                {  
                    (this.props.divisions !== undefined && this.props.viewingDivision !== undefined && this.props.divisions[("id") + this.props.viewingDivision] )
                        ?
                            this.props.divisions[("id" + this.props.viewingDivision)].map((e, i) => // All day/times for selected division press to remove
                                <Button
                                    key={i}
                                    mode='contained'
                                    style={{ marginVertical: 5 }}
                                    icon={require("../../assets/images/icons/delete.png")}
                                    uppercase={true}
                                    onPress={() => { this.props.removeTime(i) }}
                                >
                                    {e[0]}: {e[1]}-{addMinutes(e[1], this.props.matchLength)}
                                </Button>
                            )
                        : (Array.isArray(addedTimes))
                            ?
                                addedTimes.map((e, i) => // All day/times for selected division press to remove
                                    <Button
                                        key={i}
                                        mode='contained'
                                        style={{ marginVertical: 5 }}
                                        icon={require("../../assets/images/icons/delete.png")}
                                        uppercase={true}
                                        onPress={() => { this.props.removeTime(i) }}
                                    >
                                        {e[0]}: {e[1]}
                                    </Button>
                                )
                            : null
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#21A361",
        width: "100%",
        height: "100%",
        //position: "absolute",
        zIndex: 500
    }
})

export default SetLeagueDays