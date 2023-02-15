import React, { Component } from "react"
import { View, Text, StyleSheet, Image } from "react-native"
import { Badge } from "react-native-paper"

import Kit from "../../../Utility/Kit"
import { KIT_STYLE } from "../../../FindTeam/KitData"

/**
 * Show sub event on card
 * 
 * @author Adam Lyon W19023403
 */
class Sub extends Component {
    render() {
		/**
		 * @var event JSON Details of the card event
		 * @var timestamp integer Time difference between match start and when the event occured
		 * @var minutes string The minutes the event occured, from the start of match
		 */
        var event = this.props.event
		
		/**
		 * @var kitID integer Kit index for the team the card occured
		 * @var kitNumberOff integer The players kit number going off pitch
		 * @var kitNumberOn integer The players kit number going on pitch
		 * @var teamAbbreviation string Abbreviation for the team the card occured
		 */
        var kitID = (this.props.teamADetails === null && this.props.teamBDetails === null)
			? 1
			: (event.teamID === this.props.teamADetails.id)
				? this.props.teamADetails.kit
				: this.props.teamBDetails.kit
        var kitNumberOff = (this.props.teamADetails === null && this.props.teamBDetails === null && this.props.teamAMembers === null && this.props.teamBMembers === null || this.props.teamAMembers === undefined || this.props.teamBMembers === undefined)
			? null
			: (event.teamID === this.props.teamADetails.id)
				? this.props.teamAMembers.find(member => member.id === event.playerIDOff).number
				: this.props.teamBMembers.find(member => member.id === event.playerIDOff).number
		var kitNumberOn = (this.props.teamADetails === null && this.props.teamBDetails === null && this.props.teamAMembers === null && this.props.teamBMembers === null || this.props.teamAMembers === undefined || this.props.teamBMembers === undefined)
			? null
			: (event.teamID === this.props.teamADetails.id)
				? this.props.teamAMembers.find(member => member.id === event.playerIDOn).number
				: this.props.teamBMembers.find(member => member.id === event.playerIDOn).number
        var teamAbbreviation = (this.props.teamADetails === null && this.props.teamBDetails === null)
			? ""
			: (event.teamID === this.props.teamADetails.id)
				? this.props.teamADetails.abbreviation
				: this.props.teamBDetails.abbreviation

        return (
            <View style={{ width: "80%", marginLeft: "10%", marginBottom: 10, backgroundColor: "#086134", borderRadius: 12 }}>
				<View style={{ flexDirection: "row", borderWidth: .75, borderTopLeftRadius: 12, borderTopRightRadius: 12 , borderColor: "white"}}>
					<Image style={{ width: 25, height: 25, marginLeft: 5 }} source={require("../../../../assets/images/icons/events/sub.png")} />
					<Text style={{ flex: 1, paddingLeft: 15, color: "white", fontWeight: "bold", fontSize: 16, textAlignVertical: "center" }}>Substitution</Text>
					<Text style={{ flex: 1, textAlign: "right", paddingRight: 15, color: "white", fontWeight: "bold", textAlignVertical: "center" }}>{event.min}'</Text>
				</View>

				<View style={{ borderWidth: .75, borderTopWidth: 0, padding: 10, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, borderColor: "white" }}>
									
					<View style={{ flexDirection: "row", alignItems: "center", marginLeft: "auto", marginRight: "auto", flexDirection: "row" }}>
						<Badge style={{ backgroundColor: "red" }} size={34}>OFF</Badge>
						<View style={{ width: 90, height: 75, marginHorizontal: 10 }}>
							<Image
								source={require("../../../../assets/images/badge.png")}
								style={{ resizeMode: "stretch", width: 90, height: 75, position: "absolute", marginTop: 5 }}
							/>
							<Text style={{ color: "white", textAlign: "center", fontSize: 24, marginTop: 15 }}>{teamAbbreviation}</Text>
						</View>
						<Badge style={{ backgroundColor: "green" }} size={34}>IN</Badge>				
					</View>

					<View style={{ flexDirection: "row", alignItems: "center", marginLeft: "auto", marginRight: "auto", flexDirection: "row" }}>
						<View style={styles.kitContainer}>
							<Kit
								kitLeftLeft={KIT_STYLE[kitID].kitLeftLeft}
								kitLeft={KIT_STYLE[kitID].kitLeft}
								kitMiddle={KIT_STYLE[kitID].kitMiddle}
								kitRight={KIT_STYLE[kitID].kitRight}
								kitRightRight={KIT_STYLE[kitID].kitRightRight}
								numberColor={KIT_STYLE[kitID].numberColor}
								kitNumber={kitNumberOff}
								width={12}
								height={65}
								fontSize={32}  
							/>
							<Text style={{ textAlign: "center", color: "white" }}>{event.displayNameOff}</Text>
						</View>

						<View style={styles.kitContainer}>
							<Kit
								kitLeftLeft={KIT_STYLE[kitID].kitLeftLeft}
								kitLeft={KIT_STYLE[kitID].kitLeft}
								kitMiddle={KIT_STYLE[kitID].kitMiddle}
								kitRight={KIT_STYLE[kitID].kitRight}
								kitRightRight={KIT_STYLE[kitID].kitRightRight}
								numberColor={KIT_STYLE[kitID].numberColor}
								kitNumber={kitNumberOn}
								width={12}
								height={65}
								fontSize={32}  
							/>
							<Text style={{ textAlign: "center", color: "white" }}>{event.displayNameOn}</Text>
						</View>
					</View>			
				</View>					
			</View>
        )
    }
}

const styles = StyleSheet.create({
	kitContainer: {
		width: 155,
        marginLeft: "auto",
        marginRight: "auto",
        marginVertical: 5,
		marginHorizontal: 20
	}
})

export default Sub