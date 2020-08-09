'''
This module returns total positive sentiments, total negative sentiments and the summary points
'''
import pandas as pd
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk import tokenize
from googletrans import Translator


DATASET = "feedback_dataset_EIP.xlsx"
POS_OFFSET = 0.1
ORIGIN = 0.04


def get_feedback_df():
    '''
    convert feedback list to df and return 
    '''
    return pd.read_excel(DATASET)


def translate_regional_languages(feedback_df):
    '''
    detects and translates any other language to english
    '''
    translator = Translator()
    feedback_df['responseText'] = [translator.translate(x).text for x in feedback_df['responseText']]
    return feedback_df


def get_total_count(feedback_df):
    '''
    returns total pos and neg count 
    '''
    total_pos = feedback_df[feedback_df['compound']>POS_OFFSET].shape[0]
    total_neg = feedback_df[feedback_df['compound']<ORIGIN].shape[0]
    total_neu = feedback_df.shape[0] - total_pos - total_neg
    return total_pos, total_neg, total_neu


def add_votes_metric(feedback_df):
    '''
    add metric votes:-
    votes = upVoteCount - downVoteCount + templatesCount
    drop unnecessary cols and sort by values
    '''
    feedback_df['votes'] = feedback_df['upVoteCount'] - feedback_df['downVoteCount'] + feedback_df['templatesCount']
    feedback_df = feedback_df.drop(['upVoteCount','downVoteCount','templatesCount'], 1)
    feedback_df.sort_values(by="votes", ascending=False)
    return feedback_df


def get_sentiment_nltk(feedback, sentiment_type="compound"):
    '''
    Returns sentiment of feedback using NLTK Vader
    '''
    sid = SentimentIntensityAnalyzer()
    ss = sid.polarity_scores(feedback)
    # returning NLTK vader compound score
    return ss[sentiment_type]


def get_sentiment_scores(feedback_df):
    '''
    Populates feedback_df with sentiment scores
    '''
    
    for sentiment_type in ['compound', 'neg', 'pos', 'neu']:
        feedback_df[sentiment_type] = [get_sentiment_nltk(x, sentiment_type) for x in feedback_df['responseText']]
        
    return feedback_df


def get_summary(feedback_df):
    '''
    [For testing purpose] return a subset of top 3 responses
    '''
    response_text = feedback_df['responseText'][0] + feedback_df['responseText'][1] + feedback_df['responseText'][2]
    
    lines_list = tokenize.sent_tokenize(response_text)
    line_df = []
    for line in lines_list:
        row = []
        row.append(line)
        row.append(get_sentiment_nltk(line))
        line_df.append(row)
    df = pd.DataFrame(line_df)
    df = df.sort_values(by=1)
    df = df.head(6)

    return df[0].tolist()


def main():
    '''
    main
    '''
    # read df and translate to en
    feedback_df = get_feedback_df()
    feedback_df = translate_regional_languages(feedback_df)

    # get sentiment scores using VADER
    feedback_df = get_sentiment_scores(feedback_df)
    
    # get total count of sentiments
    total_pos, total_neg, total_neu = get_total_count(feedback_df)

    # add votes metric and get summary
    feedback_df = add_votes_metric(feedback_df)
    summary = get_summary(feedback_df)
    
    # print output -> node will read from buffer 
    print(total_pos)
    print(total_neg)
    print(total_neu)
    print(summary)