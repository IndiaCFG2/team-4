import React from 'react';
import './Dashboard.css';
import 'bootstrap-4-grid/css/grid.min.css';
import { Button } from '@progress/kendo-react-buttons';
import { savePDF } from '@progress/kendo-react-pdf';
import { Ripple } from '@progress/kendo-react-ripple';
import '@progress/kendo-theme-material/dist/all.css';
import ReactDOM from 'react-dom';
import { Component } from 'react';
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
        </Ripple>
    );
}
}

export default Dashboard;