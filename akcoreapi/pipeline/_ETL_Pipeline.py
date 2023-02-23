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
from datetime import datetime
from datetime import timedelta


class _ETL_Pipeline(object):

    def __init__(self, Parameter):
        ### Parameter definieren
        self.Parameter = Parameter
        self.dictResponses = {
        'AO01': 1,
        'AO02': 2,
        'AO03': 3,
        'AO04': 4,
        'AO05': 5,
        }

        self.dictResponses_Symbol = {
        'AO01': '--',
        'AO02':'-',
        'AO03': '0',
        'AO04': '+',
        'AO05': '++',
        }

        self.dictMonth= {
            1: "January",
            2: "February",
            3: "March",
            4: "April",
            5: "May",
            6: "June",
            7: "July",
            8: "August",
            9: "Semptember",
            10: "October",
            11: "November",
            12: "December"
        }
        
        self.Responses_colNames = [
            'Survey_Name',
            'SurveyID',
            'PartParticipant',
            'token',
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
            #'Q1_Symbol',  
            #'Q2_Symbol',
            #'Q3_Symbol',
            #'Q4_Symbol',
            #'Q5_Symbol',
            #'Q6_Symbol',
            #'Q7_Symbol',
            #'Q8_Symbol',
            #'Q9_Symbol',
            #'Q10_Symbol',
            #'MQ1_Symbol',
            #'AvgA1_Symbol',
            #'AvgA3_Symbol',
            #'AvgAll_Symbol',
        ]
        self.Count_colNames = [
            'Survey_Name',
            'SurveyID',
            'Department',
            'Role',
            'Category',
            'CountAll',
            'CountA1',
            'CountA3',
        ]
        self.Pie_colNames = [
            'Survey_Name',
            'SurveyID',
            'ParticipantID',
            'Department',
            'Role',
            'Rx',
            'Percent'
        ]           

        

    def loadResponses(self,URL, usern, passw):
        ### Session öffnen
        api = LimeSurvey(url=URL, username=usern)
        api.open(password=passw)

        ### Antworten exportieren
        responses_short = api.survey.export_responses(self.Parameter['surveyData']['surveyId'], "short")
        responses_short_decoded = base64.b64decode(responses_short).decode()

        responses_long = api.survey.export_responses(self.Parameter['surveyData']['surveyId'], "long")
        responses_long_decoded = base64.b64decode(responses_long).decode()

        ### Session schließen
        api.close()

        # Cast into Pandas Dataframe
        self.df_import_short = pd.read_csv(StringIO(responses_short_decoded), sep=";",quotechar='"') 
        #self.df_import_short = self.df_import_short.replace(np.nan, None)
        #print(df_import_short)
        self.df_import_long = pd.read_csv(StringIO(responses_long_decoded), sep=";",quotechar='"')
        #self.df_import_long = self.df_import_long.replace(np.nan, None)
        #print(df_import_long)
    
    def TransformResponses(self, Responses):
        trans_Responses = []
        for res in Responses:
            if pd.isnull(res) == True:
                trans_Responses.append(np.NaN)
            else:
                trans_Responses.append(self.dictResponses[res])
        return trans_Responses
    
    def TransformResponses_Symbol(self,Responses):
        trans_Responses = []
        for res in Responses:
            if pd.isnull(res) == True:
                trans_Responses.append(np.NaN)
            else:
                trans_Responses.append(self.dictResponses_Symbol[res])
        return trans_Responses

    def get_AvgQuestions(self, df, Rows):
        Avg = [0] * len(df[Rows[0]])
        for R in Rows:
            Avg = Avg + df[R]
            #print(Avg)
        Avg = Avg / len(Rows)
        return Avg

    def get_AvgQuestions_Symbol(self, df,Rows):
        Avg = [0] * len(df[Rows[0]])
        for R in Rows:
            Avg = Avg + df[R]
        #print(Avg)
        Avg = Avg / len(Rows)
        for i in range(len(Avg)):
            #print(Avg[i])
            if Avg[i] == np.NaN:
                pass
            else:
                if Avg[i] < 1.5:
                    Avg[i] = "--"
                elif Avg[i] >= 1.5 and Avg[i] < 2.5:
                    Avg[i] = "-"  
                elif Avg[i] >= 2.5 and Avg[i] < 3.5:
                    Avg[i] = "0"   
                elif Avg[i] >= 3.5 and Avg[i] < 4.5:
                    Avg[i] = "+"   
                elif Avg[i] >= 4.5:
                    Avg[i] = "++"   
        return Avg  

    def organizeDf(self,df,teilnehmerData,surveyData):
        nichtTeilgenommen = []
        returnDF = pd.DataFrame(columns = df.columns)
        for teil in teilnehmerData:
            if len(df.loc[df.token == teil]) == 0:
                nichtTeilgenommen.append(teil)
            elif len(df.loc[df.token == teil]) == 1:
                df.loc[df.token == teil,"Department"] = teilnehmerData[teil]['abteilung']
                df.loc[df.token == teil,'Role'] = teilnehmerData[teil]['rolle']
                #print(newLine)
                #newLine['Department'] = teilnehmerData[teil]['abteilung']
                #newLine['Role'] = teilnehmerData[teil]['rolle']
                returnDF = pd.concat([df.loc[df.token == teil],returnDF], ignore_index=True)    
            elif len(df.loc[df.token == teil]) > 1:
                if True in list(df.Complete.loc[df.token == teil]):
                    df.loc[df.token == teil].loc[df.Complete == "yes" ,"Department"] = teilnehmerData[teil]['abteilung']
                    df.loc[df.token == teil].loc[df.Complete == "yes",'Role'] = teilnehmerData[teil]['rolle']
                    returnDF = pd.concat([df.loc[df.token == teil].loc[df.Complete == "yes"],returnDF], ignore_index=True) 
                else:
                    newLine = df.loc[df.token == teil].tail(1)
                    print(newLine["Department"].isnull())
                    if pd.isnull(newLine["Department"].values):
                        newLine["Department"] = teilnehmerData[teil]['abteilung']
                    if pd.isnull(newLine["Role"].values):
                        newLine["Role"] = teilnehmerData[teil]['rolle']
                    returnDF = pd.concat([returnDF, newLine], ignore_index=True)
        if len(nichtTeilgenommen) > 0:
            ghostLine = [np.NaN] * len(df.columns)
            #ghostLine = pd.Series(ghostLine)
            for nt in nichtTeilgenommen:
                ghostLine[list(df.columns).index("SurveyID")]= surveyData['surveyId']
                ghostLine[list(df.columns).index("token")]= nt
                ghostLine[list(df.columns).index("ParticipantID")] = teilnehmerData[nt]['participantID']
                ghostLine[list(df.columns).index("Department")]=  teilnehmerData[nt]['abteilung']
                ghostLine[list(df.columns).index("Role")]=teilnehmerData[nt]['rolle']
                returnDF.loc[len(returnDF)] = ghostLine
        return returnDF



    def createResponses(self):
        ###Initialisierung der DataFrames
        self.df_Responses = pd.DataFrame(columns = self.Responses_colNames)
        ###SurveyID LimeSurvey
        SID_LS = [self.Parameter['surveyData']['surveyId']] * self.df_import_short.shape[0]
        ###SurveyID schön
        startDate_DateObj = datetime.strptime(self.Parameter['surveyData']['surveyStartDate'], '%Y-%m-%d').date()
        SurveyID = self.dictMonth[startDate_DateObj.month] + " " + str(startDate_DateObj.year)
        SID= [SurveyID] * self.df_import_short.shape[0]
        SID_LS = [self.Parameter['surveyData']['surveyId']] * self.df_import_short.shape[0]
        ###ParticipantID & Token
        ParticipantID = []
        token =[]
        for tn in self.df_import_short.token:
            ParticipantID.append(self.Parameter['teilnehmerData'][tn]['participantID'])
            token.append(tn)
        ###Complete
        Complete = []
        for sd in self.df_import_short['submitdate'].isnull():
            if sd == True:
                Complete.append(False)
            else:
                Complete.append(True)
        ###Duration
        Duration = []
        endDate_TimeObj = 0
        for i in range(len(self.df_import_short)):
            startDate_TimeObj = datetime.strptime(self.df_import_short.loc[i].startdate, '%Y-%m-%d %H:%M:%S')
            endDate_TimeObj =  datetime.strptime(self.df_import_short.loc[i].datestamp, '%Y-%m-%d %H:%M:%S')
            delta = endDate_TimeObj - startDate_TimeObj
            #t1 = datetime.strptime(str(startDate_TimeObj), "%H:%M:%S")
            #t2 = datetime.strptime(str(endDate_TimeObj), "%H:%M:%S")
            Duration.append(delta.total_seconds()/60)
        ###Department
        Department = []
        pos=0
        for dep in self.df_import_long['G01Q01']:
            if pd.isnull(dep) == True:
                Department.append(np.NaN)
            else:
                if dep == 'Sonstiges':
                    Department.append(self.df_import_long['G01Q01[other]'][pos])
                else:
                    Department.append(dep)
            pos +=1
        ###Datenzuweisung
        self.df_Responses['Duration'] =Duration
        self.df_Responses['Complete'] =Complete
        self.df_Responses['Survey_Name'] = SID
        self.df_Responses['SurveyID'] = SID_LS
        self.df_Responses['token'] = token
        self.df_Responses['ParticipantID'] = ParticipantID
        self.df_Responses['DateSent'] = self.df_import_short['submitdate']
        self.df_Responses['Department'] = Department
        self.df_Responses['Role'] = self.df_import_long['G01Q02']
        self.df_Responses['Q1'] = self.TransformResponses(self.df_import_short['G02Q03[SQ001]'])
        self.df_Responses['Q2'] = self.TransformResponses(self.df_import_short['G02Q03[SQ002]'])
        self.df_Responses['Q3'] = self.TransformResponses(self.df_import_short['G02Q03[SQ003]'])
        self.df_Responses['Q4'] = self.TransformResponses(self.df_import_short['G02Q07[SQ001]'])
        self.df_Responses['Q5'] = self.TransformResponses(self.df_import_short['G04Q12[SQ001]'])
        self.df_Responses['Q6'] = self.TransformResponses(self.df_import_short['G04Q12[SQ002]'])
        self.df_Responses['Q7'] = self.TransformResponses(self.df_import_short['G04Q12[SQ003]'])
        self.df_Responses['Q8'] = self.TransformResponses(self.df_import_short['G04Q13[SQ001]'])
        self.df_Responses['Q9'] = self.TransformResponses(self.df_import_short['G04Q13[SQ002]'])
        self.df_Responses['Q10'] = self.TransformResponses(self.df_import_short['G04Q13[SQ003]'])
        self.df_Responses['O1'] = self.df_import_short['G02Q04']
        self.df_Responses['O2'] = self.df_import_short['G02Q05']
        self.df_Responses['O3'] = self.df_import_short['G02Q06']
        self.df_Responses['O4'] = self.df_import_short['G04Q14']
        self.df_Responses['R1'] = self.df_import_short['G02Q08[SQ001]']
        self.df_Responses['R2'] = self.df_import_short['G02Q08[SQ002]']
        self.df_Responses['R3'] = self.df_import_short['G02Q08[SQ003]']
        self.df_Responses['M1'] = self.TransformResponses(self.df_import_short['G03Q09']) #Frage: maßnhame teilngenommen?
        self.df_Responses['MQ1'] = self.TransformResponses(self.df_import_short['G03Q10[SQ001]'])
        self.df_Responses['MO1'] = self.df_import_short['G03Q11']
        self.df_Responses['AvgA1'] = self.get_AvgQuestions(self.df_Responses, ['Q1','Q2','Q3','Q4'])
        self.df_Responses['AvgA3'] = self.get_AvgQuestions(self.df_Responses, ['Q5','Q6','Q7','Q8','Q9','Q10'])
        self.df_Responses['AvgAll'] = self.get_AvgQuestions(self.df_Responses, ['Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9','Q10'])
        #self.df_Responses['Q1_Symbol'] = self.TransformResponses_Symbol(self.df_import_short['G02Q03[SQ001]'])
        #self.df_Responses['Q2_Symbol'] = self.TransformResponses_Symbol(self.df_import_short['G02Q03[SQ002]'])
        #self.df_Responses['Q3_Symbol'] = self.TransformResponses_Symbol(self.df_import_short['G02Q03[SQ003]'])
        #self.df_Responses['Q4_Symbol'] = self.TransformResponses_Symbol(self.df_import_short['G02Q07[SQ001]'])
        #self.df_Responses['Q5_Symbol'] = self.TransformResponses_Symbol(self.df_import_short['G04Q12[SQ001]'])
        #self.df_Responses['Q6_Symbol'] = self.TransformResponses_Symbol(self.df_import_short['G04Q12[SQ002]'])
        #self.df_Responses['Q7_Symbol'] = self.TransformResponses_Symbol(self.df_import_short['G04Q12[SQ003]'])
        #self.df_Responses['Q8_Symbol'] = self.TransformResponses_Symbol(self.df_import_short['G04Q13[SQ001]'])
        #self.df_Responses['Q9_Symbol'] = self.TransformResponses_Symbol(self.df_import_short['G04Q13[SQ002]'])
        # self.df_Responses['Q10_Symbol'] = self.TransformResponses_Symbol(self.df_import_short['G04Q13[SQ003]'])
        #self.df_Responses['MQ1_Symbol'] = self.TransformResponses_Symbol(self.df_import_short['G03Q10[SQ001]'])
        # self.df_Responses['AvgA1_Symbol'] = self.get_AvgQuestions_Symbol(self.df_Responses, ['Q1','Q2','Q3','Q4'])
        # self.df_Responses['AvgA3_Symbol'] = self.get_AvgQuestions_Symbol(self.df_Responses, ['Q5','Q6','Q7','Q8','Q9','Q10'])
        # self.df_Responses['AvgAll_Symbol'] = self.get_AvgQuestions_Symbol(self.df_Responses, ['Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9','Q10'])
        self.df_Responses = self.organizeDf(self.df_Responses,self.Parameter['teilnehmerData'],self.Parameter['surveyData'])

    def createCount(self):
        self.df_Count = pd.DataFrame(columns = self.Count_colNames)
        i = 0 
        for dep in pd.unique(self.df_Responses.Department):
            if pd.isnull(dep) == False:
                for r in pd.unique(self.df_Responses.Role):
                    if pd.isnull(r) == False:
                        A1=0
                        A3=0
                        All=0
                        for c in [1,2,3,4,5]:
                            if pd.isnull(c) == False:
                                for q in ['Q1','Q2','Q3','Q4','Q5']:
                                    A1 = A1 + self.df_Responses[q][self.df_Responses.Department == dep].loc[self.df_Responses.Role == r].loc[self.df_Responses[q] == c].count()
                                for qq in ['Q6','Q7','Q8','Q9','Q10']:
                                    A3 = A3 + self.df_Responses[qq][self.df_Responses.Department == dep].loc[self.df_Responses.Role == r].loc[self.df_Responses[qq] == c].count()
                                All = A1 + A3 + self.df_Responses["MQ1"][self.df_Responses.Department == dep].loc[self.df_Responses.Role == r].loc[self.df_Responses['MQ1'] == c].count()
                                newLine = [self.df_Responses.SurveyID[1],
                                    self.df_Responses.Survey_Name[1],
                                    dep,
                                    r,
                                    c,
                                    All,
                                    A1,
                                    A3]
                            self.df_Count.loc[i] = newLine
                            i +=1
    
    def createPie(self):
        self.df_pie = pd.DataFrame(columns = self.Pie_colNames)
        i=0
        for pid in self.df_Responses.ParticipantID:
            dep = self.df_Responses.Department.loc[self.df_Responses.ParticipantID == pid].values[0]
            role = self.df_Responses.Role.loc[self.df_Responses.ParticipantID == pid].values[0]
            for r in [1,2,3]:
                perc = self.df_Responses["R"+str(r)].loc[self.df_Responses.ParticipantID == pid].values[0]
                self.df_pie.loc[i] = [
                    self.df_Responses.SurveyID.loc[self.df_Responses.ParticipantID == pid].values[0],
                    self.df_Responses.Survey_Name.loc[self.df_Responses.ParticipantID == pid].values[0],
                    pid,
                    dep,
                    role,
                    r,
                    perc
                ]
                i +=1
    
    def printJSON(self):
        JSON_Gesamt={"projektId" : self.Parameter['projektId']}
        JSON_Responses = {}
        JSON_Count = {}
        JSON_Pie = {}
        for line in range(len(self.df_Responses)):
            docID = str(self.df_Responses.SurveyID.loc[line]) + "_" + str(self.df_Responses.ParticipantID.loc[line])
            lineJSON = { docID : self.df_Responses.loc[line].to_dict()}
            JSON_Responses.update(lineJSON)
        for line in range(len(self.df_Count)):
            docID = str(self.df_Count.SurveyID.loc[line]) + "_" + str(self.df_Count.Department.loc[line]) + "_" + str(self.df_Count.Role.loc[line]) + "_" + str(self.df_Count.Category.loc[line])
            lineJSON = {docID: self.df_Count.loc[line].to_dict()}
            JSON_Count.update(lineJSON)
        for line in range(len(self.df_pie)):
            docID = str(self.df_pie.SurveyID.loc[line]) + "_" + str(self.df_pie.ParticipantID.loc[line]) + "_R" + str(self.df_pie.Rx.loc[line])
            lineJSON = {docID : self.df_pie.loc[line].to_dict()}
            JSON_Pie.update(lineJSON)
        JSON_Gesamt.update({'Responses' : JSON_Responses})
        JSON_Gesamt.update({'pie' : JSON_Pie})
        JSON_Gesamt.update({'count' : JSON_Count})
        return(JSON_Gesamt)
        