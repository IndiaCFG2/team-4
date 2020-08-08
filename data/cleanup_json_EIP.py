#!/usr/bin/env python
# coding: utf-8

# In[48]:


import pandas as pd
from bs4 import BeautifulSoup as bs

import json


# In[52]:


with open('data.json', encoding="utf8") as f:
    d = json.load(f)

feedbacks = d['data']['consultationProfile']['sharedResponses']['edges']


# In[39]:


data = []
for feedback in feedbacks:
    row = []
    response = feedback['node']['responseText']
    soup = bs(response)
    row.append(soup.text.strip())
    row.append(feedback['node']['upVoteCount'])
    row.append(feedback['node']['downVoteCount'])
    row.append(feedback['node']['templatesCount'])
    data.append(row)


# In[41]:


df = pd.DataFrame(data)

df.columns = ['responseText','upVoteCount','downVoteCount','templatesCount']

df.to_csv('feedback_dataset_EIP.csv')

