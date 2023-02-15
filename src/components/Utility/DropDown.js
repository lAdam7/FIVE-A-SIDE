import React, { Component } from "react"
import { View, Text } from "react-native"
import { Picker } from "@react-native-picker/picker"

/**
 * Component used throughout the app
 * for populating dropdown boxes with
 * the passed array
 * 
 * @author Adam Lyon W19023403
 */
class DropDown extends Component {
    constructor(props) {
        super(props)
        this.state = {
            value: this.props.default
        }
    }

    /** Value is the default autoset */
    componentDidMount() {
        this.props.setDropdownValue(this.props.default)
    }

    /** Update of selected element, tell parent component new value */
    updateItem = (value) => {
        this.props.setDropdownValue(value)
        this.setState({ value: value })
    }

    render() {
        /**
         * Display picker component, selecting alows to pick the passed values
         */
        return (
            <View style={{ marginLeft: "auto", marginRight: "auto" }}>
                <Text style={{ color: "white" }}>{this.props.title}</Text>
                <Picker
                    selectedValue={this.state.value}
                    style={{ height: 50, width: 150, color: "white" }}
                    onValueChange={(itemValue, itemIndex) => this.updateItem(itemValue)}
                >
                    {
                        this.props.options.map((value, index) => {
                            return (
                                <Picker.Item key={index} label={value.toString()} value={value} />
                            )  
                        })
                    }
                </Picker>
            </View>
        )
    }
}

export default DropDown