import React from "react"
import { LogBox } from "react-native"
import CoreStackNavigator from "./src/components/Navigation/CoreStackNavigator"

import { Provider as StoreProvider } from "react-redux"
import { Provider as PaperProvider } from "react-native-paper"
import configureStore from "./src/redux/store"
const store = configureStore()

LogBox.ignoreLogs(['Setting a timer', 'Warning: Failed prop'])

import Authentication from "./src/components/Auth/Authentication"
import GetLocation from "./src/components/Auth/GetLocation"

/** @method Authentication Check the user status if they're logged in, logged out or requiring email verification */
Authentication( store )

/** @method GetLocation Get user location if prompt and store in the redux store for later access  */
GetLocation( store )

import * as WebBrowser from "expo-web-browser"
WebBrowser.maybeCompleteAuthSession()

/**
 * App initialization / start-up
 * 
 * Set-up navigation adding the Tab navigation options set in TabNavigation.js
 * then add other navigation optons below that don't appear in the tab navigaiton
 * but still need to be navigatable from other areas within the app
 * 
 * @author Adam Lyon W19023403
 */
export default function App() {
	return (
		<StoreProvider store={store}>
			<PaperProvider>
				<CoreStackNavigator store={store} />
			</PaperProvider>
		</StoreProvider>
	)
}