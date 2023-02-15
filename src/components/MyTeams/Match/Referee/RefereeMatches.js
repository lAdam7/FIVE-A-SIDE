import React, { Component } from "react"
import { ScrollView, View, Text, StyleSheet, StatusBar } from "react-native"

import Header from "../../../Utility/Header"
import { db } from "../../../Auth/FirebaseInit"
import MatchBrief from "../../MatchBrief"

/**
 * Show all the live and upcoming matches the
 * referee can manage for the selected league
 * 
 * @author Adam Lyon W19023403
 */
class RefereeMatches extends Component {
    constructor(props) {
        super(props)
        this.state = {
            matches: [],
            leagueID: null
        }
    }

    /** On render get all matches the referee can ref within the league */
    componentDidMount() {
        db
		.collectionGroup("Matches")
        .where("league", "==", this.props.route.params.leagueID) // same league
		.where("finished", "==", false) // not finished yet
        .orderBy("start") // sort
		.get()
        .then((snapshot) => {
            let matchData = snapshot.docs.map(doc => {
                const id = doc.id
                const data = doc.data()
                const season = doc.ref.parent.parent.id
                
                return {id, season, ...data}
            })
            
            this.setState({ matches: matchData })
            //snapshot.forEach((doc) => {
                /*
                db.collection("Leagues").doc(this.props.route.params.leagueID).collection("Divisions").doc(doc.ref.parent.parent.parent.parent.id).collection("Teams").doc(doc.data().teamA)
                .get()
                .then(teamASnapshot => {
                    db.collection("Leagues").doc(this.props.route.params.leagueID).collection("Divisions").doc(doc.ref.parent.parent.parent.parent.id).collection("Teams").doc(doc.data().teamB)
                    .get()
                    .then(teamBSnapshot => {
                        this.setState({ matches: [...this.state.matches, { teamA: teamASnapshot.data(), teamB: teamBSnapshot.data(), match: doc.data(), matchID: doc.id, season: doc.ref.parent.parent.id, division: doc.ref.parent.parent.parent.parent.id }]})
                    })
                })*/
            //})
        })
        .catch((error) => {
            console.log(error)
        })
        this.setState({ leagueID: this.props.route.params.leagueID })
    }

    render() {
        /** @var address string Create the address for the league getting matches for  */
        let address = ""
			address = (this.props.route.params.location.street !== null)
						? this.props.route.params.location.street
						: ""
			address = (this.props.route.params.location.subregion !== null)
						? (address === "")
						? this.props.route.params.location.subregion
						: address + "\n" + this.props.route.params.location.subregion
						: ""
			address = (this.props.route.params.location.country !== null)
						? (address === "")
						? this.props.route.params.location.country
						: address + "\n" + this.props.route.params.location.country
						: ""
       
        /** @var matches component Iterate all the ref matches and put into a brief summary to be selected */
        let matches = this.state.matches.map((match, index) => {
            return (
                <MatchBrief 
                    key={index} 
                    navigation={this.props.navigation} 
                    leagueID={this.props.route.params.leagueID} 
                    finished={match.finished} 
                    live={match.live} 
                    start={match.start}
                    matchID={match.id} 
                    season={match.season}  
                    division={match.division}
                    matchIndex={match.match}  
                    matchTimestamp={match.start}  
                    matchLength={this.props.route.params.matchLength}
                    team={{ season: match.season }}
                    teamA={{
                        id: match.teamA, 
                        score: match.teamAScore, 
                        abbreviation: match.teamAAbbreviation, 
                        name: match.teamAName, 
                        kit: match.teamAKit
                    }} 
                    teamB={{
                        id: match.teamB, 
                        score: match.teamBScore, 
                        abbreviation: match.teamBAbbreviation, 
                        name: match.teamBName, 
                        kit: match.teamBKit
                    }} 
                    userIn={false}
                    referee={true}
                    fromFixtures={false}
                />
            )
        })

        return (
            <View style={styles.container}>
				<Header color={"white"} title={"REFEREE MATCHES"} marginTop={StatusBar.currentHeight + 5} />
                <Text style={{ color: "white", textAlign: "center", width: "100%", fontSize: 18 }}>{address}</Text>
                <ScrollView style={{ width: "80%", marginTop: 5, marginLeft: "10%" }}>
                    {matches}
                </ScrollView>
			</View>
        )
    }
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#21A361",
		flex: 1,
		justifyContent: "flex-start",
		paddingBottom: 35
	}
})

export default RefereeMatches