import React from "react"
import { fireEvent, render } from "@testing-library/react-native"
import { Provider } from "react-redux"
import configureStore from "../src/redux/store"

import LeagueDays from "../src/components/CreateLeague/CreateLeagueInfo"

const store = configureStore()

describe("Checking CreateLeagueInfo component renders", () => {
    it("Component renders", () => {
		render(
            <Provider store={store}>
                <LeagueDays maxTeams={8} matchLength={50} divisions={2} location={[{street : "Street", subregion: "Subregion", country: "Country"}]} />
            </Provider>
		)
	})

    it("Check divisions day/times and adding a time/day to one", () => {
        const renderer = 
            render(
                <Provider store={store}>
                    <LeagueDays maxTeams={8} matchLength={50} divisions={2} location={[{street : "Street", subregion: "Subregion", country: "Country"}]} />
                </Provider>
            )

        expect(renderer.queryByText("SET DIVISION 1 TIMES")).toBeTruthy()
        expect(renderer.queryByText("SET DIVISION 2 TIMES")).toBeTruthy()
        expect(renderer.queryByText("SET DIVISION 3 TIMES")).toBeTruthy()
        expect(renderer.queryByText("SET DIVISION 4 TIMES")).not.toBeTruthy()
        expect(renderer.queryByText("SET DIVISION 5 TIMES")).not.toBeTruthy()

        fireEvent.press(renderer.queryByText("SET DIVISION 2 TIMES"))

        fireEvent.press(renderer.queryByText("ADD"))
        fireEvent.press(renderer.queryByText("ADD"))

        fireEvent.press(renderer.queryByText("BACK"))
        
        expect(renderer.queryAllByText("Monday: 12:30 - 13:20")).toHaveLength(2)
    })

    it("Remove day/time from division", () => {
        const renderer = 
            render(
                <Provider store={store}>
                    <LeagueDays maxTeams={8} matchLength={50} divisions={2} location={[{street : "Street", subregion: "Subregion", country: "Country"}]} />
                </Provider>
            )

        fireEvent.press(renderer.queryByText("SET DIVISION 2 TIMES"))

        fireEvent.press(renderer.queryByText("ADD"))

        fireEvent.press(renderer.queryByText("BACK"))
        
        expect(renderer.queryAllByText("Monday: 12:30 - 13:20")).toHaveLength(1)

        fireEvent.press(renderer.queryByText("SET DIVISION 2 TIMES"))

        fireEvent.press(renderer.queryByText("Monday: 12:30-13:20"))

        fireEvent.press(renderer.queryByText("BACK"))
        
        expect(renderer.queryAllByText("Monday: 12:30 - 13:20")).toHaveLength(0)
    })
})