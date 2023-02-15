from limesurveyrc2api.limesurvey import LimeSurvey
from io import StringIO
import urllib3
import base64
import pandas as pd
import csv
import numpy as np
import json
import elasticsearch
from elasticsearch import Elasticsearch
from elasticsearch import helpers


class _ETL_Pipeline(object):

    def __init__(self):
        ### Parameter definieren
        self.url = "http://141.89.39.93/index.php/admin/remotecontrol"
        self.username = "lukas"
        self.password = "1OdLHT9oYnZW"
        self.dictResponses = {
        'AO01': 1,
        'AO02': 2,
        'AO03': 3,
        'AO04': 4,
        'AO05': 5,
        }
        KibanaImportColNames_Tab1 = [
        'SurveyID',
        'InvParticipant',
        'ParticipantID',
        'DateSent',
        'Complete',
        'Duration',
        'Department',
        'Role',
        'Q1',
        'Q2',
        'Q3',
        'Q4',
        'O1',
        'O2',
        'O3',
        'AvgA1',
        'R1',
        'R2',
        'R3',
        'M1',
        'MQ1',
        'MO1',
        'Q5',
        'Q6',
        'Q7',
        'Q8',
        'Q9',
        'Q10',
        'O4',
        'AvgA3',
        'AvgAll',
        ]

        KibanaImportColNames_Tab2 = [
        'SurveyID',
        'Department',
        'Role',
        'Category',
        'CountAll',
        'CountA1',
        'CountA3',
        ]

        self.df_KibanaImport_Tab1 = pd.DataFrame(columns = KibanaImportColNames_Tab1)
        self.df_KibanaImport_Tab2 = pd.DataFrame(columns = KibanaImportColNames_Tab2)

    def loadResponses(self,surveyID):
        ### Session öffnen
        api = LimeSurvey(url=self.url, username=self.username)
        api.open(password=self.password)

        ### Liste der Umfragen ausgeben, mit ihren Survey IDs
        self.Surveys = api.survey.list_surveys()
        #for survey in self.Surveys:
            #print(survey.get("sid"))

        ### Antworten exportieren
        responses_short = api.survey.export_responses(surveyID, "short")
        responses_short_decoded = base64.b64decode(responses_short).decode()

        responses_long = api.survey.export_responses(surveyID, "long")
        responses_long_decoded = base64.b64decode(responses_long).decode()

        ### Session schließen
        api.close()

        # Cast into Pandas Dataframe
        self.df_import_short = pd.read_csv(StringIO(responses_short_decoded), sep=";",quotechar='"') 
        #print(df_import_short)
        self.df_import_long = pd.read_csv(StringIO(responses_long_decoded), sep=";",quotechar='"')
        #print(df_import_long)
    
    def TransformResponses(self, Responses):
        trans_Responses = []
        for res in Responses:
            if pd.isnull(res) == True:
                trans_Responses.append(0)
            else:
                trans_Responses.append(self.dictResponses[res])
        return trans_Responses
    
    def get_AvgQuestions(self, df, Rows):
        Avg = [0] * len(df[Rows[0]])
        for R in Rows:
            Avg = Avg + df[R]
            #print(Avg)
        Avg = Avg / len(Rows)
        return Avg
        
    def transform_DataFrame(self):
        Complete = []
        Department = []
        pos=0
        for sd in self.df_import_short['submitdate'].isnull():
            if sd == True:
                Complete.append('no')
            else:
                Complete.append('yes')
        for dep in self.df_import_long['G01Q01']:
            if pd.isnull(dep) == True:
                Department.append(0)
            else:
                if dep == 'Sonstiges':
                    Department.append(self.df_import_long['G01Q01[other]'][pos])
                else:
                    Department.append(dep)
            pos +=1


        self.df_KibanaImport_Tab1['ParticipantID'] = self.df_import_short['id']
        self.df_KibanaImport_Tab1['DateSent'] = self.df_import_short['submitdate']
        self.df_KibanaImport_Tab1['Department'] = Department
        self.df_KibanaImport_Tab1['Role'] = self.df_import_long['G01Q02']
        self.df_KibanaImport_Tab1['Q1'] = self.TransformResponses(self.df_import_short['G02Q03[SQ001]'])
        self.df_KibanaImport_Tab1['Q2'] = self.TransformResponses(self.df_import_short['G02Q03[SQ002]'])
        self.df_KibanaImport_Tab1['Q3'] = self.TransformResponses(self.df_import_short['G02Q03[SQ003]'])
        self.df_KibanaImport_Tab1['Q3'] = self.TransformResponses(self.df_import_short['G02Q03[SQ003]'])
        self.df_KibanaImport_Tab1['Q4'] = self.TransformResponses(self.df_import_short['G02Q07[SQ001]'])
        self.df_KibanaImport_Tab1['Q5'] = self.TransformResponses(self.df_import_short['G04Q12[SQ001]'])
        self.df_KibanaImport_Tab1['Q6'] = self.TransformResponses(self.df_import_short['G04Q12[SQ002]'])
        self.df_KibanaImport_Tab1['Q7'] = self.TransformResponses(self.df_import_short['G04Q12[SQ003]'])
        self.df_KibanaImport_Tab1['Q8'] = self.TransformResponses(self.df_import_short['G04Q13[SQ001]'])
        self.df_KibanaImport_Tab1['Q9'] = self.TransformResponses(self.df_import_short['G04Q13[SQ002]'])
        self.df_KibanaImport_Tab1['Q10'] = self.TransformResponses(self.df_import_short['G04Q13[SQ003]'])
        self.df_KibanaImport_Tab1['O1'] = self.df_import_short['G02Q04']
        self.df_KibanaImport_Tab1['O2'] = self.df_import_short['G02Q05']
        self.df_KibanaImport_Tab1['O3'] = self.df_import_short['G02Q06']
        self.df_KibanaImport_Tab1['O4'] = self.df_import_short['G04Q14']
        self.df_KibanaImport_Tab1['R1'] = self.df_import_short['G02Q08[SQ001]']
        self.df_KibanaImport_Tab1['R2'] = self.df_import_short['G02Q08[SQ002]']
        self.df_KibanaImport_Tab1['R3'] = self.df_import_short['G02Q08[SQ003]']
        self.df_KibanaImport_Tab1['M1'] = self.df_import_short['G03Q11']
        self.df_KibanaImport_Tab1['MQ1'] = self.TransformResponses(self.df_import_short['G03Q10[SQ001]'])
        self.df_KibanaImport_Tab1['MO1'] = self.df_import_short['G02Q08[SQ003]']
        self.df_KibanaImport_Tab1['AvgA1'] = self.get_AvgQuestions(self.df_KibanaImport_Tab1, ['Q1','Q2','Q3','Q4'])
        self.df_KibanaImport_Tab1['AvgA3'] = self.get_AvgQuestions(self.df_KibanaImport_Tab1, ['Q5','Q6','Q7','Q8','Q9','Q10'])
        self.df_KibanaImport_Tab1['AvgAll'] = self.get_AvgQuestions(self.df_KibanaImport_Tab1, ['Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9','Q10'])

    def creatTab2(self):
        i = 0 
        for dep in pd.unique(self.df_KibanaImport_Tab1.Department):
            if pd.isnull(dep) == False:
                for r in pd.unique(self.df_KibanaImport_Tab1.Role):
                    if pd.isnull(r) == False:
                        A1=0
                        A3=0
                        All=0
                        for c in list(pd.unique(self.df_KibanaImport_Tab1.Q1)):
                            if pd.isnull(c) == False:
                                for q in ['Q1','Q2','Q3','Q4','Q5']:
                                    A1 = A1 + self.df_KibanaImport_Tab1[q][self.df_KibanaImport_Tab1.Department == dep].loc[self.df_KibanaImport_Tab1.Role == r].loc[self.df_KibanaImport_Tab1[q] == c].count()
                                for qq in ['Q6','Q7','Q8','Q9','Q10']:
                                    A3 = A3 + self.df_KibanaImport_Tab1[qq][self.df_KibanaImport_Tab1.Department == dep].loc[self.df_KibanaImport_Tab1.Role == r].loc[self.df_KibanaImport_Tab1[qq] == c].count()
                                All = A1 + A3 + self.df_KibanaImport_Tab1["MQ1"][self.df_KibanaImport_Tab1.Department == dep].loc[self.df_KibanaImport_Tab1.Role == r].loc[self.df_KibanaImport_Tab1['MQ1'] == c].count()
                                newLine = [self.df_KibanaImport_Tab1.SurveyID[1],
                                           dep,
                                            r,
                                            c,
                                            All,
                                            A1,
                                            A3]
                                self.df_KibanaImport_Tab2.loc[i] = newLine
                                i +=1
    
    def printCSV(self):
        self.df_KibanaImport_Tab1.to_csv('ETL_Pipe_Kibana_Export_Tab1.csv')
        self.df_KibanaImport_Tab2.to_csv('ETL_Pipe_Kibana_Export_Tab2.csv')

    def generator(df_dict):
        for c, line in enumerate(df_dict):
            yield {
                '_index': 'myelkfirst',
                '_type': '_doc',
                '_id':line.get("show_id",None),
                '_source':{
                    "title":line.get("title",""),
                    'dircetor':line.get("director",""),
                    'description':line.get('duration', None),
                    'cast':line.get('cast',None)
                }
            }

    
    def exporttoKibana(self,cloud_ID, api_key,DataFrame):
        # Found in the 'Manage this deployment' page
        CLOUD_ID = "YOUR_CLOUD_ID"

        # Found in the 'Management' page under the section 'Security'
        API_KEY = "YOUR_API_KEY"

        # Create the client instance
        client = Elasticsearch(
        cloud_id=CLOUD_ID,
        api_key=API_KEY,
        )
        df_dict = DataFrame.to_dict('records')
        mycustom = self.generator(df_dict)
        try:
            res = helpers.bulk(client,self.generator(df_dict))
        except Exception as e:
            print(e)
            pass


        