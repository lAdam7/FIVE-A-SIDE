import React, { Component } from "react"
import { ScrollView, View, Text, StyleSheet } from "react-native"

import Kit from "../../Utility/Kit"
import { KIT_STYLE } from "../../FindTeam/KitData"

/**
 * Show the lineups for selected match
 * showing both teams with there kits and players numbers
 * 
 * @author Adam Lyon W19023403
 */
class Lineups extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        /** 
         * @var teamAKit integer Get kit style for teamA
         * @var teamBKit integer Get kit style for teamB
         */
        var teamAKit = (this.props.teamADetails !== null) ? this.props.teamADetails.kit : 1;
        var teamBKit = (this.props.teamBDetails !== null) ? this.props.teamBDetails.kit : 1;

        let teamAPlayers = (this.props.availablePlayers !== null)
            ? this.props.availablePlayers.filter(player => player.team === this.props.teamADetails.id)
            : this.props.players.filter(player => player.teamID === this.props.teamADetails.id)
        let teamBPlayers = (this.props.availablePlayers !== null)
            ? this.props.availablePlayers.filter(player => player.team === this.props.teamBDetails.id)
            : this.props.players.filter(player => player.teamID === this.props.teamBDetails.id)

        return (
            <ScrollView style={{ width: "100%", marginTop: 10 }}>
                {
                    (this.props.availablePlayers !== null)
                    ? <Text style={styles.text}>Available Players</Text>
                    : null
                }
                {
                    (this.props.availablePlayers !== null && this.props.availablePlayers.length === 0)
                        ? <Text style={{ textAlign: "center", color: "white" }}>Nobody has said their availability yet</Text>
                        : null
                }
                <View style={{ flexDirection: "row" }}>

                    <View style={{ width: "50%" }}>
                        { // teamA
                          
                            teamAPlayers.map((member, index) => {
                                return (
                                    <View key={index} style={styles.kitContainer}>
                                        <Kit
                                            kitLeftLeft={KIT_STYLE[teamAKit].kitLeftLeft}
                                            kitLeft={KIT_STYLE[teamAKit].kitLeft}
                                            kitMiddle={KIT_STYLE[teamAKit].kitMiddle}
                                            kitRight={KIT_STYLE[teamAKit].kitRight}
                                            kitRightRight={KIT_STYLE[teamAKit].kitRightRight}
                                            numberColor={KIT_STYLE[teamAKit].numberColor}
                                            kitNumber={member.number}
                                        />
                                        <Text style={{ color: "white", textAlign: "center", fontSize: 14 }}>{member.displayName}</Text>
                                        <View style={{ backgroundColor: "white", width: "100%", marginLeft: "auto", marginRight: "auto", height: 1, borderRadius: 100 }}></View>
                                    </View>
                                )
                            })
                                
                        }
                    </View>

                    <View style={{ width: "50%"}}>
                        { // teamB
                        
                            teamBPlayers.map((member, index) => {
                                return (
                                    <View key={index} style={styles.kitContainer}>
                                        <Kit
                                            kitLeftLeft={KIT_STYLE[teamBKit].kitLeftLeft}
                                            kitLeft={KIT_STYLE[teamBKit].kitLeft}
                                            kitMiddle={KIT_STYLE[teamBKit].kitMiddle}
                                            kitRight={KIT_STYLE[teamBKit].kitRight}
                                            kitRightRight={KIT_STYLE[teamBKit].kitRightRight}
                                            numberColor={KIT_STYLE[teamBKit].numberColor}
                                            kitNumber={member.number}
                                        />
                                        <Text style={{ color: "white", textAlign: "center", fontSize: 14 }}>{member.displayName}</Text>
                                        <View style={{ backgroundColor: "white", width: "100%", marginLeft: "auto", marginRight: "auto", height: 1, borderRadius: 100 }}></View>
                                    </View>
                                )
                            })
                        
                        }
                    </View>
                </View>
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
	kitContainer: {
		width: 110,
        marginLeft: "auto",
        marginRight: "auto",
        marginVertical: 5
	},
	text: {
		textAlign: "center",
		color: "white",
		fontWeight: "bold",
		fontSize: 24
	}
})

export default Lineups