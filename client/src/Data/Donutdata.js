import data from './data.json'
const senti = data.sentimentAnalyis
const quest = data.objQue.Que
const Donutdata1={
    labels: ['Agree','Disagree','Neutral opinion'],
    datasets:[{
        data: [senti.agree,senti.disagree,senti.neutral],
        backgroundColor:['green','red','blue']
    }]
}
const Donutdata2={
    labels: ['Option-1','Option-2','Option-3'],
    datasets:[{
        data: [quest.option1.count,quest.option2.count,quest.option3.count],
        backgroundColor:['green','red','blue']
    }]
}



export {Donutdata1,Donutdata2};
