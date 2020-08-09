import React from 'react';
import './Dashboard.css';
import 'bootstrap-4-grid/css/grid.min.css';
import '@progress/kendo-theme-material/dist/all.css';
import { Component } from 'react';
import data from '../Data/data.json'
import {Bar} from 'react-chartjs-2';
import {Bardata1,Bardata2} from '../Data/Bardata'
const datasumm = data.summarization
class BarComponent extends Component{
    constructor(props){
        super(props)
        this.state1={Bardata1}
        this.state2={Bardata2}
        }
        render(){

            return (
              <div >     

                <div className={'row'}>
                    <h5>Locations -1 Analysis</h5>
                        <Bar data={{labels:this.state1.Bardata1.labels,
                        datasets:this.state1.Bardata1.datasets}} height='50%'>
                        </Bar>
                        <br />
                    </div>
                    <hr />
                    <div >
                     <h5>Objective Question -1 Analysis</h5>
                     <Bar data={{labels:this.state2.Bardata2.labels,
                     datasets:this.state2.Bardata2.datasets}} height='50%' >
                     </Bar>
                     <br />
                </div>
                <hr />
                <div className={"row"}>
                    <div className={"col"}>
                    <h1>Summarization</h1>
                    <br />
                      {datasumm.map(summ=>(
                          <div className='me'>{summ}</div>
                      ))}
                    </div>
                </div>  
           </div>
                
            );
        }
        }
        
        export default BarComponent;
