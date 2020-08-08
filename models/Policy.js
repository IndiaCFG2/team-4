const mongoose=require('mongoose');
const Schema=mongoose.Schema;

var poliySchema = new Schema({
    sentimentAnalyis: {
        agree : Double,
        disagree : Double,
        neutral : Double 
    },
    objQue: [{  
        Que : {
            description: String,
            option1: {
                optionDescription: String,
                count: Integer
            },
            option2: {
                optionDescription: String,
                count: Integer
            },
            option3: {
                optionDescription: String,
                count: Integer
            }
        }
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

module.exports = Policy = mongoose.model('policy',policySchema);