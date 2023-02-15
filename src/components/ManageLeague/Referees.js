import React, { Component } from "react"
import { View, Text, StyleSheet } from "react-native"
import { Button } from "react-native-paper"

import { auth, db } from "../Auth/FirebaseInit"

/**
 * Manage referee screen view current
 * referees and how long they've been in the league
 * with option to remove, additionally an option to
 * accept/reject any ref applications sent in
 * 
 * @author Adam Lyon W19023403
 */
class Referees extends Component {
    constructor(props) {
        super(props)
        this.state = {
            showRefereeApplications: false
        }
    }

    /**
     * Accept a referee application and add to array, to show user
     * that they have been added
     * 
     * @param uid string Referee to be accepted ID
     * @param name string Referees to be added username
     */
    acceptApplication = (uid, name) => {
        db
        .collection("Leagues")
        .doc(auth.currentUser.uid)
        .collection("Referees")
        .doc(uid)
        .update({
            "accepted": true,
            "dateAccepted": new Date().getTime()
        })
        .then(() => {
            this.props.removeItem(uid)
            this.props.addReferee(uid, name)
        })
        .catch((error) => {
            console.log(error)
        })
    }
    
    /**
     * Reject a referee application, clear from array, to show
     * user that have been removed from pending apps
     * 
     * @param uid string Refere app to be removed
     * @param application boolean Being accepted or rejected
     */
    rejectApplication = (uid, application) => {
        db
        .collection("Leagues")
        .doc(auth.currentUser.uid)
        .collection("Referees")
        .doc(uid)
        .get()
        .then((result) => {
            result.ref.delete()
            if (application) {
                this.props.removeItem(uid)
            } else {
                this.props.removeItemReferee(uid)
            }
        })
        .catch((error) => {
            console.log(error)
        })
    }

    render() {
        const month = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        const ordinals = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"]
        /**
         * Render all active referees with how long they've been in and option
         * to remove them from the league, additionally show all referee
         * applications pending result with accept/reject options
         */
        return (
            <>
                <Button mode="contained" color="#086134" style={{ marginTop: 10, borderRadius: 0 }} onPress={() => this.setState({ showRefereeApplications: !this.state.showRefereeApplications })}>
                    REFEREE APPLICATIONS ({this.props.refereeApplications.length})
                </Button>
                {
                    this.state.showRefereeApplications
                        ?
                            this.props.refereeApplications !== null && this.props.refereeApplications.length > 0
                            ? this.props.refereeApplications.map((referee, index) => { return ( // for every referee app pending for league
                                <View key={referee.uid} style={{ marginTop: 15, borderRadius: 20, paddingTop: 5, width: "90%", marginLeft: "5%", backgroundColor: "#086134" }}>
                                    <Text style={{ color: "white", textAlign: "center", fontWeight: "bold", fontSize: 18 }}>{referee.name}</Text>
                                    <Text style={{ color: "white", textAlign: "center" }}>{referee.notes}</Text>
                                    <Button mode="contained" style={{ borderRadius: 0 }} onPress={() => this.acceptApplication(referee.id, referee.name)}>
                                        ACCEPT
                                    </Button>
                                    <Button mode="contained" color="red" style={{ borderRadius: 0, borderBottomRightRadius: 20, borderBottomLeftRadius: 20 }} onPress={() => this.rejectApplication(referee.id, true)}>
                                        REJECT
                                    </Button>
                                </View>
                            )})
                            : // no applications for league
                                <> 
                                    <Text style={{ color: "white", textAlign: "center", fontWeight: "bold", fontSize: 20, marginTop: 20 }}>No referee applications</Text>
                                    <View style={[styles.line, { backgroundColor: "white", marginTop: 10 }]}></View>
                                </>
                        : null
                }
                <Text style={{ color: "white", fontWeight: "bold", textAlign: "center", fontSize: 18, marginTop: 15 }}>REFEREES ({this.props.referees.length})</Text>
                {
                    this.props.referees.map((referee, index) => {  // for every active referee in league
                        const dateAccepted = new Date(referee.dateAccepted);

                        return (
                            <View key={referee.uid} style={{ marginTop: 15, borderRadius: 10, paddingTop: 5, width: "90%", marginLeft: "5%", backgroundColor: "#086134" }}>
                                <Text style={{ color: "white", textAlign: "center", fontWeight: "bold", fontSize: 18 }}>{referee.name}</Text>
                                <View style={{ flexDirection: "row", marginLeft: "auto", marginRight: "auto", paddingVertical: 8 }}>
                                    <Text style={{ color: "white" }}>Ref Since: {dateAccepted.getDate()}</Text>
                                    <Text style={{ color: "white", fontSize: 10 }}>{ordinals[Number(String(dateAccepted.getDate()).slice(-1))]} </Text>
                                    <Text style={{ color: "white" }}>{month[dateAccepted.getMonth()]} {dateAccepted.getFullYear()}</Text>
                                </View>
                                <Button mode="contained" color="red" style={{ borderRadius: 0, borderBottomRightRadius: 10, borderBottomLeftRadius: 10 }} onPress={() => this.rejectApplication(referee.id, false)}>
                                    REMOVE
                                </Button>
                            </View>
                        )
                    })
                }
            </>      
        )
    }
}

const styles = StyleSheet.create({
    line: {
        width: "70%",
        marginLeft: "auto",
        marginRight: "auto",
        height: 1,
        borderRadius: 100
    }
})

export default Referees