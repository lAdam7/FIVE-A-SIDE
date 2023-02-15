import React, { Component } from "react"
import { ScrollView, View, Text, StyleSheet, Image, ActivityIndicator } from "react-native"

import { db } from "../../Auth/FirebaseInit"
import MatchBrief from "../MatchBrief"
import TrainingBrief from "./Training/TrainingBrief"

/**
 * Overview component showing team abbreviation,
 * position in current seasons table and win
 * percentage for the season. Display of all upcoming
 * matches for the team
 * 
 * @author Adam Lyon W19023403
 */
class Overview extends Component {
    constructor(props) {
		super(props)
		this.state = {
			teams: [],
			indexItem: 0,
			loading: true
		}
	}

	/** Get match briefs on render */
    componentDidMount() {
		this.getMatchBriefs()
	}

	/** Get all matches that the team currently has upcoming */
	getMatchBriefs() {
		let foundElement = false
		let index = 0

		db
		.collectionGroup("Matches")
		.where("league", "==", this.props.team.leagueID)
		.where("teams", "array-contains", this.props.team.teamID)
		.orderBy("start")
		.get()
		.then(matchSnapshot => {
			let matches = matchSnapshot.docs.map(doc => {
				const id = doc.id
				const data = doc.data()

				if (!foundElement && !doc.data().finished) {
					foundElement = true
					this.setState({ indexItem: index-1 })
				}
				index++
				return {id, ...data}
			})

			this.setState({ teams: matches, loading: false })

			db
			.collectionGroup("TrainingMatches")
			.where("teams", "array-contains", (this.props.team.leagueID + "-" + this.props.team.teamID))
			.get()
			.then(trainingSnapshot => {
				let training = trainingSnapshot.docs.map(docTraining => {
					const id = docTraining.id
					const data = docTraining.data()
					const teamIn = this.props.team.teamID
					return { id, teamIn, ...data }
				})
				let allMatches = [...this.state.teams, ...training]
				allMatches.sort(function(a, b) {
					return a.start - b.start;
				})
				this.setState({ teams: allMatches })
			})
		})
    }
    
    render() {
        return (
            <View style={styles.container}>
		
				<View style={{ width: 250, height: 200, marginLeft: "auto", marginRight: "auto", marginTop: 10 }}>
					<Image
						source={require("../../../assets/images/badge.png")}
						style={{ resizeMode: "stretch", width: 250, height: 200, position: "absolute" }}
					/>
					<Text style={{ position: "absolute", width: 250, textAlign: "center", marginTop: 30, color: "white", fontWeight: "bold", fontSize: 60 }}>{this.props.team.tAbbreviation}</Text>
					
					{
						(this.props.winRate === null)
							? null
							: 
								<>
									<View style={{ position: "absolute", width: "40%", bottom: 0 }}>
										<Text style={{textAlign: "center", color: "white", fontSize: 16}}>#1{"\n"}Division</Text>
									</View>
									<View style={{ position: "absolute", width: "40%", bottom: 0, right: 0 }}>
										<Text style={{textAlign: "center", color: "white", fontSize: 16}}>{this.props.winRate}%{"\n"}Win Rate</Text>
									</View>
								</>
								
					}
				</View>

				{
					this.state.teams.length > 0
						?
							<ScrollView style={{ width: "95%", marginTop: 5 }}
								ref={ref => {this.scrollView = ref}}
								onContentSizeChange={() => this.scrollView.scrollTo({y: (this.state.indexItem * 120)})}
							>
							{
								this.state.teams.map((match, index) => {  // for every match put into brief
									return (
										(match.match !== undefined)
											?
												<MatchBrief
													key={index} 
													navigation={this.props.navigation} 
													leagueID={this.props.team.leagueID} 
													finished={match.finished} 
													live={match.live} 
													start={match.start}
													matchID={match.id} 
													season={match.season} 
													division={match.division}
													matchIndex={match.match} 
													matchSeason={match.maxMatches} 
													matchTimestamp={match.start} 
													team={this.props.team}
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
													userIn={this.props.userIn}
												/>
									)
								})
							}
							</ScrollView>
						: (!this.state.loading)
							? <Text style={{ color: "white", textAlign: "center", fontSize: 18, marginLeft: "auto", marginRight: "auto", marginTop: 45 }}>No match history!</Text>
							: <ActivityIndicator style={{ flex: 1 }} size={80} color={"white"} />
				}
			</View>
        )
    }
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#21A361",
		flex: 1,
		flexWrap: "wrap",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "flex-start",
		paddingBottom: 35,
        marginLeft: "auto",
        marginRight: "auto"
	},
	kitContainer: {
		width: 110
	}
})

export default Overview