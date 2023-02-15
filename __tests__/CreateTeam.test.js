import React from "react"
import { fireEvent, render } from "@testing-library/react-native"
import { Provider } from "react-redux"
import configureStore from "../src/redux/store"

import CreateTeam from "../src/components/FindTeam/CreateTeam"

const store = configureStore()

describe("Checking CreateTeam component renders", () => {
    it("Component renders", () => {
		render(
            <Provider store={store}>
                <CreateTeam />
            </Provider>
		)
	})
    
    it("submitting blank team name", () => {
        const renderer =
            render(
                <CreateTeam />
            )

        fireEvent.changeText(renderer.getByTestId("team-abbreviation-input"), "AAA")
        
        fireEvent.press(renderer.getByTestId("createTeam"))

        expect(renderer.queryByText("Should not be empty")).not.toBeNull()
    })

    it("submitting team name with less than 6 characters", () => {
        const renderer =
            render(
                <CreateTeam />
            )
        
        fireEvent.changeText(renderer.getByTestId("team-name-input"), "Unite")
        fireEvent.changeText(renderer.getByTestId("team-abbreviation-input"), "AAA")
        
        fireEvent.press(renderer.getByTestId("createTeam"))

        expect(renderer.queryByText("Should be at least 6 characters")).not.toBeNull()
    })

    it("submitting empty team abbreviation", () => {
        const renderer =
            render(
                <CreateTeam />
            )

        fireEvent.changeText(renderer.getByTestId("team-name-input"), "Testing Team")
        
        fireEvent.press(renderer.getByTestId("createTeam"))

        expect(renderer.queryByText("Should be 3 characters")).not.toBeNull()
    })

    it("submitting team abbreviation 2 characters long", () => {
        const renderer =
            render(
                <CreateTeam />
            )

        fireEvent.changeText(renderer.getByTestId("team-name-input"), "Testing Team")
        fireEvent.changeText(renderer.getByTestId("team-abbreviation-input"), "AA")
        
        fireEvent.press(renderer.getByTestId("createTeam"))

        expect(renderer.queryByText("Should be 3 characters")).not.toBeNull()
    })

    it("Setting kit number", () => {
        const renderer =
            render(
                <CreateTeam />
            )

        expect(renderer.queryByText("1")).toBeTruthy()
        
        fireEvent.press(renderer.queryByText("SET KIT NUMBER"))

        fireEvent.press(renderer.queryByText("44"))
        
        expect(renderer.queryByText("44")).toBeTruthy()

        fireEvent.press(renderer.queryByText("SET KIT NUMBER"))

        fireEvent.press(renderer.queryByText("99"))
        
        expect(renderer.queryByText("99")).toBeTruthy()
    })
})