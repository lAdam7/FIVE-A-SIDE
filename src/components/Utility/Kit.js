import React, { Component } from "react"
import { View, Text, StyleSheet, Image } from "react-native"

/**
 * Create a football kit with the colours passed through props
 * each image represents 1/5 of a kit in downwards stripes to
 * allow for various kit colours and add the kit number to the
 * shirt passed through the prop with the colour also passed
 * 
 * @author Adam Lyon W19023403
 */
class Kit extends Component {
	render() {
		return (
			<View>
				<View style={styles.container}>
					<Image 
						style={{ tintColor: this.props.kitLeftLeft, width: (this.props.width !== undefined) ? this.props.width : 20, height: (this.props.height !== undefined) ? this.props.height : 125}} 
						resizeMode="stretch" 
						source={require('../../assets/images/kit/kit-left-left.png')} 
					/>
					<Image 
						style={{ tintColor: this.props.kitLeft, width: (this.props.width !== undefined) ? this.props.width : 20, height: (this.props.height !== undefined) ? this.props.height : 125}} 
						resizeMode='stretch' 
						source={require('../../assets/images/kit/kit-left.png')} 
					/>
					<Image 
						style={{ tintColor: this.props.kitMiddle, width: (this.props.width !== undefined) ? this.props.width : 20, height: (this.props.height !== undefined) ? this.props.height : 125}} 
						resizeMode='stretch' 
						source={require('../../assets/images/kit/kit-middle.png')} 
					/>
					<Image 
						style={{ tintColor: this.props.kitRight, width: (this.props.width !== undefined) ? this.props.width : 20, height: (this.props.height !== undefined) ? this.props.height : 125}} 
						resizeMode='stretch' 
						source={require('../../assets/images/kit/kit-right.png')} 
					/>
					<Image 
						style={{ tintColor: this.props.kitRightRight, width: (this.props.width !== undefined) ? this.props.width : 20, height: (this.props.height !== undefined) ? this.props.height : 125}} 
						resizeMode='stretch' 
						source={require('../../assets/images/kit/kit-right-right.png')} 
					/>
					<Text style={{ color: this.props.numberColor, position: "absolute", fontWeight: "bold", fontSize: (this.props.fontSize !== undefined) ? this.props.fontSize : 55 }}>{this.props.kitNumber}</Text>
				</View>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		padding: 2,
		justifyContent: "center",
		alignItems: "center"
	}
})

export default Kit