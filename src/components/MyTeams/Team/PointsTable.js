import React, { Component } from "react"
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator} from "react-native"
import { Table, Row } from "react-native-table-component"

import Header from "../../Utility/Header"
import { db } from "../../Auth/FirebaseInit"

/**
 * Display the points table for the active/latest season,
 * clicking the team navigates to that teams page and
 * can additionally view the teams current form
 * 
 * @author Adam Lyon W19023403
 */
class PointsTable extends Component {
    constructor(props) {
        super(props)
        this.state = {
            tableHead: ["", "Team", "MP", "W", "D", "L", "PTS", "GD", "LAST 5"],
            widthArr: [35, 175, 35, 35, 35, 35, 50, 35, 125],

            loading: false
        }
    }

    /**
     * Pressed on team, load the data needed to 
     * view the team page then navigate to it
     * 
     * @param teamID string Team ID for team to view
     */
    viewTeam = (teamID) => {
        this.setState({ loading: true })
        db
        .collection("Leagues")
        .doc(this.props.leagueID)
        .collection("Divisions")
        .doc(this.props.division)
        .collection("Teams")
        .doc(teamID)
        .get()
        .then(snapshot => {
            this.setState({ loading: false })
            this.props.navigation.navigate("Team", {
                team: {
                    division: this.props.division,
                    leagueID: this.props.leagueID,
                    kitStyle: snapshot.data().kit,
                    nextEvent: snapshot.data().nextEvent,
                    number: 99,
                    season: this.props.season,
                    standingPosition: snapshot.data().standingPosition,
                    tAbbreviation: snapshot.data().abbreviation,
                    tName: snapshot.data().name,
                    teamID: teamID
                }
		    })
        })
    }

    render() {
        /** Sort teams into points order */
        this.props.table.sort((a, b) => a.pts > b.pts ? -1 : 1)
        /**
         * Show correct icon depending on match result:
         * N = Blank/Not occured
         * W = Win
         * D = Draw
         * L = Loss
         * 
         * @param result string match result
         */
        const getIcon = (result) => (
            (result === "N")
            ?   <View>
                    <Image style={{ width: 24, height: 24, zIndex: 5 }} tintColor="black" source={require("../../../assets/images/icons/progress/alpha-p-circle.png")} />
                    <View style={{ width: 18, height: 18, marginLeft: 3, marginTop: 3, backgroundColor: "transparent", position: "absolute", borderRadius: 12 }}></View>
                </View>
            :   (result === "W")
            ?   <View>
                    <Image style={{ width: 24, height: 24, zIndex: 5 }} tintColor="green" source={require("../../../assets/images/icons/progress/alpha-w-circle.png")} />
                    <View style={{ width: 18, height: 18, marginLeft: 3, marginTop: 3, backgroundColor: "white", position: "absolute", borderRadius: 12 }}></View>
                </View>
            : (result === "D")
            ?   <View>
                    <Image style={{ width: 24, height: 24, zIndex: 5 }} tintColor="orange" source={require("../../../assets/images/icons/progress/alpha-d-circle.png")} />
                    <View style={{ width: 18, height: 18, marginLeft: 3, marginTop: 3, backgroundColor: "white", position: "absolute", borderRadius: 12 }}></View>
                </View>
            : (result === "L")
            ?   <View>
                    <Image style={{ width: 24, height: 24, zIndex: 5 }} tintColor="red" source={require("../../../assets/images/icons/progress/alpha-l-circle.png")} />
                    <View style={{ width: 18, height: 18, marginLeft: 3, marginTop: 3, backgroundColor: "white", position: "absolute", borderRadius: 12 }}></View>
                </View>
            : null
        )

        /**
         * @param matchHistory component Teams last 5 matche history
         */
        const teamHistory = (matchHistory) => (
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
               { getIcon(matchHistory[0]) }
               { getIcon(matchHistory[1]) }
               { getIcon(matchHistory[2]) }
               { getIcon(matchHistory[3]) }
               { getIcon(matchHistory[4]) }
            </View>
        )
        
        /** Render points componenet with every team in the division and their points / position for current season */
        return (
            <View>
                <Header title={(!this.state.loading) ? "Season " + this.props.season : ""} color={"white"} marginTop={0} showUnderline={false} />
                    {
                        (this.state.loading)
                            ?  // Still getting data
                                <ActivityIndicator size={100} color={"white"} />  
                            : (this.props.table.length === 0)
                                ? <Text style={{ color: "white", textAlign: "center", fontSize: 18, marginLeft: "auto", marginRight: "auto", marginTop: 45 }}>No current or past season!</Text>
                                :
                                <ScrollView horizontal={true}>
                                    <View>
                                        <Table>
                                            <Row data={this.state.tableHead} widthArr={this.state.widthArr} style={styles.header} textStyle={styles.textAppear}/>
                                        </Table>
                                        <ScrollView style={styles.dataWrapper}>
                                            <Table>
                                                {
                                                    this.props.table.map((data, index) => { // For every team get there standing
                                                        return (
                                                            <Row
                                                                key={index}
                                                                data={ // custom component for teamHistory and pressing team for team loading event
                                                                    ["#" + (index+1), 
                                                                    <TouchableOpacity onPress={() => this.viewTeam(data.id)} activeOpacity={1}>
                                                                        <Text style={{ color: "white", fontWeight: "bold", fontSize: 17 }}>{data.teamName}</Text>
                                                                    </TouchableOpacity>,
                                                                    data.played, data.wins, data.draws, data.losses, data.pts, data.gd, teamHistory(data.last5)]
                                                                }
                                                                widthArr={this.state.widthArr}
                                                                style={[ index%2 && {backgroundColor: '#086134'}]}
                                                                textStyle={styles.textAppear}
                                                            />
                                                        )
                                                    })
                                                }
                                            </Table>
                                        </ScrollView>
                                    </View>
                                </ScrollView>
                    }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 16, 
        paddingTop: 30 
    },
    header: { 
        height: 40, 
        backgroundColor: "#086134" 
    },
    textAppear: { 
        textAlign: 'center', 
        fontWeight: '100', 
        color: "white" 
    },
    dataWrapper: { 
        marginTop: -1 
    }
})

export default PointsTable