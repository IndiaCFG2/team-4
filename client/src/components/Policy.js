import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Link} from 'react-router-dom'

function Policy(){
    return (
        <div className='container'>
            <h2 className='h2-policy'>Here is the Detailed View of the Policy!!</h2>
                    <section _ngcontent-lvo-c116="" className='content-container'>
                        <h3>
                            Summary <span>(2 min)</span>
                        </h3>
                    <p>The Niti Aayog has released a working paper for public consultation on ‘Responsible Artificial Intelligence (AI)’.
                            The adoption of AI mechanisms is rapidly increasing in India. 
                            AI is being used in all sectors, that is, Government and public sector, private sector as well as research and academia. It is expected that AI will boost India’s annual growth by 1.3% by 2020.
                            
                        <div>The key points of discussion in the working paper are:<br></br></div></p> 
                        <ul>
                            <li><b>Challenges to study with AI systems:</b></li>
                            </ul>
                                <ol>
                                    <li>Systems consideration challenges: Such challenges have a direct impact on the AI system and occur due to people being subject to a specific AI system. For example, privacy of a person being violated due to AI. This is also known as systems consideration challenge.&nbsp;<br></br>
                                    </li>
                                    <li>Societal impact challenge: These have an indirect impact on the AI system and occur due to the overall deployment of AI solutions in society. A person losing their job due to an AI system being more efficient is an example of this. This is also known as societal consideration.<br>
                                    </br></li>
                                </ol>
                    </section>
                    <hr/>
                    <p className="para"><span>
                    <b>Principles to be applied to AI Systems</b>
                    </span>
                    </p>
                    <hr/>
                   
                    <ul _ngcontent-lvo-c116="" className="unordered-list">
                        <li  className="ff-lato">Principles of Safety and Reliability</li>
                        <li  className="ff-lato">Principles of Equality</li>
                        <li  className="ff-lato">Principles of Inclusivity and Non-discrimination</li>
                        <li  className="ff-lato">Principles of Privacy and Security</li>
                        <li  className="ff-lato">Principle of Transparency</li>
                        <li  className="ff-lato">Principle of Accountability</li>
                        <li  className="ff-lato">Principle of Protection and reinforcement of positive human values</li>
                    </ul>
                    <p className="para">The policy provides for some essential pointers to enforce these principles and gives guidelines for self-assessing the fairness of an AI System. </p>
            <hr/>
            <form className='response-block'>
            <div className="question-index">
            <div className="question">
            <p className="question-text">
            <span className="question-text__number">1.</span> What do you think about this consultation </p></div>
            <div className="answer">
            <div className="text-area">
            <textarea placeholder="Type your answer here" className="ng-untouched ng-pristine ng-invalid"></textarea>
            </div>
            </div></div>
            <p className="question-text">
            <span className="question-text__number">2.</span> Are you concerned about the consultation? </p>
            <div className="radio">
            <span className="r1"><input type="radio" name="r1"/> Yes </span>
            <span className="r2"><input type="radio" name="r1"/> No </span>
            <span className="r3"><input type="radio" name="r1"/> Maybe </span>
            </div>
            
            <p className="question-text">
            <span className="question-text__number">3.</span> Is the consultation valid? </p>
            <div className="radio">
            <span className="r1"><input type="radio" name="r1"/> Yes </span>
            <span className="r2"><input type="radio" name="r1"/> No </span>
            <span className="r3"><input type="radio" name="r1"/> Maybe </span>
            </div>
            
            <div className="audio-upload">
            <p className="question-text">
            4.<span className="audio-upload"/>Please upload the audio of your opinion: </p>
            <input type="file" id="audio-file" name="audio" accept="audio/*"/>
            </div>
            <div className="py-3">
                
                <div>
                <Link to='/dashboard' className="btn btn-primary" style={{margin:"5px"}} >View Dashboard</Link>
                &nbsp;&nbsp;
                <Link to='/' className="btn btn-primary" style={{marginRight:"20px"}}>Submit Response</Link>
                </div>
            </div>
            </form>
            <Link to='/dashboard' className="btn btn-success" >Check out the Report!!!</Link>
        </div>
    
    );
}
export default Policy;
