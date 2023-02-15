import React, { Component } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Button, TextInput, Switch } from "react-native-paper"

import { db, auth } from "../Auth/FirebaseInit"
import Header from '../Utility/Header';
import DropDown from "../Utility/DropDown"
import SelectKits from './SelectKits';
import Kit from '../Utility/Kit';
import { KIT_STYLE } from './KitData';

/**
 * Creating a team within a league, choose team name,
 * team abbreviation, request to join boolean, select kit style
 * and choose the team owners kit number, create the team and
 * add the team owner as a member
 * 
 * @author Adam Lyon W19023403
 */
class CreateTeam extends Component {
    constructor(props) {
        super(props)
        this.state = {
            teamName: "",
            teamNameErrorMessage: null,
            teamNameUnderline: "white",

            teamAbbreviation: "",
            teamAbbreviationErrorMessage: null,
            teamAbbreviationUnderline: "white",

            kitNumber: 1,

            division: "1",
            valueDivision: [],

            valueMembers: null,

            requestToJoin: false,

            selectingKits: false,
            showKitNumbers: false,
            usedKits: [],
            kitIndex: 0
        }
        this.setValueMembers = this.setValueMembers.bind(this)
        this.selectingKits = this.selectingKits.bind(this)
    }

    /**
     * Get all teams of the selected division, and iterate through the kits
     * adding them to a usedKits array if it's already in use by a team in the
     * same division
     * 
     * @param division string The selected division the user is looking at
     */
    getTeams = (division) => {
        db
        .collection("Leagues")
        .doc(this.props.leagueID)
        .collection("Divisions")
        .doc(division)
        .collection("Teams")
        .get()
        .then(snapshot => {
            let usedKits = snapshot.docs.map(doc => {
                
                return { kitId: doc.data().kit, abbreviation: doc.data().abbreviation, name: doc.data().name }
            })
            let kitID = 0;
            for (let i = 0; i < KIT_STYLE.length; i++) {
                if (!usedKits.find(kit => kit.kitId === i)) {
                    kitID = i
                    break
                }
            }
            this.setState({ usedKits: usedKits, kitIndex: kitID })
        })
    }

    /**
     * First render of screen, get teams for first division, add divisons to an
     * array for a drop-down between different divisions
     */
    componentDidMount() {
        this.getTeams("1")
        
        let divisions = []
        for (let i = 0; i < this.props.divisions; i++) {
            divisions.push((i+1).toString())
        }
        this.setState({ valueDivision: divisions })
    }

    /**
     * @param value integer Max members that can join the team
     */
    setValueMembers = (value) => {
        this.setState({ valueMembers: value })
    }
    /**
     * @param value string The division to display within the league
     */
    setValueDivision = (value) => {
        if (value !== this.state.division) {
            this.getTeams(value)
            this.setState({ division: value })
        }    
    }
    /**
     * Toggle request to join boolean when selected
     */
    requestToJoinEnabled = () => {
        this.setState({ requestToJoin: !this.state.requestToJoin })
    }
    /**
     * To render the kit selecting UI
     */
    selectingKits = () => {
        this.setState({ selectingKits: !this.state.selectingKits })
    }
    /** 
     * To Render the number selection UI
     */
    selectKitNumber = () => {
        this.setState({ showKitNumbers: !this.state.showKitNumbers })
    }
    /**
     * User selected kit number, save to state and un-render the
     * select kit number UI
     * 
     * @param num integer Kit number selected
     */
    numberSelected = (num) => {
        this.setState({ kitNumber: num, showKitNumbers: false })
    }
    /**
     * User selected the kit style and un-render the
     * select kit style UI
     * 
     * @param index integer Kit style selected index of array
     */
    kitIndex = (index) => {
        this.setState({ kitIndex: index, selectingKits: false })
    }
    /**
     * Text input changed, update state variable
     * 
     * @param value string team name
     */
    teamNameChanged = (value) => {
        this.setState({ teamName: value })
    }
    teamNameLostFocus = () => {
        if (this.state.teamName.length === 0) { // nothing entered
            this.setState({ teamNameErrorMessage: "Should not be empty", teamNameUnderline: "red" })
            return true
        } else {
            if (this.state.teamName.length < 6) { // nothing entered
                this.setState({ teamNameErrorMessage: "Should be at least 6 characters", teamNameUnderline: "red" })
                return true
            } else if (this.state.usedKits.find(data => data.name === this.state.teamName)) { // duplicate team name
                this.setState({ teamNameErrorMessage: "Team name already in use", teamNameUnderline: "red" })
                return true
            } else {
                this.setState({ teamNameErrorMessage: null, teamNameUnderline: "white" })
            }
        }
        return false
    }
    /**
     * Text input changed, update state variable
     * 
     * @param value string team abbreviation
     */
    teamAbbChanged = (value) => {
        this.setState({ teamAbbreviation: value.toUpperCase() })
    }
    teamAbbLostFocus = () => {
        if (this.state.teamAbbreviation.length !== 3) { // nothing entered
            this.setState({ teamAbbreviationErrorMessage: "Should be 3 characters", teamAbbreviationUnderline: "red" })
            return true
        } else if (this.state.usedKits.find(data => data.abbreviation === this.state.teamAbbreviation)) { // duplicate team name
            this.setState({ teamAbbreviationErrorMessage: "Team abbreviation already in use", teamAbbreviationUnderline: "red" })
            return true
        } else {
            this.setState({ teamAbbreviationErrorMessage: null, teamAbbreviationUnderline: "white" })
        }
        return false
    }

    /**
     * Once the team has been created,
     * add the team owner as a member
     */
    addMember = () => {
        db
        .collection("Leagues")
        .doc(this.props.leagueID)
        .collection("Divisions")
        .doc(this.state.division)
        .collection("Teams")
        .doc(auth.currentUser.uid)
        .collection("Members")
        .doc(auth.currentUser.uid)
        .set({
            number: this.state.kitNumber,
            goalsScored: 0,
            matchesPlayed: 0,
            minutesPlayed: 0,
            displayName: auth.currentUser.displayName,
            created: new Date().getTime(),
            uid: auth.currentUser.uid
        })
        .then(() => {
            Alert.alert( // Let the user know an email has sucessfully been sent
                "TEAM CREATED",
                "Your team has been created / or is waiting for approval from the league owner!"
            )
            this.props.getAllData()
            this.props.goBack()
        })
        .catch((error) => {
            console.log(error)
        })
    }
    
    /**
     * Create the team with the given
     * parameters from user, then call 
     * addMember method
     */
    createTeam = () => {
        const teamNameCheck = this.teamNameLostFocus()
        const teamAbbCheck = this.teamAbbLostFocus()

        if (!teamNameCheck && !teamAbbCheck) {
            db
            .collection("Leagues")
            .doc(this.props.leagueID)
            .collection("Divisions")
            .doc(this.state.division) 
            .collection("Teams")
            .doc(auth.currentUser.uid)
            .set({
                name: this.state.teamName,
                abbreviation: this.state.teamAbbreviation,
                requestToJoin: this.state.requestToJoin,
                kit: this.state.kitIndex,
                memberCount: 0,
                maxMembers: this.state.valueMembers,
                created: new Date().getTime(),
                standingPosition: 0,
                nextEvent: 0
            })
            .then(() => { // team created, add member
                this.addMember()
            })
            .catch((error) => {
                console.log(error)
            })
        }
    }

    render() {
        /**
         * Render the inputs required for creating a team,
         * rendering the kit number selection and kit style
         * selection when the corresponding buttons are pressed
         */
        return (
            <>
                {
                    (!this.state.selectingKits) // Not selecting a kit style
                        ?
                            <ScrollView style={{ padding: 20, position: "absolute", backgroundColor: "red", width: "80%", bottom: 60, marginLeft: "10%", borderRadius: 15, backgroundColor: "#21A361", height: "80%"}}>
                                <Header title={"CREATE TEAM"} marginTop={0} color={"white"} />
                                {
                                    (this.props.divisions !== 1) // division to join
                                        ? <DropDown title={"Division?"} options={this.state.valueDivision} default={this.state.division} setDropdownValue={this.setValueDivision} />
                                        : null
                                }
                                
                                <TextInput
                                    testID='team-name-input'
                                    label="Team Name"
                                    selectionColor='white'
                                    underlineColor={this.state.teamNameUnderline}
                                    activeUnderlineColor={this.state.teamNameUnderline}
                                    backgroundColor="#21A361"
                                    style={{ width: "80%", marginLeft: "10%" }}
                                    theme={{ colors: { text: "white", placeholder: "white" } }}
                                    maxLength={30}
                                    value={this.state.teamName}
                                    right={<TextInput.Affix text={this.state.teamName.length + "/30"} textStyle={{ color: "white" }} />}
                                    onChangeText={this.teamNameChanged}
                                    onBlur={this.teamNameLostFocus}
                                    blurOnSubmit={false}
                                />
                                <Text style={{ marginLeft: "10%", color: "red", padding: 0 }}>{ this.state.teamNameErrorMessage }</Text>
            
                                <TextInput
                                    testID='team-abbreviation-input'
                                    label="Team Abbreviation"
                                    selectionColor='white'
                                    underlineColor={this.state.teamAbbreviationUnderline}
                                    activeUnderlineColor={this.state.teamAbbreviationUnderline}
                                    backgroundColor="#21A361"
                                    style={{ width: "80%", marginLeft: "10%" }}
                                    theme={{ colors: { text: "white", placeholder: "white" } }}
                                    maxLength={3}
                                    value={this.state.teamAbbreviation}
                                    onChangeText={this.teamAbbChanged}
                                    onBlur={this.teamAbbLostFocus}
                                    right={<TextInput.Affix text={this.state.teamAbbreviation.length + "/3"} textStyle={{ color: "white" }} />}
                                    blurOnSubmit={false}
                                />
                                <Text style={{ marginLeft: "10%", color: "red", padding: 0 }}>{ this.state.teamAbbreviationErrorMessage }</Text>
            
                                <View style={{flexDirection: "row", alignItems: "center", marginLeft: "10%"}}>
                                    <Text style={{color: "white"}}>Request to Join</Text>
                                    <Switch value={this.state.requestToJoin} onValueChange={this.requestToJoinEnabled} color="#0000FF" />
                                </View>
            
                                <DropDown title={"Max Members?"} options={[5, 6, 7, 8, 9, 10, 11, 12]} default={8} setDropdownValue={this.setValueMembers} />
                                <Button
                                    onPress={this.selectKitNumber}
                                >
                                    SET KIT NUMBER
                                </Button>
                                {
                                    this.state.showKitNumbers // show kit numbers
                                        ? 
                                            <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "center"}}>
                                                { 
                                                    /** Render all kit numbers from 1 to 99 */
                                                    [...Array(99)].map((e, i) =>
                                                        <TouchableOpacity key={"kit" + i} activeOpacity={1} onPress={() => this.numberSelected(i+1)}>
                                                            <Text style={{ fontWeight: "bold", backgroundColor: "#19804c", color: "white", margin: 5, height: 30, width: 30, textAlign: "center", borderRadius: 10, textAlignVertical: "center" }}>{i+1}</Text>
                                                        </TouchableOpacity>
                                                    )
                                                }
                                            </View>
                                        : null
                                }
                                <Button
                                    onPress={this.selectingKits}
                                >
                                    SET KIT
                                </Button>
                                <View style={styles.kitContainer}>
                                    <Kit
                                        kitLeftLeft={KIT_STYLE[this.state.kitIndex].kitLeftLeft}
                                        kitLeft={KIT_STYLE[this.state.kitIndex].kitLeft}
                                        kitMiddle={KIT_STYLE[this.state.kitIndex].kitMiddle}
                                        kitRight={KIT_STYLE[this.state.kitIndex].kitRight}
                                        kitRightRight={KIT_STYLE[this.state.kitIndex].kitRightRight}
                                        numberColor={KIT_STYLE[this.state.kitIndex].numberColor}
                                        kitNumber={this.state.kitNumber}
                                    />
                                </View>
                                
                                <Button
                                    testID="createTeam"
                                    mode="contained"
                                    onPress={this.createTeam}
                                    style={{ marginBottom: 40, marginTop: 25 }}
                                >
                                    CREATE TEAM
                                </Button>
                            </ScrollView>

                            : <SelectKits changeKit={this.kitIndex} usedKits={this.state.usedKits} />
                }
            </> 
        )
    }
}

const styles = StyleSheet.create({
	kitContainer: {
		width: 110,
		marginLeft: "auto",
		marginRight: "auto"
	}
})

export default CreateTeam