import { watchPositionAsync } from 'expo-location';
import React, { Component } from 'react';
import { View, StyleSheet, StatusBar, ScrollView, ActivityIndicator, Text } from 'react-native';

import { auth, db, firebase } from "../Auth/FirebaseInit"
import Header from "../Utility/Header"
import Post from './Post';

/**
 * Initial feed screen, get all the relevent feed related to the user
 * and the leagues/teams they've joined and pass to the Post component
 * 
 * @author Adam Lyon W19023403
 */
class Feed extends Component {
    constructor(props) {
        super(props)
        this.state = {
            feed: null,

            user: null
        }
    }

    /** Refresh feed on every visit to the feed screen */
    componentDidMount() {
        if (this.props.navigation !== undefined) {
            this.navigationSubscription = this.props.navigation.addListener("focus", this.getFeed);
            this.setState({ user: auth.currentUser.uid })
        }
    }

    /** Get all feed data, relevent to the users joined league/team */
    getFeed = () => {
        db
        .collectionGroup("Feed")
        .where("TeamIDs", "array-contains-any", ["dWvevvnts1UQnjNdWsGGCdi2VtD3"])
        .orderBy("created", "desc")
        .get()
        .then(snapshot => {
            let feed = snapshot.docs.map(doc => {
                const div = doc.ref.parent.parent.id
                const feedID = doc.id
                return { ...doc.data(), div, feedID }
            })
            this.setState({ feed: feed })  
        })
    }

    likePost = (post, key) => {
        if (post.likes.includes(auth.currentUser.uid)) {
            db
            .collection("Leagues")
            .doc(post.leagueID)
            .collection("Divisions")
            .doc(post.div)
            .collection("Feed")
            .doc(post.feedID)
            .update({
                likes: firebase.firestore.FieldValue.arrayRemove(auth.currentUser.uid)
            })
            .then(() => {
                let posts = [...this.state.feed]
                posts[key].likes.splice(posts[key].likes.indexOf(auth.currentUser.uid), 1)
                this.setState({ feed: posts })
            })
        } else {
            db
            .collection("Leagues")
            .doc(post.leagueID)
            .collection("Divisions")
            .doc(post.div)
            .collection("Feed")
            .doc(post.feedID)
            .update({
                likes: firebase.firestore.FieldValue.arrayUnion(auth.currentUser.uid)
            })
            .then(() => {
                let posts = [...this.state.feed]
                posts[key].likes.push(auth.currentUser.uid)
                this.setState({ feed: posts })
            })
        }
    }

    /** 
     * Pass all feed data to the post component
     * show loading screen if no data has been gathered
     * yet
     */
    render() {
        return (
            <View style={styles.container}>
                <Header color={"white"} title={"FEED"} marginTop={StatusBar.currentHeight+5} />
				{
                    (this.state.feed !== null && this.state.feed.length > 0)
                    ? 
                        <ScrollView style={{ width: "90%", marginLeft: "5%", marginBottom: 10 }} showsVerticalScrollIndicator={false}>
                            {
                                this.state.feed.map((post, index) => { return (
                                    <Post
                                        likePost={this.likePost}
                                        navigation={this.props.navigation}
                                        key={index}
                                        keyValue={index}
                                        post={post}
                                    />
                                )})
                            }
                        </ScrollView>
                    : (this.state.feed !== null && this.state.feed.length === 0)
                        ? <Text style={{ color: "white", textAlign: "center", fontSize: 18, marginLeft: "auto", marginRight: "auto", marginTop: 45 }}>You have no recent feed!</Text>
                        : <ActivityIndicator style={{ flex: 1 }} size={100} color={"white"} />
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#21A361",
		flex: 1
	}
})

export default Feed