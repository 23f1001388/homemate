from datetime import datetime

def format_date(str):
    if str:
      datepart=str.split(' ')[0]
      year,month,day=datepart.split('-')
      formatted_date=f"{day}-{month}-{year}"
      return formatted_date
    return None
  
def format_datetime(str):
    if str:
      datepart=str.split('.')[0]
      return datepart
    return None

def getDate(str):
    if str:
      day,month,year=str.split('-')
      return datetime(year=int(year), month=int(month), day=int(day)).date()
    return None