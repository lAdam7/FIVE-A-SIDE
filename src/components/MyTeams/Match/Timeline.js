import React, { Component } from "react"
import { View, ScrollView, Text, StyleSheet } from "react-native"
import { Button } from "react-native-paper"

import { auth } from "../../Auth/FirebaseInit"
/** Each different event type */
import Goal from "./TimelineEvents/Goal"
import Card from "./TimelineEvents/Card"
import Sub from "./TimelineEvents/Sub"

/**
 * Timeline of all the events for the match
 * depending on type send to relevent child
 * component for appropriate context display
 * 
 * @author Adam Lyon W19023403
 */
class Timeline extends Component {
    render() {
		let teamAPlayers = this.props.players.filter(player => player.teamID === this.props.teamADetails.id)
		let teamBPlayers = this.props.players.filter(player => player.teamID === this.props.teamBDetails.id)

		let currentlyActive = this.props.availablePlayers !== null && this.props.availablePlayers.find(plr => plr.id === auth.currentUser.uid)
        return (
            <ScrollView style={styles.scrollContainer}>
                {
					(this.props.started)
					? // Match not started yet / no events have occured
						(!this.props.userIn && !this.props.started)
							? <Text style={styles.text}>NOT STARTED</Text>
							: 
								<View>
									<Text style={styles.text}>Can you participate in this match?</Text>
									<View style={{ flexDirection: "row", marginTop: 10 }}>
										<Button
											mode="contained"
											style={{ 
												flex: 1, 
												borderRadius: 0,
												backgroundColor: "blue",
												opacity: (!currentlyActive) ? 0.5 : 1
											}}
											onPress={() => this.props.participateMatch(true)}
										>
											YES
										</Button>
										<Button
											mode="contained"
											style={{ 
												flex: 1, 
												borderRadius: 0,
												backgroundColor: "red",
												opacity: (currentlyActive) ? 0.5 : 1
											}}
											onPress={() => this.props.participateMatch(false)}
										>
											NO
										</Button>
									</View>
								</View>		
					:  // for every event if loaded from firestore
						(this.props.events !== undefined)
							? 
								this.props.events.map((event, index) => { // iterate all events, and send to component depending on event type
									if (event.event === "Yellow Card" || event.event === "Red Card") {
										return (
											<Card 
												card={event.event} 
												key={index} 
												matchTimestart={this.props.matchTimestart} 
												event={event} 
												teamAMembers={teamAPlayers} 
												teamADetails={this.props.teamADetails} 
												teamBMembers={teamBPlayers} 
												teamBDetails={this.props.teamBDetails} 
											/>
										)   
									} else if (event.event === "Goal") {
										return (
											<Goal 
												card={event.event} 
												key={index} 
												matchTimestart={this.props.matchTimestart} 
												event={event} 
												teamAMembers={teamAPlayers} 
												teamADetails={this.props.teamADetails} 
												teamBMembers={teamBPlayers} 
												teamBDetails={this.props.teamBDetails} 
												allEvents={this.props.events} 
											/>
										)
									} else if (event.event === "Sub") {
										return (
											<Sub 
												card={event.event} 
												key={index} 
												matchTimestart={this.props.matchTimestart} 
												event={event} 
												teamAMembers={teamAPlayers} 
												teamADetails={this.props.teamADetails} 
												teamBMembers={teamBPlayers} 
												teamBDetails={this.props.teamBDetails} 
											/>
										)
									} else if (event.event === "HT") {

									}	
								})
							: null
				}
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
	scrollContainer: {
		width: "100%",
		marginTop: 10
	},
	text: {
		textAlign: "center",
		color: "white",
		fontWeight: "bold",
		fontSize: 24
	}
})

export default Timeline