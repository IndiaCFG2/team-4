import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Card,Button} from 'react-bootstrap';
import {Link} from 'react-router-dom'

function PolicyList()
{
    return (
      <div className={"card-columns"} >
      <Card style={{ width: '18rem'}} >
  <Card.Img variant="top" src="http://opiniojuris.org/wp-content/uploads/Environment.jpg" style={{height: "200px"}}/>
  <Card.Body>
    <Card.Title>Ministry of environment forest and climate change
</Card.Title>
    <Card.Text>
      Working Document: Responsible AI for All 
    </Card.Text>
   <Link to='/policy' className="btn btn-primary" >Read the Policy</Link>
  </Card.Body>
</Card>
<Card style={{ width: '18rem' }} >
  <Card.Img variant="top" src="https://knowledge.wharton.upenn.edu/wp-content/uploads/2018/12/multimodel.jpg" style={{height: "200px"}}/>
  <Card.Body>
    <Card.Title>Niti Ayog</Card.Title>
    <Card.Text>
      Draft Environment Impact Assessment Notification
    </Card.Text>
    <Link to='/policy' className="btn btn-primary" >Read the Policy</Link>
  </Card.Body>
</Card>
<Card style={{ width: '18rem' }} >
  <Card.Img variant="top" src="https://knowledge.wharton.upenn.edu/wp-content/uploads/2018/12/multimodel.jpg" style={{height: "200px"}}/>
  <Card.Body>
  <Card.Title>Niti Ayog</Card.Title>
    <Card.Text>
    Draft Environment Impact Assessment Notification
    </Card.Text>
    <Link to='/policy' className="btn btn-primary" >Read the Policy</Link>
  </Card.Body>
</Card>
</div>
    );
}

export default PolicyList;
