import sys
from limesurveyrc2api.limesurvey import LimeSurvey
from io import StringIO
import urllib3
import base64
import pandas as pd
import csv
import numpy as np
import json
from _ETL_Pipeline import _ETL_Pipeline
from elasticsearch import Elasticsearch

test_sid = 552287
#sid = int(sys.argv[1])
#Kibana_Index = int(sys.argv[2])

ETL_Pipe = _ETL_Pipeline()

ETL_Pipe.loadResponses(test_sid)
ETL_Pipe.transform_DataFrame()
ETL_Pipe.creatTab2()
#print(ETL_Pipe.df_KibanaImport_Tab2)
ETL_Pipe.printCSV()

"""
### Parameter definieren
url = "http://141.89.39.93/index.php/admin/remotecontrol"
username = "lukas"
password = "1OdLHT9oYnZW"

### Session öffnen
api = LimeSurvey(url=url, username=username)
api.open(password=password)

### Liste der Umfragen ausgeben, mit ihren Survey IDs
result = api.survey.list_surveys()
for survey in result:
    print(survey.get("sid"))

### Antworten exportieren
### Noch harte Zuweisung der Survey IDs, kann noch dynamisch gemacht werden. 
responses = api.survey.export_responses(552287)



### Session schließen
api.close()


### Transformation der Daten
# Daten aus Base64 decodieren
responses_decoded = base64.b64decode(responses).decode()


responsesJson = json.load(StringIO(responses_decoded))

for resp in responsesJson["responses"]:
    print(resp["Antwort ID"])



# Daten in einem DataFrame speichern zur weiteren Bearbeitung 
df_import = pd.read_csv(StringIO(responses_decoded), sep=",",quotechar='"')
# Zeilenüberschrifften ist nach Import ein String mit allen Überschirften, seperiert durch ;. Der String wird hier in die einzelnen Überschriften aufgeteilt
colList = df_import.columns[0].split(";")
# Die Überschrift muss geändert werden, damit sie orderntlich aufgerufen werden kann.
print(df_import.columns[1])
print(colList)
df_import.columns =  ["first"]

### Überschriften von " befreien
for i in range(len(colList)):
    StrList = list(colList[i])
    #Alle " werden aus der Character Liste gelöscht.
    while '"' in StrList:
        StrList.remove('"')
    colList[i] = "".join(StrList)

#print(colList)

### Werte von " befreien
count_row = df_import.shape[0] #Anzahl der Reihen
Data_array = []
for i in range(count_row):
    # Jede Reihe wird in eine Liste von Werten gespeichert
    akt_Zeile = df_import["first"][i].split(";")
    #Selbes Prinzip wie bei den Überschriften
    for i2 in range(len(akt_Zeile)):
        StrList = list(akt_Zeile[i2])
        while '"' in StrList:
            StrList.remove('"')
        akt_Zeile[i2] = "".join(StrList)
    Data_array.append(akt_Zeile)

# Speicher der Transformierten Daten in einem neuen DataFrame
df_export = pd.DataFrame(Data_array,columns = colList)

print(df_export)"""