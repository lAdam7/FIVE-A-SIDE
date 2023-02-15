import React, { Component } from "react"
import { View, StyleSheet, StatusBar, Text, ScrollView, TouchableOpacity, BackHandler } from "react-native"
import { connect } from "react-redux"

import Header from "../Utility/Header"
import DropDown from "../Utility/DropDown"
import Kit from "../Utility/Kit"
import { KIT_STYLE } from "./KitData"
import { db } from "../Auth/FirebaseInit"

/**
 * Screen to view all teams and the 
 * division they're in, used for showing
 * non-logged in users more data
 * 
 * @author Adam Lyon W19023403
 */
class ViewDivisions extends Component {
    constructor(props) {
        super(props)
        this.state = {
            division: 1,
            divisions: null
        }
    }

    /** Override back button press, force render of profile screen */
    handleBackPress = () => {
        if (this.props.authentication) {
            this.props.navigation.navigate("HomeTeam", {
                screen: "HomeTeam"
            })
        } else {
            this.props.navigation.navigate("Find Teams")
        }
		return true
	}

    /**
     * On screen render, get all division and the teams
     * associated for each divison, putting into one array
     */
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress) // override back pressed

        let divisions = []
        for (let i = 1; i <= this.props.route.params.league.divisions; i++) {
            divisions.push([])

            db
            .collection("Leagues")
            .doc(this.props.route.params.league.id)
            .collection("Divisions")
            .doc((i).toString())
            .collection("Teams")
            .get()
            .then(snapshot => {
                let team = snapshot.docs.map(doc => {
                    return { ...doc.data(), teamID: doc.id }
                })
                divisions[i-1] = team
                this.setState({ divisions: divisions })
            })
        }
    }
    
    /** @param value string Changing the division and the teams to show to user */
    setDivision = (value) => {
        this.setState({ division: value })
    }

    /** Rendering a list for the divisions, to populate the dropdown */
    getDivisionArray = () => {
        let divs = []
        for (var i=1; i<=this.props.route.params.league.divisions; i++) {
            divs.push(i)
        }
        return divs
    }

    /** Team selected, open info on team to view matches, players and stats */
    showTeam = (team) => {
        this.props.navigation.navigate("Team", {
			team: {
                ...team,
                division: this.state.division.toString(),
                leagueID: this.props.route.params.league.id,
                season: this.props.route.params.league.seasons,
                tName: team.name,
                tAbbreviation: team.abbreviation,
                kitStyle: team.kit
            }
		})
    }

    render() {
        const month = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        const ordinals = ["", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"]
        
        /**
         * @param divisions array Divisions in array format to populate drop-down
         * @param league JSON The selected league information, used to reduce code needed in the return below
         */
        let divisions = this.getDivisionArray()
        let league = this.props.route.params.league
        return (
            <View style={styles.container}>
                <Header color={"white"} title={(league.divisions === 1) ? "VIEW DIVISION" : "VIEW DIVISIONS"} marginTop={StatusBar.currentHeight+5} />
                {
                    // Dropdown not required if only one division
                    (league.divisions === 1)
                        ? null
                        : <DropDown title={"Division"} options={divisions} default={1} setDropdownValue={this.setDivision} />
                }
                
                <ScrollView style={{ width: "90%", marginLeft: "5%", marginBottom: 10 }}>
                    {
                        (this.state.divisions === null)
                            ? null
                            : (this.state.divisions[this.state.division-1].length === 0)
                                ? <Text style={{ color: "white", textAlign: "center", fontSize: 18, marginLeft: "auto", marginRight: "auto", marginTop: 45 }}>No teams in this division!</Text>
                                :
                                <>
                                    { // for selected division, show all the teams associated  
                                        this.state.divisions[this.state.division-1].map((team, index) => {
                                            return (
                                                <View key={index}>
                                                    <TouchableOpacity key={index} onPress={() => this.showTeam(team)} activeOpacity={.9} style={{ width: "80%", marginLeft: "10%", margin: 5, paddingVertical: 5, flexDirection: "row", justifyContent: "center"}}>
                                                        <View style={styles.kitContainer}>
                                                            <Kit
                                                                kitLeftLeft={KIT_STYLE[team.kit].kitLeftLeft}
                                                                kitLeft={KIT_STYLE[team.kit].kitLeft}
                                                                kitMiddle={KIT_STYLE[team.kit].kitMiddle}
                                                                kitRight={KIT_STYLE[team.kit].kitRight}
                                                                kitRightRight={KIT_STYLE[team.kit].kitRightRight}
                                                                numberColor={KIT_STYLE[team.kit].numberColor}
                                                                width={16}
                                                                height={90}
                                                                fontSize={46}
                                                            />
                                                        </View>
                                                        <View style={{ width: "70%", height: "100%" }}>
                                                            <Text style={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: 18 }}>{team.name}</Text>
                                                            <View style={{ backgroundColor: "white", width: "80%", marginLeft: "auto", marginRight: "auto", height: 1, borderRadius: 100 }}></View>
                                                            <View>
                                                                <Text style={{ color: "white", fontSize: 16, opacity: .9, textAlign: "center", marginTop: 15 }}>
                                                                    {team.standingPosition !== 0 ? ("#" + team.standingPosition + " in Division") : ""}
                                                                </Text>
                                                                {
                                                                    team.nextEvent !== 0
                                                                        ? 	
                                                                            <View style={{ flexDirection: "row", marginTop: 20 }}>
                                                                                <View style={{ flex: .7 }}></View>
                                                                                <Text style={{ color: "white" }}>
                                                                                    NEXT MATCH: {new Date(team.nextEvent).getDay()}
                                                                                </Text>
                                                                                <Text style={{ color: "white", fontSize: 10 }}>
                                                                                    {ordinals[new Date(team.nextEvent).getDay()]}
                                                                                </Text>
                                                                                <Text style={{ color: "white" }}>
                                                                                    {" " + month[new Date(team.nextEvent).getMonth()].toUpperCase().substring(0, 3)}
                                                                                </Text>
                                                                            </View>
                                                                        :	
                                                                            <Text style={{ textAlign: "right", color: "red", fontSize: 15, marginTop: 20 }}>
                                                                                NO MATCHES SCHEDULED
                                                                            </Text>
                                                                }
                                                            </View>
                                                        </View>
                                                    </TouchableOpacity>
                                                    <View style={{ backgroundColor: "white", width: "80%", marginLeft: "auto", marginRight: "auto", height: 1, borderRadius: 100 }}></View>
                                                </View>
                                            )
                                        })
                                    }
                                </>
                    }              
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#21A361",
		flex: 1
	}
})

/** Get current authentication state */
const mapStateToProps = (state) => {
	return {
		authentication: state.authenticateReducer.logged
	}
}

export default connect(mapStateToProps) (ViewDivisions)