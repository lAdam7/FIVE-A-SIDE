import React, { Component } from "react"
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from "react-native"

/**
 * Show brief of upcoming match utilized
 * for fixtures screen, team overview and
 * referee games
 * 
 * @author Adam Lyon W19023403
 */
class TrainingBrief extends Component {
    constructor(props) {
        super(props)
    }

    /** Training selected */
    trainingClicked = () => {
        this.props.navigation.navigate("My Teams", { 
            screen: "Training Match",
            params: {
                ...this.props.training,
                userIn: this.props.userIn
            }
        })
    }
    
    render() {
        const dateStart = (this.props.training.start !== null) ? new Date(this.props.training.start) : new Date()
        const weekday = ["Sunday", "Monday" ,"Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        const month = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        const ordinals = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"]
        return(
            <TouchableOpacity onPress={this.trainingClicked} activeOpacity={1} style={{ paddingVertical: 5, height: 120 }}>

                <View style={{ flexDirection: "row" }}>
                    <Text style={{ color: "white", height: 20 }}>Training</Text>
                </View>
                
                <View style={{ flexDirection: "row", width: "100%" }}>
                    <View style={{ height: 45 }}>
                        <View style={{ width: 45, height: 35 }}>
                            <Image
                                source={require("../../../../assets/images/badge.png")}
                                style={{ resizeMode: "stretch", width: 45, height: 35, position: "absolute", marginTop: 5 }}
                            />
                            <Text style={{ color: "white", textAlign: "center", fontSize: 11, marginTop: 10 }}>{this.props.training.teamA.abbreviation}</Text>
                        </View>
                    
                    </View>
                    <Text style={{ textAlignVertical: "center", width: "70%", paddingLeft: 25, color: "white", fontWeight: "bold", fontSize: 15 }}>{this.props.training.teamA.name}</Text>
                </View>
                
                { // Match upcoming display the date / time the match will start
                    (this.props.training.start < new Date().getTime())
                    ? null
                    : 
                        <View style={{ position: "absolute", right: 0, top: 5, bottom: 5, justifyContent: "center" }}>
                            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                                <Text style={{ color: "white", textAlign: "center", marginTop: 5 }}>{weekday[dateStart.getDay()]} {dateStart.getDate()}</Text>
                                <Text style={{ color: "white", textAlign: "center", marginTop: 5, fontSize: 10 }}>{ordinals[Number(String(dateStart.getDate()).slice(-1))]}</Text>
                            </View>
        
                            <Text style={{ color: "white", textAlign: "center" }}>{month[dateStart.getMonth()]} </Text>
                            <Text style={{ color: "white", textAlign: "center" }}>{dateStart.getHours()}:{dateStart.getMinutes()}</Text>
                            <Text style={{ color: "white", textAlign: "center" }}>{dateStart.getFullYear()}</Text>
                        </View>
                }

                <View style={{ flexDirection: "row", width: "100%" }}>
                    <View style={{ height: 45 }}>
                        <View style={{ width: 45, height: 35 }}>
                            <Image
                                source={require("../../../../assets/images/badge.png")}
                                style={{ resizeMode: "stretch", width: 45, height: 35, position: "absolute", marginTop: 5 }}
                            />
                            <Text style={{ color: "white", textAlign: "center", fontSize: 11, marginTop: 10 }}>{this.props.training.teamB.abbreviation}</Text>
                        </View>
                    
                    </View>
                    <Text style={{ textAlignVertical: "center", width: "70%", paddingLeft: 25, color: "white", fontWeight: "bold", fontSize: 15 }}>{this.props.training.teamB.name}</Text>
                </View>

                <View style={{ backgroundColor: "white", width: "100%", height: 1, borderRadius: 100 }}></View>
            </TouchableOpacity>
        )
    }
}

export default TrainingBrief