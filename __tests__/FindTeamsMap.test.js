import React from "react"
import { fireEvent, render } from "@testing-library/react-native"

import { Provider } from "react-redux"
import configureStore from "../src/redux/store"
const store = configureStore()

import { LOGGED_IN_ACTION } from "../src/redux/actions/authenticate"

import FindTeamsMap from "../src/components/FindTeam/FindTeamsMap"
import { act } from "react-test-renderer"

jest.mock("firebase/compat/app", () => {
	return {
		apps: ["A"],
		initializeApp: jest.fn(() => null),
		auth: jest.fn(() => { return { currentUser: {uid: true} } }),
		firestore: jest.fn(() => { return { collectionGroup: jest.fn(() => { return { where: jest.fn(() => { return { get: jest.fn(() => { return { then: jest.fn(() => { return { catch: jest.fn(() => { return {} }) } } ) } }) } }) } }), collection: jest.fn(() => { return { get: jest.fn(() => { return { then: jest.fn(() => { return { catch: jest.fn(() => { return {} }) } }) } }) } }) } }),
		functions: jest.fn(() => { return true })
	}
})

describe("FindTeamsMapComponent component checking, including Login testing", () => {

	it("Component renders", () => {
		render(
			<Provider store={store}>
				<FindTeamsMap />  
			</Provider>
		)
	})

	it("LOGIN pressed, show Register/Login Component", () => {
		const renderer = 
			render(
				<Provider store={store}>
					<FindTeamsMap />  
				</Provider>
			)

		expect(renderer.getByText("LOGIN")).toBeTruthy()
		
		fireEvent.press(renderer.getByText("LOGIN"))				

		expect(renderer.getByTestId("email-input")).not.toBeNull()
		expect(renderer.getByTestId("password-input")).not.toBeNull()
		expect(renderer.getByText("Forgot Password")).not.toBeNull()
	})
})