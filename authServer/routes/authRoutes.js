const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()

router.get('/',getHelloWorld)
function getHelloWorld(req,res)
{
    const spawn = require("child_process").spawn;
    const process = spawn('python3',["./helper.py"]);
    process.stdout.on('data', function (data) {
         const abc = data.toString();
        let str = abc.split("\n");
        let pos = parseInt(str[0])
        let neg = parseInt(str[1])
        let neu = parseInt(str[2])
        let tot = pos+neg+neu;
        pos = ((pos/tot)*100).toFixed(2)
        neg = ((neg/tot)*100).toFixed(2)
        neu = ((neu/tot)*100).toFixed(2)
        console.log(pos+' '+neg+' '+neu)
        let st = str[3].replace("[","").replace("]","").replace(String.fromCharCode(92),"")
        const obj = {
            agree : pos,
            disagree: neg,
            neutral : neu,
            summary : st,
        }
        res.json(obj)
    })
}
module.exports = router