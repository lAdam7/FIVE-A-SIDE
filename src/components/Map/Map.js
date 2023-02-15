import React, { Component } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

import MapView from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { connect } from "react-redux"

import { MAP_STYLE } from "./MapStyle"

/**
 * Create the app using the react-native-maps
 * importing the custom style generating in the 
 * MAP_STYLE value
 * 
 * @author Adam Lyon W19023403
 */
class Map extends Component {
	constructor(props) {
		super(props)
		this.state = {
			location: null
		}
	}

	render() {
		/** @param searchPlaces component Textbox for searching by location name with all stying and settings set */
		let searchPlaces = <GooglePlacesAutocomplete
			ref={c => this.googlePlacesAutocomplete = c}
			styles={{
				container: {
					position: "absolute",
					width: "80%",
					bottom: 32
				},
				textInput: {
					color: "white"
				},
				row: {
					backgroundColor: "#21A361"
				},
				description: {
					color: "white"
				}
			}}
			placeholder='Search'
			minLength={3}
			fetchDetails={true}
			onPress={(data, details = null) => {
				// 'details' is provided when fetchDetails = true
				let location = details.geometry.location
				let pos = {
					longitude: location.lng,
					latitude: location.lat,
					longitudeDelta: 0.06,
					latitudeDelta: 0.0421
				}
				this.googlePlacesAutocomplete.setAddressText("")
				this.setState({ location: pos })
			}}
			textInputProps={{
				returnKeyType: "search",
				borderRadius: 18,
				backgroundColor: "#21A361",
				placeholderTextColor: "white",
				selectionColor: "white"
			}}
			query={{
				key: 'AIzaSyBDxsfnLALKNPMeS62qqI7vWjn_T6mWooM',
				language: 'en',
			}}
			nearbyPlacesAPI="GooglePlacesSearch"
			debounce={200}
		/>
		
		/**
		 * Render the map and add search button if
		 * prop returns true
		 */
		return (
			<View style={styles.container}>
				<MapView 
					customMapStyle={MAP_STYLE}
					mapType="mutedStandard" 
					initialRegion={this.props.location} 
					showsPointsOfInterest={false} 
					showsBuildings={false} 
					style={styles.map}
					showsCompass={false}
					onRegionChange={this.props.regionChanged}
					onRegionChangeComplete={this.props.regionChanged}
					region={this.state.location}
					pitchEnabled={this.props.disabled}
					rotateEnabled={this.props.disabled}
					scrollEnabled={this.props.disabled}
					zoomEnabled={this.props.disabled}
					loadingEnabled={true}
					showsUserLocation={true}
					toolbarEnabled={false}
					onPress={this.props.mapPressed}
					
				>
					{ this.props.leagues }
				</MapView>
				{ // show search box
					(this.props.showSearch)
						? searchPlaces
						: null
				}
			</View>
		)
	}
}
/** Get user location, for initializing map */
const mapStateToProps = (state) => {
	return {
		location: state.locationReducer.location
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center'
	},
	map: {
		width: "100%",
		height: "100%",
		flex: 1
	}
})

export default connect(mapStateToProps) (Map);