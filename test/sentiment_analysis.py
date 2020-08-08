'''
Returns sentiment (a float in [-1,1]) of the arg feedback
'''

def get_sentiment_nltk(feedback):
    '''
    Returns sentiment of feedback using textblob
    '''
    from textblob import TextBlob
    sentiment = TextBlob(feedback)
    return sentiment.sentiment.polarity

def get_sentiment(feedback):
    '''
    Calls get_sentiment_nltk
    '''
    return get_sentiment_nltk(feedback)

# print(get_sentiment("Not a good policy. Hate it!"))