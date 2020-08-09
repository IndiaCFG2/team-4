const express = require("express");
const bodyParser = require('body-parser');

const dashboardRouter = express.Router();

dashboardRouter.use(bodyParser.json());

dashboardRouter.get("/", (req, res) => {
    res.json({
        sentimentAnalyis: {
            agree : 70.20,
            disagree : 25.06,
            neutral : 4.74 
        },
        objQue: [{  
            Que : {
                description: "Question - 1",
                option1: {
                    optionDescription: "Option-1",
                    count: 24
                },
                option2: {
                    optionDescription: "Option-2",
                    count: 64
                },
                option3: {
                    optionDescription: "Option-3",
                    count: 32
                }
            }
        }],
        summarization: [{
            summary: "Sample Sentence - 1"
        }]
    })
}); 

module.exports = dashboardRouter;