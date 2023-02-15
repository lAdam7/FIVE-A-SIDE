import React from "react"
import { fireEvent, render } from "@testing-library/react-native"
import { Provider } from "react-redux"
import configureStore from "../src/redux/store"

import CreateLeagueInfo from "../src/components/CreateLeague/CreateLeagueInfo"

const store = configureStore()

describe("Checking CreateLeagueInfo component renders", () => {
    it("Component renders", () => {
		render(
            <Provider store={store}>
                <CreateLeagueInfo location={[{street : "Street", subregion: "Subregion", country: "Country"}]} />
            </Provider>
		)
	})
    
    it("Toggle default visible, one selected visibilty changes with option for amount of divisions and promotion and relegation details", async () => {
        const renderer =
            render(
                <Provider store={store}>
                    <CreateLeagueInfo location={[{street : "Street", subregion: "Subregion", country: "Country"}]} />
                </Provider>
            )
        expect(renderer.queryByText("How many divisions?")).toBeTruthy()
        expect(renderer.queryByText("Promotion/Relegation")).toBeTruthy()
        expect(renderer.queryByText("Teams to be Promoted/Relegated")).toBeTruthy()
        
        fireEvent.press(renderer.getByTestId("toggleDivision"))
        
        expect(renderer.queryByText("How many divisions?")).not.toBeTruthy()
        expect(renderer.queryByText("Promotion/Relegation")).not.toBeTruthy()
        expect(renderer.queryByText("Teams to be Promoted/Relegated")).not.toBeTruthy()
    })

    it("Toggle promotion/relegation", async () => {
        const renderer =
            render(
                <Provider store={store}>
                    <CreateLeagueInfo location={[{street : "Street", subregion: "Subregion", country: "Country"}]} />
                </Provider>
            )
        expect(renderer.queryByText("Teams to be Promoted/Relegated")).toBeTruthy()

        fireEvent.press(renderer.getByTestId("toggleProRel"))
        
        expect(renderer.queryByText("Teams to be Promoted/Relegated")).not.toBeTruthy()
    })
})