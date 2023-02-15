import React, { Component } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';

import { db, auth } from "../Auth/FirebaseInit"
import FeedTeamKit from './FeedTeamKit';
import FeedTwoTeamKit from './FeedTwoTeamKit';
import FeedText from "./FeedText"

/**
 * Gets every individual feed posted to it, to then send to
 * the relevent component to deal with the event depending on the
 * type it is. Current events:
 * 
 * New Referee
 * Season Started
 * New Team
 * Points Shared
 * WinStreak
 * Winless Drought Ends  
 * Match Winners            
 * Milestone                
 * TODO: Season Ended    
 * TODO: Promotion & Relegation
 * 
 * @author Adam Lyon W19023403
 */
class Post extends Component {

    likePost = () => {
        this.props.likePost(this.props.post, this.props.keyValue)
    }

    /**
     * Render base template of the feed component allow liking,
     * and call relevent child component to deal with output
     * of event
     */
    render() {
        /**
         * @var timeDifference integer Timestamp difference between the curent time and when the event occured
         * @var dayDifference integer How many days are in the @var timeDifference variable
         */
        let timeDifference =  new Date().getTime() - this.props.post.created
        let dayDifference = Math.floor(timeDifference / (1000 * 3600 * 24))
        return (
            <View style={styles.container}>
                <Text style={{ borderWidth: .75, borderTopLeftRadius: 12, borderTopRightRadius: 12, borderColor: "white", paddingLeft: 15, color: "white", fontWeight: "bold", textAlignVertical: "center", fontSize: 14 }}>{this.props.post.event.toUpperCase()}</Text>
                <View style={{ borderLeftWidth: .75, borderRightWidth: .75, borderColor: "white", paddingHorizontal: 10 }}>
                    {
                          (this.props.post.event === "WinStreak" || this.props.post.event === "Winless Drought Ends" || this.props.post.event === "Match Winners" || this.props.post.event === "Milestone" || this.props.post.event === "Season Ended" || this.props.post.event === "New Team")
                        ? <FeedTeamKit post={this.props.post} navigation={this.props.navigation} />
                        : (this.props.post.event === "Points Shared")
                        ? <FeedTwoTeamKit post={this.props.post} navigation={this.props.navigation} />
                        : (this.props.post.event === "New Referee" || this.props.post.event === "Season Started" || this.props.post.event === "Promotion & Relegation")
                        ? <FeedText post={this.props.post} navigation={this.props.navigation} />
                        : null
                    }
                </View>
                <View style={{ borderWidth: .75, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, borderColor: "white", flexDirection: "row" }}>
                    <TouchableOpacity onPress={this.likePost} style={{ flexDirection: "row" }}>
                        <Image style={{ marginLeft: 15, width: 28, height: 28, tintColor: "white" }} source={ (!this.props.post.likes.includes(auth.currentUser.uid)) ? require("../../assets/images/icons/feed/thumb-up-outline.png") : require("../../assets/images/icons/feed/thumb-up.png")} />
                        <Text style={{ color: "white", textAlignVertical: "center", fontSize: 14, marginLeft: 5 }}>{this.props.post.likes.length}</Text>
                    </TouchableOpacity>
                    
                    <Text style={{ paddingRight: 80, color: "white", textAlignVertical: "center", fontSize: 12, textAlign: "right", width: "100%" }}>{dayDifference} DAY{ dayDifference !== 1 ? "S" : ""} AGO</Text>
                </View>
                
            </View>
        )
    }
}

const styles = StyleSheet.create({
	container: {
		width: "80%",
        marginLeft: "10%",
        marginVertical: 5,
        backgroundColor: "#086134",
        borderRadius: 12
	}
})

export default Post