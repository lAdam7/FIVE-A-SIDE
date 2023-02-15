import React, { Component } from "react"
import { View, Text, TouchableOpacity, Image, ActivityIndicator, StatusBar, StyleSheet } from "react-native"
import { Button } from "react-native-paper"
import { auth, db } from "../../../Auth/FirebaseInit"

import Header from "../../../Utility/Header"
import Kit from "../../../Utility/Kit"
import { KIT_STYLE } from "../../../FindTeam/KitData"

class TrainingMatch extends Component {
    constructor(props) {
        super(props)
        this.state = {
            players: []
        }
    }

    getPlayers = () => {
        db
        .collection("Training")
        .doc(this.props.route.params.teamA.league + "-" + this.props.route.params.teamA.team)
        .collection("TrainingMatches")
        .doc(this.props.route.params.id)
        .collection("Available")
        .get()
        .then(avaialblePlayers => {
            let plrs = avaialblePlayers.docs.map(doc => {
                const id = doc.id
                const data = doc.data()
                return { id, ...data }
            })
            this.setState({ players: plrs })
        })
    }

    componentDidMount() {
        if (this.props.navigation !== undefined) {
            this.navigationSubscription = this.props.navigation.addListener("focus", this.getPlayers);
        }
    }

    addParticipant = (member, teamInfo) => {
        let players = this.state.players
        if (!this.state.players.find(plr => plr.id === auth.currentUser.uid)) {
            players.push({ 
                team: teamInfo.team,
                displayName: auth.currentUser.displayName,
                number: member.number,
                id: auth.currentUser.uid
            })
            this.setState({ players: players  })
        }
        
        db
        .collection("Training")
        .doc(this.props.route.params.teamA.league + "-" + this.props.route.params.teamA.team)
        .collection("TrainingMatches")
        .doc(this.props.route.params.id)
        .collection("Available")
        .doc(auth.currentUser.uid)
        .set({
            team: teamInfo.team,
            displayName: auth.currentUser.displayName,
            number: member.number
        })
    }
    participateMatch = (bool) => {
        if (bool) { // can attend match
            let team = (this.props.route.params.teamIn === this.props.route.params.teamA.team) ? this.props.route.params.teamA : this.props.route.params.teamB
            db
            .collection("Leagues")
            .doc(team.league)
            .collection("Divisions")
            .doc(team.division)
            .collection("Teams")
            .doc(team.team)
            .collection("Members")
            .doc(auth.currentUser.uid)
            .get()
            .then(teamSnapshot => {
                if (teamSnapshot.exists) {
                    this.addParticipant(teamSnapshot.data(), team)
                }
            })
        } else { // can't attend match
            this.setState({ players: this.state.players.filter(player => player.id !== auth.currentUser.uid) })
            
            db
            .collection("Training")
            .doc(this.props.route.params.teamA.league + "-" + this.props.route.params.teamA.team)
            .collection("TrainingMatches")
            .doc(this.props.route.params.id)
            .collection("Available")
            .doc(auth.currentUser.uid)
            .get()
            .then(result => {
                if (result.exists) {
                    result.ref.delete()
                }
            }) 
        }
    }

    render() {
        const dateStart = (this.props.route.params.start !== null) ? new Date(this.props.route.params.start) : new Date()
        const weekday = ["Sunday", "Monday" ,"Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        const month = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        const ordinals = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"]

        //console.log(this.props.route.params)

        return (
            <View style={styles.container}>
                <View style={{ marginBottom: 10 }}>
                    <Header title={"Training"} color={"white"} marginTop={StatusBar.currentHeight} />

                    <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
                        <View style={{ width: 125, height: 100 }}>
                            <Image
                                source={require("../../../../assets/images/badge.png")}
                                style={{ resizeMode: "stretch", width: 125, height: 100, position: "absolute", marginTop: 5 }}
                            />
                            <Text style={{ color: "white", textAlign: "center", fontSize: 24, marginTop: 30 }}>{this.props.route.params.teamA.abbreviation}</Text>
                        </View>
                        <View style={{ marginTop: 15 }}>
                            {
                                (this.props.route.params.start < new Date().getTime())
                                ? <Text style={{ color: "white", textAlign: "center", opacity: .7 }}>FINISHED</Text>
                                :   
                                    <>  
                                        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                                            <Text style={{ color: "white", textAlign: "center", fontWeight: "bold", marginTop: 5 }}>{weekday[dateStart.getDay()]} {dateStart.getDate()}</Text>
                                            <Text style={{ color: "white", textAlign: "center", fontWeight: "bold", marginTop: 5, fontSize: 10 }}>{ordinals[Number(String(dateStart.getDate()).slice(-1))]}</Text>
                                        </View>

                                        <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>{month[dateStart.getMonth()]}</Text>
                                        <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>{dateStart.getHours()}:{dateStart.getMinutes()}</Text>
                                    </>
                            }
                            
                        </View>
                        <View style={{ width: 125, height: 100 }}>
                            <Image
                            source={require("../../../../assets/images/badge.png")}
                            style={{ resizeMode: "stretch", width: 125, height: 100, position: "absolute", marginTop: 5 }}
                            />
                            <Text style={{ color: "white", textAlign: "center", fontSize: 24, marginTop: 30 }}>{this.props.route.params.teamB.abbreviation}</Text>
                        </View>
                    </View>
                
                    {
                        ((this.props.route.params.start < new Date().getTime()) || !this.props.route.params.userIn)
                        ? null
                        : 
                            <View style={{ marginTop: 20 }}>
                                <Text style={styles.text}>Can you attend this training?</Text>
                                <View style={{ flexDirection: "row", marginTop: 10 }}>
                                    <Button
                                        mode="contained"
                                        style={{ 
                                            flex: 1, 
                                            borderRadius: 0,
                                            backgroundColor: "blue",
                                            opacity: (!this.state.players.find(plr => plr.team === this.props.route.params.teamIn && plr.id === auth.currentUser.uid)) ? 0.5 : 1
                                        }}
                                        onPress={() => this.participateMatch(true)}
                                    >
                                        YES
                                    </Button>
                                    <Button
                                        mode="contained"
                                        style={{ 
                                            flex: 1, 
                                            borderRadius: 0,
                                            backgroundColor: "red",
                                            opacity: (this.state.players.find(plr => plr.team === this.props.route.params.teamIn && plr.id === auth.currentUser.uid)) ? 0.5 : 1
                                        }}
                                        onPress={() => this.participateMatch(false)}
                                    >
                                        NO
                                    </Button>
                                </View>
                            </View>
                    }
                    <Text style={styles.text}>Attending Players</Text>

                    {
                        (this.state.players !== null && this.state.players.length === 0)
                            ? <Text style={{ textAlign: "center", color: "white" }}>Nobody has said their availability yet</Text>
                            : null
                    }

                <View style={{ flexDirection: "row" }}>

                    <View style={{ width: "50%" }}>
                        { // teamA
                            this.state.players.filter(plr => plr.team === this.props.route.params.teamA.team).map((member, index) => {
                                return (
                                    <View key={index} style={styles.kitContainer}>
                                        <Kit
                                            kitLeftLeft={KIT_STYLE[this.props.route.params.teamA.kit].kitLeftLeft}
                                            kitLeft={KIT_STYLE[this.props.route.params.teamA.kit].kitLeft}
                                            kitMiddle={KIT_STYLE[this.props.route.params.teamA.kit].kitMiddle}
                                            kitRight={KIT_STYLE[this.props.route.params.teamA.kit].kitRight}
                                            kitRightRight={KIT_STYLE[this.props.route.params.teamA.kit].kitRightRight}
                                            numberColor={KIT_STYLE[this.props.route.params.teamA.kit].numberColor}
                                            kitNumber={member.number}
                                        />
                                        <Text style={{ color: "white", textAlign: "center", fontSize: 14 }}>{member.displayName}</Text>
                                        <View style={{ backgroundColor: "white", width: "100%", marginLeft: "auto", marginRight: "auto", height: 1, borderRadius: 100 }}></View>
                                    </View>
                                )
                            })  
                        }
                    </View>

                    <View style={{ width: "50%" }}>
                        { // teamA
                            this.state.players.filter(plr => plr.team === this.props.route.params.teamB.team).map((member, index) => {
                                return (
                                    <View key={index} style={styles.kitContainer}>
                                        <Kit
                                            kitLeftLeft={KIT_STYLE[this.props.route.params.teamB.kit].kitLeftLeft}
                                            kitLeft={KIT_STYLE[this.props.route.params.teamB.kit].kitLeft}
                                            kitMiddle={KIT_STYLE[this.props.route.params.teamB.kit].kitMiddle}
                                            kitRight={KIT_STYLE[this.props.route.params.teamB.kit].kitRight}
                                            kitRightRight={KIT_STYLE[this.props.route.params.teamB.kit].kitRightRight}
                                            numberColor={KIT_STYLE[this.props.route.params.teamB.kit].numberColor}
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
                    

                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#21A361",
        flex: 1
	},
	text: {
		textAlign: "center",
		color: "white",
		fontWeight: "bold",
		fontSize: 24
	},
    kitContainer: {
		width: 110,
        marginLeft: "auto",
        marginRight: "auto",
        marginVertical: 5
	}
})

export default TrainingMatch

/*
<View style={{ flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
    <View style={{ width: 125, height: 100 }}>
        <Image
            source={require("../../../assets/images/badge.png")}
            style={{ resizeMode: "stretch", width: 125, height: 100, position: "absolute", marginTop: 5 }}
        />
        <Text style={{ color: "white", textAlign: "center", fontSize: 24, marginTop: 30 }}>{(this.state.teamADetails !== null) ? this.state.teamADetails.abbreviation : null}</Text>
    </View>
    <View style={{ marginTop: 15 }}>
        <Text style={{ color: "white", textAlign: "center" }}>Season {(this.state.season !== null) ? this.state.season : null}</Text>
        {
            (this.state.live)
            ? <>
                <Text style={{ color: "white", textAlign: "center", fontWeight: "bold", fontSize: 24 }}>{(this.state.teamAGoals !== null && this.state.teamBGoals !== null) ? (this.state.teamAGoals + " - " + this.state.teamBGoals) : <ActivityIndicator size="large" color="white" />}</Text>
                <Text style={{ color: "red", textAlign: "center", fontWeight: "bold" }}>LIVE {this.state.currentTime}'</Text>
            </>
            : (this.state.finished)
            ? <>
                <Text style={{ color: "white", textAlign: "center", fontWeight: "bold", fontSize: 24 }}>{this.state.teamAGoals} - {this.state.teamBGoals}</Text>
                <Text style={{ color: "white", textAlign: "center", opacity: .7 }}>MATCH OVER</Text>
            </>
            :   <>  
                    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                        <Text style={{ color: "white", textAlign: "center", fontWeight: "bold", marginTop: 5 }}>{weekday[dateStart.getDay()]} {dateStart.getDate()}</Text>
                        <Text style={{ color: "white", textAlign: "center", fontWeight: "bold", marginTop: 5, fontSize: 10 }}>{ordinals[Number(String(dateStart.getDate()).slice(-1))]}</Text>
                    </View>
                    <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>{month[dateStart.getMonth()]}</Text>
                    <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>{dateStart.getHours()}:{dateStart.getMinutes()}</Text>
                </>
        }
        
    </View>
    <View style={{ width: 125, height: 100 }}>
        <Image
        source={require("../../../assets/images/badge.png")}
        style={{ resizeMode: "stretch", width: 125, height: 100, position: "absolute", marginTop: 5 }}
        />
        <Text style={{ color: "white", textAlign: "center", fontSize: 24, marginTop: 30 }}>{(this.state.teamBDetails !== null) ? this.state.teamBDetails.abbreviation : null}</Text>
    </View>
</View>
                    */