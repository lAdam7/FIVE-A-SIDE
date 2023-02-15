import React, { Component } from "react"
import { ScrollView, View, Text, StyleSheet } from "react-native"
import { Bar } from "react-native-progress"

/**
 * Statistics component for the match
 * 
 * @author Adam Lyon W19023403
 */
class Statistics extends Component {
    constructor(props) {
        super(props)
    }

	/**
	 * Find how many times an event occurs for a specific team returning 
	 * the amount of times it occurs
	 * 
	 * @param firstTeam boolean Searching for teamA or teamB
	 * @param eventType string Event searching for
	 * @returns integer Amount of times event occured for team
	 */
	findValue = (firstTeam, eventType) => {
		if (this.props.teamADetails !== null && this.props.teamBDetails !== null) {
			let teamID = (firstTeam) ? this.props.teamADetails.id : this.props.teamBDetails.id
			let matchingEvents = this.props.events.filter(event => event.teamID === teamID && event.event === eventType)
			return matchingEvents.length
		} else {
			return 0
		}
	}

    render() {
		/**
		 * @var teamAYellowCards integer How many yellow cards teamA has
		 * @var teamBYellowCards integer How many yellow cards teamB has
		 * @var progressYellowCards float Percentage difference between teams for progress bar
		 */
		var teamAYellowCards = this.findValue(true, "Yellow Card")
		var teamBYellowCards = this.findValue(false, "Yellow Card")
		var progressYellowCards = (teamAYellowCards === teamBYellowCards)
			? 0.5 
			: teamAYellowCards / (teamAYellowCards + teamBYellowCards)

		/** Same methodology as yellow cards */
		var teamARedCards = this.findValue(true, "Red Card")
		var teamBRedCards = this.findValue(false, "Red Card")
		var progressRedCards = (teamARedCards === teamBRedCards)
			? 0.5 
			: teamARedCards / (teamARedCards + teamBRedCards)

		/** Same methodology as yellow cards */
		var teamASub = this.findValue(true, "Sub")
		var teamBSub = this.findValue(false, "Sub")
		var progressSub = (teamASub === teamBSub)
			? 0.5 
			: teamASub / (teamASub + teamBSub)

		/**
		 * Render the statistics using a progress bar
		 * displaying the amount of times each event occurs
		 * and adjusting progress bar 
		 */
        return (
            <ScrollView style={{ width: "100%" }}>
               <Text style={{ color: "white", textAlign: "center", fontWeight: "bold", fontSize: 18, marginBottom: -6 }}>Yellow Cards</Text>
			   <View style={{ flexDirection: "row" }}>
					<Text style={{ flex: 1, textAlign: "right", paddingRight: 10, fontWeight: "bold", color: "white", fontSize: 18 }}>{ teamAYellowCards }</Text>

					<View style={{ marginTop: 10 }}>
						<Bar progress={progressYellowCards} width={200} color={"blue"} unfilledColor={"red"} borderWidth={0} height={8} style={{ marginLeft: "auto", marginRight: "auto" }} />
					</View>

					<Text style={{ flex: 1, paddingLeft: 10, fontWeight: "bold", color: "white", fontSize: 18 }}>{ teamBYellowCards }</Text>
			   </View>

			   <Text style={{ color: "white", textAlign: "center", fontWeight: "bold", fontSize: 18, marginBottom: -6 }}>Red Cards</Text>
			   <View style={{ flexDirection: "row" }}>
					<Text style={{ flex: 1, textAlign: "right", paddingRight: 10, fontWeight: "bold", color: "white", fontSize: 18 }}>{ teamARedCards }</Text>

					<View style={{ marginTop: 10 }}>
						<Bar progress={progressRedCards} width={200} color={"blue"} unfilledColor={"red"} borderWidth={0} height={8} style={{ marginLeft: "auto", marginRight: "auto" }} />
					</View>

					<Text style={{ flex: 1, paddingLeft: 10, fontWeight: "bold", color: "white", fontSize: 18 }}>{ teamBRedCards  }</Text>
			   </View>

			   <Text style={{ color: "white", textAlign: "center", fontWeight: "bold", fontSize: 18, marginBottom: -6 }}>Substitutions</Text>
			   <View style={{ flexDirection: "row" }}>
					<Text style={{ flex: 1, textAlign: "right", paddingRight: 10, fontWeight: "bold", color: "white", fontSize: 18 }}>{ teamASub }</Text>

					<View style={{ marginTop: 10 }}>
						<Bar progress={progressSub} width={200} color={"blue"} unfilledColor={"red"} borderWidth={0} height={8} style={{ marginLeft: "auto", marginRight: "auto" }} />
					</View>

					<Text style={{ flex: 1, paddingLeft: 10, fontWeight: "bold", color: "white", fontSize: 18 }}>{ teamBSub }</Text>
			   </View>
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
	
})

export default Statistics