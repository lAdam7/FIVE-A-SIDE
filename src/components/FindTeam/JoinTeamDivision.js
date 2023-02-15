import React, { Component } from "react"
import { ScrollView, Text, TouchableOpacity } from "react-native"

import JoinTeam from './JoinTeam';
import { db } from "../Auth/FirebaseInit"

/**
 * Get all the divisions and team information for
 * every division within league, select division
 * to then join a team within that division
 * 
 * @author Adam Lyon W19023403
 */
class JoinTeamDivision extends Component {
    constructor(props) {
        super(props)
        this.state = {
            divisions: [],
            selectedDivision: null
        }
    }

    /**
     * On screen render, get all divisions within league
     * and the teams associated with each division nesting
     * in one array
     */
    componentDidMount() {
        db
        .collection("Leagues")
        .doc(this.props.leagueID)
        .collection("Divisions")
        .get()
        .then(snapshot => {
            let divisions = {}
            snapshot.docs.map(doc => {
                const divisionID = doc.id
                divisions[divisionID] = []

                db
                .collection("Leagues")
                .doc(this.props.leagueID)
                .collection("Divisions")
                .doc(divisionID)
                .collection("Teams")
                .get()
                .then(snapshotTeams => {
                    snapshotTeams.docs.map(docTeams => {
                        const id = docTeams.id
                        divisions[divisionID].push({...docTeams.data(), id})
                    })
                    
                    this.setState({ divisions: divisions })
                    
                    if (Object.keys(divisions).length === 1) {
                        this.setState({ selectedDivision: 1 })
                    }
                })
            })   
        })
    }

    render() {
        /** If division not selected, show the buttons for each division, once selected render the JoinTeam component */
        return (
            <ScrollView style={{ padding: 20, position: "absolute", backgroundColor: "red", width: "80%", bottom: 60, marginLeft: "10%", borderRadius: 15, backgroundColor: "#21A361", minHeight: 400}}>
                {
                    (this.state.selectedDivision === null) // not selected a division yet
                        ?
                            Object.keys(this.state.divisions).map((key) => 
                                <TouchableOpacity key={key} onPress={() => this.setState({ selectedDivision: key })} style={{ borderWidth: .75, borderRadius: 30, width: "80%", marginLeft: "10%", borderColor: "white", marginBottom: 15 }} activeOpacity={1}>
                                    <Text style={{ color: "white", fontWeight: "bold", textAlign: "center", fontSize: 20 }}>Division {key}</Text>
                                    <Text style={{ fontWeight: "bold", color: (this.state.divisions[key].length === this.props.maxTeams) ? "red" : "white", textAlign: "center", padding: 4 }}>Teams: {this.state.divisions[key].length}/{this.props.maxTeams}</Text>
                                </TouchableOpacity>
                            ) 
                        : // division selected, show the teams within that
                            <JoinTeam goBack={this.props.goBack} navigation={this.props.navigation} teams={this.state.divisions[this.state.selectedDivision]} division={this.state.selectedDivision} leagueID={this.props.leagueID} />
                }
            </ScrollView>
        )
    }
}

export default JoinTeamDivision