import React from 'react';
import './Dashboard.css';
import 'bootstrap-4-grid/css/grid.min.css';
//import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
//import { Input } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import { savePDF } from '@progress/kendo-react-pdf';
import { Ripple } from '@progress/kendo-react-ripple';
import '@progress/kendo-theme-material/dist/all.css';
import ReactDOM from 'react-dom';
import { Component } from 'react';
import DonutChart from './DonutChart';
class Dashboard extends Component
{
    constructor(props) {
        super(props);
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
    <Ripple>
        <div className="app-container " ref={(el) => this.appContainer = el}>
            <div className={""}>
            <Button primary={true} onClick={this.handlePDFExport}>Export to PDF</Button>        
          </div>
          <div className="row">
              <DonutChart />
          </div>    
        </div>
        </Ripple>
    );
}
}

export default Dashboard;