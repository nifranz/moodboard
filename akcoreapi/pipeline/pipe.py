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

# storing json file data into variable "mitarbeiterData"
json_file_path = sys.argv[1]
json_file = open(json_file_path)
data = json.load(json_file)
json_file.close()

surveyData = data['surveyData']
for i in surveyData:
    print(surveyData[i])

teilnehmerData = data['teilnehmerData']
for i in teilnehmerData:
    print(teilnehmerData[i])

