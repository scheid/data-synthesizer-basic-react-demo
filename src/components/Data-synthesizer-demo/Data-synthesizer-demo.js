import React from 'react';
//import PropTypes from 'prop-types';
import './Data-synthesizer-demo.scss';
import {DataSynthesizerServiceBasic} from 'data-synthesizer-basic';
import * as moment from 'moment';
import DataSynthConfig from "../../data-synth-config";


class DataSynthesizerDemoComponent extends React.Component {

    static propTypes = {};
    static defaultProps = {};
    state = {};
    dataCfg = DataSynthConfig;
    recordCount = DataSynthConfig.recordsToGenerate;
    dataSynthesizerService = new DataSynthesizerServiceBasic();

    render() {
        return (
            <div className="DataSynthesizerDemoComponent" data-testid="DataSynthesizerDemoComponent">
                <h2>Generated Data from the Data Synthesizer</h2>
                <div>{this.recordCount} records generated in {this.genTimeMsec} milliseconds</div>

                <table style={{marginTop: '32px'}}>

                    <tbody>
                    <tr>
                        <th>ID</th>
                        <th>UUID</th>
                        <th>Person</th>
                        <th>Person name combined</th>
                        <th>Weight (lbs)</th>
                        <th>Height (inches)</th>
                        <th>BMI</th>
                        <th>Favorite Color</th>
                        <th>Date Created</th>
                        <th>Pets</th>
                        <th>Friend</th>
                        <th>other Friends</th>
                        <th>Sequence List Items</th>
                        <th>Long Text</th>
                    </tr>

                    {this.state.generatedItems ? this.state.generatedItems.map(
                        (item, idx) => ( <tr key={'t' + idx}>
                                <td>{item.id}</td>
                                <td>{item.uuid}</td>

                                <td>{item.personLastName}, {item.personFirstName}</td>
                                <td>{item.firstAndLastName}</td>
                                <td>{item.weight_lbs} lbs</td>
                                <td>{item.height_inches} inches</td>
                                <td>{item.bmi}</td>
                                <td>{item.favoriteColor}</td>
                                <td>{this.formatDate(item.dateCreated)}</td>
                                <td><div>has dog: {item.personPets.hasDog}</div>
                                    <div>has cat: {item.personPets.hasCat}</div>
                                    <div>has fish: {item.personPets.hasFish}</div></td>

                                <td>{item.friendName}</td>

                                <td>
                                    <ul>
                                        {item.otherFriendsName.map( (val, idx) => <li key={'a' + idx}>{val}</li> )}
                                    </ul>
                                </td>
                                <td>{item.beans_sequence}</td>
                            </tr>
                        )
                    ) : null}

                    </tbody>
                </table>
            </div>
        );
    }

    componentDidMount() {

        // you can create as many data synth configs as you need. call the service separately with each config
        // to get different datasets for your application.

        this.dataSynthesizerService.generateDataset(DataSynthConfig).subscribe(
            (data) => {
                this.end = new Date().getTime();
                this.genTimeMsec = this.end - this.start;
                this.generatedDataset = data;

                let i = 0;

                // the paragraphs of text will come in separated by new line characters (\n). In this demo we want to display the paragaphs as html
                // so, we are splitting the paragraphs by new line characters in an array of the paragraphs, and then in the  template we will
                // wrap each of those array elements in <p> tags
                for (i = 0; i < this.generatedDataset.length; i++) {
                    this.generatedDataset[i].longText = this.generatedDataset[i].longText.split("\n");
                }

                this.setState({generatedItems: data});
                console.log('data', data);


                for (i = 0; i < data.length; i++) {
                    this.weightDistribution.push(data[i].weight_lbs);
                    this.heightDistribution.push(data[i].height_inches);
                    this.bmiDistribution.push(data[i].bmi);
                }

                // this.weightDistribution = _tmp1;


            },
            (err) => {
                console.log('error generating data set', err);
            }
        );

    }

    constructor(props) {

        super(props);

        this.dataCfg = DataSynthConfig;
        this.recordCount = DataSynthConfig.recordsToGenerate;
        this.start = new Date().getTime();

        this.heightDistribution = [];
        this.weightDistribution = [];
        this.bmiDistribution = [];

    }


    formatDate(val) {
        return moment(val).format('DD MMM YYYY HH:mm:ss');
    }

}

export default DataSynthesizerDemoComponent;
