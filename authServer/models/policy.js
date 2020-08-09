const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const  policySchema = new Schema({
    policyName: String,
    sentimentAnalysis: {
        agree : Double,
        disagree : Double,
        neutral : Double,
    },
    objQue: [{
        Que : {
            description: String,
            options : [{
                description: String,
                count : Double
            }]
        },
    }],
    summary: {
        merits: {
            message: String,
        },
        demerits: {
            message: String,
        }
    }
});


mongoose.model('Policy',policySchema);