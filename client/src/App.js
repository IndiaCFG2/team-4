import React from "react";
import {Navbar, Nav} from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route } from "react-router-dom";
import PolicyList from './components/PolicyList';
import Policy from './components/Policy';
import './App.css';
import Switch from "react-bootstrap/esm/Switch";
function App() {
return (
<BrowserRouter>
    <div className="navigation">
        <Navbar bg="dark" variant="dark" fixed="top">
        <Navbar.Brand href="/"><b>Civis</b></Navbar.Brand>
           <Nav className="mr-auto">
               <Nav.Link href="/" className="nav navbar-nav navbar-right">Signin</Nav.Link>
               <Nav.Link href="/" className="nav navbar-nav navbar-right">Signup</Nav.Link>
            </Nav>
        </Navbar>
    </div>
    <div className="main">
     <Switch>
        <Route path="/" exact={true} component={PolicyList} />
        <Route path="/policy" exact={true} component={Policy} />
        <Route path="/dashboard" exact={true} component={Dashboard} />
       </Switch>
    </div>
</BrowserRouter>);
}
export default App;
