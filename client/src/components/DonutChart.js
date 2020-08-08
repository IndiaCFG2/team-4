import {Pie} from 'react-chartjs-2';
import React, {Component} from 'react';
import {Donutdata1,Donutdata2} from '../Data/Donutdata'
class PieChartComponent extends Component{
    constructor(props){
    super(props)
    this.state={Donutdata1}
    this.state2={Donutdata2}
    }
    render(){
        return(
            <div>
            <div>
                <h5>Objective Question -1 Analysis</h5>
                <Pie data={{labels:this.state.Donutdata1.labels,
                datasets:this.state.Donutdata1.datasets}} height='50%' width='100px'>
                </Pie>
                <br />
            </div>
             <div>
             <h5>Objective Question -1 Analysis</h5>
             <Pie data={{labels:this.state2.Donutdata2.labels,
             datasets:this.state2.Donutdata2.datasets}} height='50%' width='100px'>
             </Pie>
             <br />
         </div>
         </div>
        )
    }
}

export default PieChartComponent;