import React from "react"
import { fireEvent, render } from "@testing-library/react-native"
import { Provider } from "react-redux"
import configureStore from "../src/redux/store"

import Register from "../src/components/Auth/Register"

const store = configureStore()

describe("Checking Register component renders", () => {
    it("Component renders", () => {
		render(
            <Provider store={store}>
                <Register />
            </Provider>
		)
	})

    it("submitting blank email", () => {
        const renderer =
            render(
                <Provider store={store}>
                    <Register />
                </Provider>
            )
        fireEvent.changeText(renderer.getByTestId("username"), "username holder")
        fireEvent.changeText(renderer.getByTestId("password-input"), "TestTest")
        fireEvent.changeText(renderer.getByTestId("confirm-password-input"), "TestTest")
        
        fireEvent.press(renderer.getByText("REGISTER"))

        expect(renderer.queryByText("Should not be empty")).not.toBeNull()
    })

    it("submitting invalid email address format", () => {
        const renderer =
            render(
                <Provider store={store}>
                    <Register />
                </Provider>
            )
        
        fireEvent.changeText(renderer.getByTestId("email-input"), "dasd@gmail")
        fireEvent.changeText(renderer.getByTestId("password-input"), "TestTest")
        fireEvent.changeText(renderer.getByTestId("confirm-password-input"), "TestTest")
        
        fireEvent.press(renderer.getByText("REGISTER"))

        expect(renderer.queryByText("Not a valid email address")).not.toBeNull()
    })

    it("submitting blank username", () => {
        const renderer =
            render(
                <Provider store={store}>
                    <Register />
                </Provider>
            )
        fireEvent.changeText(renderer.getByTestId("email-input"), "test@gmail.com")
        fireEvent.changeText(renderer.getByTestId("password-input"), "TestTest")
        fireEvent.changeText(renderer.getByTestId("confirm-password-input"), "TestTest")
        
        fireEvent.press(renderer.getByText("REGISTER"))

        expect(renderer.queryByText("Should not be empty")).not.toBeNull()
    })

    it("Less than 6 character username", () => {
        const renderer =
            render(
                <Provider store={store}>
                    <Register />
                </Provider>
            )
        
        fireEvent.changeText(renderer.getByTestId("email-input"), "test@gmail.com")
        fireEvent.changeText(renderer.getByTestId("username"), "usern")
        fireEvent.changeText(renderer.getByTestId("password-input"), "TestTest")
        fireEvent.changeText(renderer.getByTestId("confirm-password-input"), "TestTest")
        
        fireEvent.press(renderer.getByText("REGISTER"))

        expect(renderer.queryByText("Should be at least 6 characters")).not.toBeNull()
    })

    it("No password input", () => {
        const renderer =
            render(
                <Provider store={store}>
                    <Register />
                </Provider>
            )
        
        fireEvent.changeText(renderer.getByTestId("email-input"), "test@gmail.com")
        fireEvent.changeText(renderer.getByTestId("username"), "username holder")
        fireEvent.changeText(renderer.getByTestId("confirm-password-input"), "TestTest")
        
        fireEvent.press(renderer.getByText("REGISTER"))

        expect(renderer.queryByText("Should not be empty")).not.toBeNull()
    })

    it("Less than 6 character password", () => {
        const renderer =
            render(
                <Provider store={store}>
                    <Register />
                </Provider>
            )
        
        fireEvent.changeText(renderer.getByTestId("email-input"), "test@gmail.com")
        fireEvent.changeText(renderer.getByTestId("username"), "username holder")
        fireEvent.changeText(renderer.getByTestId("password-input"), "Testt")
        fireEvent.changeText(renderer.getByTestId("confirm-password-input"), "Testt")
        
        fireEvent.press(renderer.getByText("REGISTER"))

        expect(renderer.queryByText("Should be at least 6 characters")).not.toBeNull()
    })

    it("Empty confirm password", () => {
        const renderer =
            render(
                <Provider store={store}>
                    <Register />
                </Provider>
            )
        
        fireEvent.changeText(renderer.getByTestId("email-input"), "test@gmail.com")
        fireEvent.changeText(renderer.getByTestId("username"), "username holder")
        fireEvent.changeText(renderer.getByTestId("password-input"), "TestTest")
        
        fireEvent.press(renderer.getByText("REGISTER"))

        expect(renderer.queryByText("Repeat new password")).not.toBeNull()
    })

    it("Password and confirm password different values", () => {
        const renderer =
            render(
                <Provider store={store}>
                    <Register />
                </Provider>
            )
        
        fireEvent.changeText(renderer.getByTestId("email-input"), "test@gmail.com")
        fireEvent.changeText(renderer.getByTestId("username"), "username holder")
        fireEvent.changeText(renderer.getByTestId("password-input"), "TestTesta")
        fireEvent.changeText(renderer.getByTestId("confirm-password-input"), "TestTest")
        
        fireEvent.press(renderer.getByText("REGISTER"))

        expect(renderer.queryByText("Password does not match")).not.toBeNull()
    })

    it("submitting correctly formated data, no error message", () => {
        const renderer =
            render(
                <Provider store={store}>
                    <Register />
                </Provider>
            )
        
        fireEvent.changeText(renderer.getByTestId("email-input"), "w19023403@northumbria.ac.uk")
        fireEvent.changeText(renderer.getByTestId("username"), "username holder")
        fireEvent.changeText(renderer.getByTestId("password-input"), "TestTest")
        fireEvent.changeText(renderer.getByTestId("confirm-password-input"), "TestTest")
        
        fireEvent.press(renderer.getByText("REGISTER"))
        
        expect(renderer.queryAllByText("Should not be empty")).toHaveLength(0)
        expect(renderer.queryByText("Not a valid email address")).toBeNull()
        expect(renderer.queryByText("Should be at least 6 characters")).toBeNull()
        expect(renderer.queryByText("Repeat new password")).toBeNull()
        expect(renderer.queryByText("Password does not match")).toBeNull()
    })

})