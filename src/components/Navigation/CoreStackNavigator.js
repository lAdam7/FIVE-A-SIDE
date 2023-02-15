import React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import { NavigationContainer } from "@react-navigation/native"
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs"
import { Image } from "react-native"
import { useSelector } from "react-redux"

/** Main Components for the bottom navigation */
import FindTeamsMap from "../FindTeam/FindTeamsMap"
import MyTeams from "../MyTeams/MyTeams"
import Fixtures from "../Fixtures/Fixtures"
import Feed from "../Feed/Feed"
import Profile from "../Profile/Profile"
/** Sub-navigation for components above, sometimes requires to skip main component */
import CreateLeagueMap from "../CreateLeague/CreateLeagueMap"
import Team from "../MyTeams/Team"
import Match from "../MyTeams/Match/Match"
import Training from "../MyTeams/Team/Training/Training"
import ManageLeague from "../ManageLeague/ManageLeague"
import RefereeMatches from "../MyTeams/Match/Referee/RefereeMatches"
import RefereeMatch from "../MyTeams/Match/Referee/RefereeMatch"
import ChangePassword from "../Profile/ChangePassword"
import ViewDivisions from "../FindTeam/ViewDivisions"
import LeagueLocation from "../ManageLeague/LeagueLocation"
import TrainingMatch from "../MyTeams/Team/Training/TrainingMatch"

const ProfileStack = createStackNavigator()
/**
 * Profile navigator deals with creating, managing, change password and
 * changing league location
 */
function ProfileStackScreen() {
    return (
        <ProfileStack.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerShown: false
            }}
        >
            <ProfileStack.Screen name="Home" component={Profile} />
            <ProfileStack.Screen name="Create League" component={CreateLeagueMap} options={{ animationEnabled: false }} />
            <ProfileStack.Screen name="Manage League" component={ManageLeague} options={{ animationEnabled: false }} />
            <ProfileStack.Screen name="Change Password" component={ChangePassword} options={{ animationEnabled: false }} />
            <ProfileStack.Screen name="League Location" component={LeagueLocation} options={{ animationEnabled: false }} />
        </ProfileStack.Navigator>
    )
}

const TeamStack = createStackNavigator()
/**
 * Team navigator deals with viewing divisions, team, 
 * matches, refereeing matches and referee match
 */
function TeamStackScreen() {
    return (
        <TeamStack.Navigator
            initialRouteName="HomeTeam"
            screenOptions={{
                headerShown: false
            }}
        >
            <TeamStack.Screen name="HomeTeam" component={MyTeams} options={{ animationEnabled: false }} />
            <TeamStack.Screen name="View Divisions" component={ViewDivisions} options={{ animationEnabled: false }} />
            <TeamStack.Screen name="Team" component={Team} options={{ animationEnabled: false }} />
            <TeamStack.Screen name="Match" component={Match} options={{ animationEnabled: false }} />
            <TeamStack.Screen name="Referee Matches" component={RefereeMatches} options={{ animationEnabled: false }} />
            <TeamStack.Screen name="Referee Match" component={RefereeMatch} options={{ animationEnabled: false }} />
            <TeamStack.Screen name="Training" component={Training} options={{ animationEnabled: false }} />
            <TeamStack.Screen name="Training Match" component={TrainingMatch} options={{ animationEnabled: false }} />
        </TeamStack.Navigator>
    );
}

const Tab = createMaterialBottomTabNavigator()
/**
 * Main navigator render for tab (bottom navigation)
 */
const CoreStackNavigator = () => {
    const userLogged = useSelector(state => state.authenticateReducer.logged)
    return ( 
        <NavigationContainer>
			<Tab.Navigator 
                initialRouteName="Find Teams" 
                backBehavior="order" 
                barStyle={{ 
                    backgroundColor: "#21A361", 
                    height: 50, 
                    marginBottom: (userLogged) ? 0 : -50 
                }} 
            >
				<Tab.Screen 
                    name="Find Teams" 
                    component={FindTeamsMap} 
                    options={{ 
                        animationEnabled: false, 
                        headerShown: false, 
                        tabBarIcon: () => { return ( 
                            <Image style={{ width: 24, height: 24 }} source={ require("../../assets/images/icons/map-marker-radius.png") } />
                        )} 
                    }} 
                />
                <Tab.Screen 
                    name="My Teams" 
                    component={TeamStackScreen} 
                    options={{ 
                        animationEnabled: false, 
                        headerShown: false, 
                        tabBarIcon: () => { return ( 
                            <Image style={{ width: 24, height: 24 }} source={ require("../../assets/images/icons/account-group.png") } /> 
                        )} 
                    }} 
                />
                <Tab.Screen 
                    name="Fixtures" 
                    component={Fixtures} 
                    options={{ 
                        animationEnabled: false, 
                        headerShown: false, 
                        tabBarIcon: () => { return ( 
                            <Image style={{ width: 24, height: 24 }} source={ require("../../assets/images/icons/calendar.png") } /> 
                        )} 
                    }} 
                />
                <Tab.Screen 
                    name="Feed" 
                    component={Feed} 
                    options={{ 
                        animationEnabled: false, 
                        headerShown: false, 
                        tabBarIcon: () => { return ( 
                            <Image style={{ width: 24, height: 24 }} source={ require("../../assets/images/icons/newspaper-variant-outline.png") } /> 
                        )} 
                    }} 
                />
                <Tab.Screen 
                    name="Profile" 
                    component={ProfileStackScreen} 
                    options={{ 
                        animationEnabled: false, 
                        headerShown: false, 
                        tabBarIcon: () => { return ( 
                            <Image style={{ width: 24, height: 24 }} source={ require("../../assets/images/icons/account.png") } /> 
                        )} 
                    }} 
                /> 
			</Tab.Navigator>
		</NavigationContainer>
    )
}

export default CoreStackNavigator