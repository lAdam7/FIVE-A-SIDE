import React, { Component } from "react"
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from "react-native"

import Header from "../Utility/Header"
import Kit from "../Utility/Kit"
import { KIT_STYLE } from "./KitData"

/**
 * Selecting a kit for a team, takes prop
 * of usedKits not allowing user to select any
 * kit indexs in that array, to stop teams in the
 * same division having duplicate kits
 * 
 * @author Adam Lyon W19023403
 */
class SelectKits extends Component {
    constructor(props) {
        super(props)
    }

    /**
     * Once kit selected, verify it's not currently used
     * in the division and return the selected kit
     * 
     * @param index integer Kit index
     */
    kitSelected = (index) => {
        if (!this.props.usedKits.find(k => k.kitId === index)) {
            this.props.changeKit(index)
        }
    }

    render() {
        /**
         * For every kit style allowed, render the kit add background
         * colour of red if it's currently being used by a team
         */
        let kits = KIT_STYLE.map((kit, index) => 
            <TouchableOpacity key={index} activeOpacity={1} style={[styles.kitContainer, { borderRadius: 20, backgroundColor: (this.props.usedKits.find(k => k.kitId === index) ? "red" : "none") }]} onPress={() => this.kitSelected(index)}>
                <Kit
                    kitLeftLeft={kit.kitLeftLeft}
                    kitLeft={kit.kitLeft}
                    kitMiddle={kit.kitMiddle}
                    kitRight={kit.kitRight}
                    kitRightRight={kit.kitRightRight}
                    numberColor={kit.numberColor}
                    kitNumber={kit.kitNumber}
                />
                <Text style={{ color: "white", textAlign: "center", fontSize: 11 }}>{this.props.usedKits.find(k => k.kitId === index) ? "ALREADY USED" : null}</Text>
            </TouchableOpacity>
        )
               
        /** Render all kits with header at top of screen */
        return (
            <ScrollView style={{ padding: 20, position: "absolute", backgroundColor: "red", width: "80%", bottom: 60, marginLeft: "10%", borderRadius: 15, backgroundColor: "#21A361", maxHeight: "65%"}}>
                <Header title={"CHOOSE KIT"} marginTop={0} color={"white"} />
                <View style={styles.kitFrame}>
                    {kits}
                </View>
                
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    kitFrame: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center"
    },
	kitContainer: {
		width: 110,
        marginVertical: 10
	}
})

export default SelectKits