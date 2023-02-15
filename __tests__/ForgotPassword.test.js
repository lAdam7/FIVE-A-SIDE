import React from "react"
import { fireEvent, render } from "@testing-library/react-native"
import { Provider } from "react-redux"
import configureStore from "../src/redux/store"

import ForgotPassword from "../src/components/Auth/ForgotPassword"

const store = configureStore()

describe("Checking ForgotPasword component renders", () => {
    it("Component renders", () => {
		render(
            <Provider store={store}>
                <ForgotPassword />
            </Provider>
		)
	})

    it("submitting blank email", () => {
        const renderer =
            render(
                <Provider store={store}>
                    <ForgotPassword />
                </Provider>
            )
        
        fireEvent.press(renderer.getByText("RESET"))

        expect(renderer.queryByText("Should not be empty")).not.toBeNull()
    })

    it("submitting invalid email address format", () => {
        const renderer =
            render(
                <Provider store={store}>
                    <ForgotPassword />
                </Provider>
            )
        
        fireEvent.changeText(renderer.getByTestId("email-input"), "dasd@.com")
        
        fireEvent.press(renderer.getByText("RESET"))

        expect(renderer.queryByText("Not a valid email address")).not.toBeNull()
    })

    it("submitting correctly formated data, no error message", () => {
        const renderer =
            render(
                <Provider store={store}>
                    <ForgotPassword />
                </Provider>
            )
        
        fireEvent.changeText(renderer.getByTestId("email-input"), "w19023403@northumbria.ac.uk")

        fireEvent.press(renderer.getByText("RESET"))
        
        expect(renderer.queryAllByText("Should not be empty")).toHaveLength(0)
        expect(renderer.queryByText("Not a valid email address")).toBeNull()
    })

})