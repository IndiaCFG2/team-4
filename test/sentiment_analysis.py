'''
Returns sentiment (a float in [-1,1]) of the arg feedback
'''

def get_sentiment_nltk(feedback):
    '''
    Returns sentiment of feedback using NLTK Vader
    '''
    from nltk.sentiment.vader import SentimentIntensityAnalyzer
    sid = SentimentIntensityAnalyzer()
    ss = sid.polarity_scores(feedback)
    # returning NLTK vader compound score
    return ss['compound']

def get_sentiment(feedback):
    '''
    Calls get_sentiment_nltk
    '''
    return get_sentiment_nltk(feedback)

# print(get_sentiment("Not a good policy. Hate it!"))