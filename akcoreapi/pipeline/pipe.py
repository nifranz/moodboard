from elasticsearch import Elasticsearch 
import sys
import json
import time

# THIS SCRIPT ACCEPTS ONE CL-PARAMETER:
    # [1]: a path to a json file; contents:
    #   {
    #       'surveyData':
    #       {
    #           'surveyId': surveyIdValue,
    #           'surveyStartDate': startDateValue,
    #           'surveyEndDate': endDateValue
    #       },
    #       'teilnehmerData':
    #       {
    #           'teilnehmerTokenValue':     # this object exists for each teilnhemer
    #           {
    #               'rolle': teilnehmerRolleValue, 
    #               'abteilung': teilnehmerAbteilungValue
    #           } 
    #       }
    #   }
    # [3]: 

# output
    # [{
#     "Role": "Key-User",
#     "CountA1": 9,
#     "Department": "Einkauf",
#     "Category": 5,
#     "SurveyID": 1,
#     "CountA3": 1,
#     "CountAll": 3
#   }]


# storing json file data into variable "mitarbeiterData"
# json_file_path = sys.argv[1]
# json_file = open(json_file_path)
# data = json.load(json_file)
# json_file.close()

# surveyData = data['surveyData']
# for i in surveyData:
#     sys.stdout.write(i+": ")
#     print(surveyData[i])

# teilnehmerData = data['teilnehmerData']
# for i in teilnehmerData:
#     sys.stdout.write(i+": ")
#     print(teilnehmerData[i])

# es = Elasticsearch(
#     "https://localhost:9200",
#     ca_certs="./http_ca.crt",
#     api_key=("api_key.id", "api_key.api_key")
# )

data = {"a": "abc"}
print(json.dumps(data))

# print('{"a":30}')