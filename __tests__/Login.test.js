import React from "react"
import { fireEvent, render } from "@testing-library/react-native"

import Login from "../src/components/Auth/Login"

describe("Checking Login component renders", () => {
    it("Component renders", () => {
		render(
			<Login />
		)
	})
    
    it("submitting blank email", () => {
        const renderer =
            render(
                <Login />
            )

        fireEvent.changeText(renderer.getByTestId("email-input"), "")
        fireEvent.changeText(renderer.getByTestId("password-input"), "TestTest")
        
        fireEvent.press(renderer.getByText("LOGIN"))

        expect(renderer.queryByText("Should not be empty")).not.toBeNull()
    })
    
    it("submitting blank password", () => {
        const renderer =
            render(
                <Login />
            )
        
        fireEvent.changeText(renderer.getByTestId("email-input"), "test@gmail.com")
        fireEvent.changeText(renderer.getByTestId("password-input"), "")
        
        fireEvent.press(renderer.getByText("LOGIN"))

        expect(renderer.queryByText("Should not be empty")).not.toBeNull()
    })
    
    it("submitting invalid email address format", () => {
        const renderer =
            render(
                <Login />
            )
        
        fireEvent.changeText(renderer.getByTestId("email-input"), "dasd@gmail")
        fireEvent.changeText(renderer.getByTestId("password-input"), "TestTest")
        
        fireEvent.press(renderer.getByText("LOGIN"))

        expect(renderer.queryByText("Not a valid email address")).not.toBeNull()
    })

    it("submitting correctly formated data, no error message", () => {
        const renderer =
            render(
                <Login />
            )
        fireEvent.changeText(renderer.getByTestId("email-input"), "w19023403@northumbria.ac.uk")
        fireEvent.changeText(renderer.getByTestId("password-input"), "TestTest")
        
        fireEvent.press(renderer.getByText("LOGIN"))
        
        expect(renderer.queryAllByText("Should not be empty")).toHaveLength(0)
        expect(renderer.queryByText("Not a valid email address")).toBeNull()
    })

})