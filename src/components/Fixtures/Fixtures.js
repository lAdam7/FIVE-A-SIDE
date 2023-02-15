import React, { Component } from "react"
import { View, StyleSheet, StatusBar, ScrollView, ActivityIndicator, Text } from "react-native"

import { db, auth } from "../Auth/FirebaseInit"
import MatchBrief from "../MyTeams/MatchBrief"
import TrainingBrief from "../MyTeams/Team/Training/TrainingBrief"
import Header from "../Utility/Header"

/**
 * Show all fixtures associated with the 
 * logged-in user, allowing navigation to
 * the matches if selected
 * 
 * @author Adam Lyon W19023403
 */
class Fixtures extends Component {
    constructor(props) {
        super(props)
        this.state = {
            fixtures: [],
            training: [],
            indexItem: 0,

            user: null
        }
    }

    /** On render, check navigation is not undefined (prevents error in test where navigation is null) on every view of screen update fixtures */
    componentDidMount() {
        if (this.props.navigation !== undefined) {
            this.navigationSubscription = this.props.navigation.addListener("focus", this.getMatches);
            this.setState({ user: auth.currentUser.uid })
        }
    }

    /** Get all matches associated with the logged-in user and find closest match to put scrollview to it */
    getMatches = () => {
        if (this.state.user !== auth.currentUser.uid) {
            this.setState({ fixtures: [], training: [] })
        }
        
        let foundElement = false
        let index = 0

        db
        .collectionGroup("Members")
        .where("uid", "==", auth.currentUser.uid)
        .get()
        .then(snapshot => {
            snapshot.docs.map(doc => {
                db
                .collectionGroup("TrainingMatches")
                .where("teams", "array-contains", (doc.ref.parent.parent.parent.parent.parent.parent.id + "-" + doc.ref.parent.parent.id))
                .get()
                .then(trainingSnapshot => {
                    let training = []
                    trainingSnapshot.docs.map(docTraining => {
                        const id = docTraining.id
                        const data = docTraining.data()
                        const teamIn = doc.ref.parent.parent.id
                        training.push({ id, teamIn, ...data })
                    })
                    let allFixtures = this.state.fixtures
                    allFixtures = allFixtures.filter(match => match.match !== undefined)
                    this.setState({ fixtures: [...allFixtures, ...training] })
                })

                db
                .collectionGroup("Matches")
                .where("teams", "array-contains", doc.ref.parent.parent.id)
                .where("start", ">", 1)
                .get()
                .then(matchesSnapshot => {
                    let matchData = []
                    matchesSnapshot.docs.map(doc => {
                        const id = doc.id
                        const data = doc.data()
                        
                        if (!foundElement && !doc.data().finished) {
                            foundElement = true
                            this.setState({ indexItem: index-1 })
                        }
                        index++
                        matchData.push({id, ...data})
                    })
                    let allFixtures = this.state.fixtures
                    allFixtures = allFixtures.filter(match => match.match === undefined)
                    this.setState({ fixtures: [...allFixtures, ...matchData] })
                    //this.setState({ fixtures: [...this.state.fixtures, ...matchData] })
                })
            })
        })
    }

    render() {
        let fixtures = this.state.fixtures
        fixtures.sort(function(a, b) {
            return a.start - b.start;
        })
        /*
        if (this.state.fixtures !== null && this.state.fixtures.length > 0) {
            fixtures = this.state.fixtures
        }
        if (this.state.training.length > 0) {
            if (fixtures === null) {
                fixtures = this.state.training
            } else if (this.state.fixtures !== null) {
               this.state.training.forEach(element => {
                   let index = fixtures.findIndex(x => x.start > element.start)
                   fixtures.splice(index, 0, element)
               })
            }
        }*/

        /**
         * Render fixtures screen and all the fixtures
         * relevent to the user
         */
        return (
            <View style={styles.container}>
                <Header color={"white"} title={"FIXTURES"} marginTop={StatusBar.currentHeight+5} />
                { // if fixtures have been returned from the firestore
                    fixtures !== null && fixtures.length > 0
                        ?
                            <ScrollView style={{ width: "80%", marginLeft: "10%", marginBottom: 10 }}
                                ref={ref => {this.scrollView = ref}}
                                onContentSizeChange={() => this.scrollView.scrollTo({y: (this.state.indexItem * 120)})}
                            >
                            { // iteratre every fixture and put into a MatchBrief component, once selected navigation to that match happens
                                fixtures.map((match, index) => { 
                                    return (
                                        (match.match !== undefined)
                                            ?
                                                <MatchBrief 
                                                    key={index} 
                                                    navigation={this.props.navigation} 
                                                    leagueID={match.league} 
                                                    division={match.division}
                                                    finished={match.finished} 
                                                    start={match.start}
                                                    live={match.live} 
                                                    matchID={match.id} 
                                                    season={match.season} 
                                                    matchIndex={match.match} 
                                                    matchSeason={99} 
                                                    matchTimestamp={match.start} 
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
                                                    referee={false}
													fromFixtures={false}
													userIn={this.props.userIn}
                                                />
                                            :
                                                <TrainingBrief 
                                                    key={index}
                                                    navigation={this.props.navigation} 
                                                    training={match}
                                                    userIn={true}
                                                />
                                    )
                                    
                                    
                                })
                            }
                            </ScrollView>
                        : (this.state.fixtures !== null && this.state.fixtures.length === 0)
                            ? <Text style={{ color: "white", textAlign: "center", fontSize: 18, marginLeft: "auto", marginRight: "auto", marginTop: 45 }}>You have no upcoming fixtures!</Text>
                            : <ActivityIndicator style={{ flex: 1 }} size={100} color={"white"} />
                            
                }
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

export default Fixtures