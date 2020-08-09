import React from 'react';
import './Dashboard.css';
import 'bootstrap-4-grid/css/grid.min.css';
import { Button } from '@progress/kendo-react-buttons';
import { savePDF } from '@progress/kendo-react-pdf';
import '@progress/kendo-theme-material/dist/all.css';
import ReactDOM from 'react-dom';
import { Component } from 'react';
import data from '../Data/data.json'
import {Bar} from 'react-chartjs-2';
import {Bardata1,Bardata2} from '../Data/Bardata'
import {Link} from 'react-router-dom'
import { json } from 'body-parser';
import {Pie} from 'react-chartjs-2';
import {Donutdata1,Donutdata2} from '../Data/Donutdata'
const datasumm = data.summarization
class Dashboard extends Component
{
    constructor(props){
        super(props)
        this.state1={Bardata1}
        this.state2={Bardata2}
        this.state3={Donutdata1}
        this.state4={Donutdata2}
        this.appContainer = React.createRef();
        this.state = {
            showDialog: false
          }
        }
   
    handlePDFExport = () => {
            savePDF(ReactDOM.findDOMNode(this.appContainer), { paperSize: 'auto' });
    }
render(){

    return (
      <div className='container pt-5'>
          <div className='row'>
              <div className='col-12'>
                  <h1>Here is the Dashboard!!!</h1>
              </div>
          </div>
          <div className='row'>
              <div className='col-12'>
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
          </div>
           
          <div className="row">
            <div className="col-6">
              {datasumm.map(summ=>(
                  <div className='me'>{summ}</div>
              ))}
                
            </div>
        </div>  
        <div className='row'>
            <h5>Locations -1 Analysis</h5>
                <Bar data={{labels:this.state.Bardata1.labels,
                datasets:this.state1.Bardata1.datasets}} height='50%' width='100px'>
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
        <div className="bootstrap-wrapper">
        <div className="app-container container" ref={(el) => this.appContainer = el}>
            <div className="col-sm-6 col-md-6 col-lg-6  buttons-right">
            <Button primary={true} onClick={this.handlePDFExport}>Export to PDF</Button>        
          </div>
          <div className="row">
              <p>Content to be displayed</p>
          </div>    
            </div>
        </div>
   </div>
        
    )
}
}

export default Dashboard;
