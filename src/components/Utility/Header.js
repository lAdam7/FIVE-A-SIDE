import React, { Component } from "react"
import { View, Text, StyleSheet, StatusBar } from "react-native"

/**
 * Text at top of screen that is utilzied by multiple
 * components for a top Header with a line below the text
 * 
 * @author Adam Lyon W19023403
 */
class Header extends Component {
    render() {
        return (
            <View style={styles.container}>
                <Text style={[styles.title, { color: this.props.color, marginTop: (this.props.marginTop !== undefined) ? this.props.marginTop : StatusBar.currentHeight*2 }]}>{this.props.title}</Text>
                {
                    (this.props.showUnderline !== undefined && !this.props.showUnderline)
                    ? null
                    : <View style={[styles.line, { backgroundColor: this.props.color }]}></View>
                } 
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        backgroundColor: "#21A361"
    },
    title: {
        textAlign: "center",
        fontSize: 36,
        fontWeight: "bold"
    },
    line: {
        width: "80%",
        marginLeft: "auto",
        marginRight: "auto",
        height: 3,
        borderRadius: 100
    }
})

export default Header