import {Bar} from 'react-chartjs-2';
import React, {Component} from 'react';
import {Donutdata1,Donutdata2} from '../Data/Bardata'
class BarGraphComponent extends Component{
    constructor(props){
    super(props)
    this.state={Bardata1}
    this.state2={Bardata2}
    }
    render(){
        return(
            <div>
            <div>
                <h5>Locations -1 Analysis</h5>
                <Bar data={{labels:this.state.Bardata1.labels,
                datasets:this.state.Bardata1.datasets}} height='50%' width='100px'>
                </Bar>
                <br />
            </div>
             <div>
             <h5>Objective Question -1 Analysis</h5>
             <Bar data={{labels:this.state2.Bardata2.labels,
             datasets:this.state2.Bardata2.datasets}} height='50%' width='100px'>
             </Bar>
             <br />
         </div>
         </div>
        )
    }
}