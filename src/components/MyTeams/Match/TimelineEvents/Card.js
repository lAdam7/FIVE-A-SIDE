import React, { Component } from "react"
import { View, Text, StyleSheet, Image } from "react-native"

import Kit from "../../../Utility/Kit"
import { KIT_STYLE } from "../../../FindTeam/KitData"

/**
 * Show card event on card
 * 
 * @author Adam Lyon W19023403
 */
class Card extends Component {
    render() {
		/**
		 * @var event JSON Details of the card event
		 * @var timestamp integer Time difference between match start and when the event occured
		 * @var minutes string The minutes the event occured, from the start of match
		 */
        var event = this.props.event

		/**
		 * @var kitID integer Kit index for the team the card occured
		 * @var kitNumber integer The players kit number being awarded a card
		 * @var teamAbbreviation string Abbreviation for the team the card occured
		 */
        var kitID = (this.props.teamADetails === null && this.props.teamBDetails === null)
			? 1
			: (event.teamID === this.props.teamADetails.id)
				? this.props.teamADetails.kit
				: this.props.teamBDetails.kit
        var kitNumber = (this.props.teamADetails === null || this.props.teamBDetails === null || this.props.teamAMembers === null || this.props.teamBMembers === null)
			? null
			: (event.teamID === this.props.teamADetails.id)
				? this.props.teamAMembers.find(member => member.id === event.playerID).number
				: this.props.teamBMembers.find(member => member.id === event.playerID).number
        var teamAbbreviation = (this.props.teamADetails === null && this.props.teamBDetails === null)
			? ""
			: (event.teamID === this.props.teamADetails.id)
				? this.props.teamADetails.abbreviation
				: this.props.teamBDetails.abbreviation

        return (
            <View style={{ width: "80%", marginLeft: "10%", marginBottom: 10, backgroundColor: "#086134", borderRadius: 12 }}>
				<View style={{ flexDirection: "row", borderWidth: .75, borderTopLeftRadius: 12, borderTopRightRadius: 12, borderColor: "white" }}>
					<Image style={{ width: 25, height: 25, marginLeft: 5 }} source={this.props.card === "Yellow Card" ?  require("../../../../assets/images/icons/events/yellow.png") : require("../../../../assets/images/icons/events/red.png")} />
					<Text style={{ flex: 1, paddingLeft: 15, color: "white", fontWeight: "bold", fontSize: 16, textAlignVertical: "center" }}>{this.props.card}</Text>
					<Text style={{ flex: 1, textAlign: "right", paddingRight: 15, color: "white", fontWeight: "bold", textAlignVertical: "center" }}>{event.min}'</Text>
				</View>

				<View style={{ borderWidth: .75, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, borderTopWidth: 0, padding: 10, borderColor: "white" }}>
					
					<View style={{ flexDirection: "row", alignItems: "center", marginLeft: "auto", marginRight: "auto", flexDirection: "row" }}>

						<View style={{ width: 90, height: 75, marginHorizontal: 10 }}>
							<Image
								source={require("../../../../assets/images/badge.png")}
								style={{ resizeMode: "stretch", width: 90, height: 75, position: "absolute", marginTop: 5 }}
							/>
							<Text style={{ color: "white", textAlign: "center", fontSize: 24, marginTop: 15 }}>{teamAbbreviation}</Text>
						</View>

						<View style={styles.kitContainer}>
								<Kit
									kitLeftLeft={KIT_STYLE[kitID].kitLeftLeft}
									kitLeft={KIT_STYLE[kitID].kitLeft}
									kitMiddle={KIT_STYLE[kitID].kitMiddle}
									kitRight={KIT_STYLE[kitID].kitRight}
									kitRightRight={KIT_STYLE[kitID].kitRightRight}
									numberColor={KIT_STYLE[kitID].numberColor}
									kitNumber={kitNumber}   
								/>
						</View>
						
					</View>
					<Text style={{ color: "white", textAlign: "center", fontWeight: "bold", fontSize: 18 }}>{event.displayName}</Text>
				</View>
			</View>
        )
    }
}

const styles = StyleSheet.create({
	kitContainer: {
		width: 110,
        marginLeft: "auto",
        marginRight: "auto",
        marginVertical: 5,
		marginHorizontal: 10
	}
})

export default Card