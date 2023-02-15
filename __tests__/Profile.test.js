import React from "react"
import { fireEvent, render } from "@testing-library/react-native"
import { Provider } from "react-redux"
import configureStore from "../src/redux/store"
import { act } from "react-test-renderer"

import { LOGGED_IN_ACTION } from '../src/redux/actions/authenticate'
import Profile from "../src/components/Profile/Profile"

const store = configureStore()

jest.mock("firebase/compat/app", () => {
	const firestore = {
		collection: jest.fn(() => { return { doc: jest.fn(() => { return { get: jest.fn(() => { return { then: jest.fn(() => { return { catch: jest.fn(() => { return null }) } }) } }) } }) } })
	};
	return {
		apps: ["A"],
		initializeApp: jest.fn(() => null),
		auth: jest.fn(() => { return { currentUser: true } }),
		firestore: jest.fn(() => { return firestore }),
		functions: jest.fn(() => { return true })
	}
})

describe("Checking Profile component renders", () => {

	it("Component renders", () => {
		render(
			<Provider store={store}>
				<Profile />  
			</Provider>
		)
	})
	
	it("Content shouldn't be displayed if the user is logged out", () => {
		const renderer = 
			render(
				<Provider store={store}>
					<Profile />  
				</Provider>
			)
		expect(renderer.getByTestId("no-content")).toBeTruthy()
        
		act(() => {
			store.dispatch(LOGGED_IN_ACTION(true))
		})					

		expect(renderer.getByTestId("profile")).toBeTruthy()
	})
})