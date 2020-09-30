#team-4


4ForGood - Civis Problem Statement
=================================================
This Solution is developed in MERN Stack along with the ML being used for Analysis

The Issue/The Problem Statement:
--------------
There are a lot of people in our country who are not aware of the various happenings and their effects on them. Civic is a platform that brings people's opinions into the government's notice, building a powerful rapport. To build an analytical tool that can generate useful and relevant insights on citizen's opinions in a user-friendly manner taking inputs (audio, subjective, obj) is the challenge.

The Solution/Key Features:
---------------
1. Feedback is taken in all three forms - subjective, objective, and Audio.

2. Sentimental Analysis to determine the overall consensus from the people. 

3. Text Summarization to give subjective feedback a summarized form. 

4. Multilinguistic support both for text and voice. 

5. Visually appealing dashboard for insights generation. 

6. Pie and bar graphs for data visualization.

This Git Repo contains:
----------
Client folder consists the UI part :
    1. Landing Page
    2. Policy Page
    3. Dashboard Page
  
  
Audio file consists the audios used for the speech to text conversion

AuthServer consists of the routes for the backend.

back_end consists of the dashboard api for taking the feedback.

data folder consists of the data required.

test consists of files that are upgraded to NLTK VADER for sentiment.

Models and Libraries Used:
-----------

1. Speech to text conversion : Google Translater
SpeechRecognition library which takes the audio in the .wav format and converts it to text or paragraph. This data is then again added to the data use for subjective analysis for people.

2. Sentimental Analysis : NLTK's VADER model
We have used nltk library for NLP(Natural Language Processing) for finding out the sentiments of people through their feedback text or paragraph and determining the percentage of people agreeing and disagreeing with respect to policy.

3. Text Summarization : Rule based points extraction system
We are using the dataset from Civis and using that we have the most liked comments and feedback and the most disliked comment. Using this data we would summarize a final summary for all the feedbacks in top liked or disliked.




##### The code ("Code") in this repository was created solely by the student teams during a coding competition hosted by JPMorgan Chase Bank, N.A. ("JPMC").						JPMC did not create or contribute to the development of the Code.  This Code is provided AS IS and JPMC makes no warranty of any kind, express or implied, as to the Code,						including but not limited to, merchantability, satisfactory quality, non-infringement, title or fitness for a particular purpose or use.