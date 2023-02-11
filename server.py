from typing import Optional
from fastapi import Cookie, FastAPI, HTTPException, Request
from fastapi.testclient import TestClient
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
import bcrypt
import os
from dotenv import load_dotenv, find_dotenv
from bson import json_util, ObjectId
import json 
from datetime import date, datetime, timedelta
import jwt 
import csv
from mangum import Mangum

app = FastAPI()
handler = Mangum(app)
app.rates = { 'login': 0, 'getUsers': 0, 'getUser': 0, 'addUser': 0, 'deleteUser': 0, 'getCourses': 0, 'getCourse': 0, 'addCourse': 0, 'deleteCourse': 0, 'reassignCourse': 0, 'completeFirst': 0, 'completeSecond': 0, 'summaryFirst': 0, 'summarySecond': 0, 'changePhone': 0, 'getContacts': 0, 'addContact': 0, 'deleteContact': 0, 'getCSV': 0, 'addMessage': 0, 'getMessages': 0, 'deleteMessage': 0, 'changeMessage': 0, 'changeContact': 0, 'changeUser': 0, 'changePassword': 0, 'changeCourse': 0, 'minute': datetime.now() } 


cluster = MongoClient(os.environ.get("CONNECTION_TO_DB"))
db = cluster['InventoryManagement']
users = db['operators']
courses = db['courses']
contacts = db['contacts']
messages = db['messages']

class Payload(BaseModel): 
  username: str
  password: str 

class User(BaseModel):
  username: str
  password: str 
  employee_number: int
  phone_number: Optional[int]
  rank: bool
  area: str 

class Course(BaseModel):
  name: str
  prevName: Optional[str]
  area: str 
  resources: list
  questions: list 
  descriptionStage1: str
  descriptionStage2: str
  threshold: int

class findUser(BaseModel): 
  username: str

class findCourse(BaseModel): 
  name: str
  area: Optional[str]

class Stage(BaseModel): 
  username: str
  coursename: str
  answers: Optional[list]

class ChangePhone(BaseModel): 
  username: str
  phone_number: int 

class changePassword(BaseModel): 
  username: str
  newPassword: str 

class Contact(BaseModel): 
  name: str 
  phone_number: Optional[int] 

class Message(BaseModel): 
  message: str

class changeMessage(BaseModel): 
  prevMessage: str
  newMessage: str

class changeMessage(BaseModel): 
  prevMessage: str
  newMessage: str

class changeContact(BaseModel): 
  prevName: str
  name: str
  phone_number: int

class changeUser(BaseModel): 
  prevUsername: str
  username: str
  employee_number: int
  phone_number: Optional[int]
  rank: bool
  area: str 
  password: str

def getCookie(cname, ccookies):
    cookies = ccookies.split('; ')

    for cookie in cookies:
        cur = cookie.split('=')
        if cur[0] == cname:
            return cur[1]

    return False

def authenticatedUser(username, token): 

  return jwt.encode({ 'username': username }, os.getenv('PRIVATE_TOKEN_KEY'), algorithm="HS256") == token

def authorizedAdmin(username):

  isAdmin = False
  user = users.find_one({ 'username': username })

  if user: 
    isAdmin = user['rank'] 
  
  return isAdmin

def checkRateLimit(name, limit): 
  if (app.rates[name] <= limit - 1): 
    app.rates[name] += 1 
  else: 
    current_time = datetime.now()
    
    if (current_time - app.rates['minute']).total_seconds() / 60 > 1: 
      app.rates = { 'login': 0, 'getUsers': 0, 'getUser': 0, 'addUser': 0, 'deleteUser': 0, 'getCourses': 0, 'getCourse': 0, 'addCourse': 0, 'deleteCourse': 0, 'reassignCourse': 0, 'completeFirst': 0, 'completeSecond': 0, 'summaryFirst': 0, 'summarySecond': 0, 'changePhone': 0, 'getContacts': 0, 'addContact': 0, 'deleteContact': 0, 'getCSV': 0, 'addMessage': 0, 'getMessages': 0, 'deleteMessage': 0, 'changeMessage': 0, 'changeContact': 0, 'changeUser': 0, 'changePassword': 0, 'changeCourse': 0, 'minute': current_time } 
    else: 
      return True
  
  return False

@app.post("/login", status_code = 200) 
def login(request: Request, user: Payload): 

  if checkRateLimit('login', 80): 
    raise HTTPException(status_code=429, detail="Too many requests")

  if authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])): 
    raise HTTPException(status_code=401, detail="Unauthorized")

  content = { 'loggedIn': False, 'admin': False }

  if user.username and user.password: 

    current = users.find_one({ 'username' : user.username}) 
    
    if current: 
      if bcrypt.checkpw(user.password.encode("utf8"), current['password']): 
        content['loggedIn'] = True 

        content['token'] = jwt.encode({ "username": user.username }, os.environ.get('PRIVATE_TOKEN_KEY'), algorithm="HS256")

        if current['rank']: 
          content['admin'] = True 
      
  if not content['loggedIn']: 
    raise HTTPException(status_code=401, detail="Unauthorized") 
  
  return JSONResponse(content = content)

@app.get("/is-logged-in", status_code = 200) 
def isLoggedIn(request: Request): 

  if not authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])): 
    raise HTTPException(status_code=401, detail="Unauthorized")

@app.get("/is-privileged", status_code = 200) 
def isPrivileged(request: Request): 

  if not authorizedAdmin(getCookie('username', request.headers['cookies'])): 
    raise HTTPException(status_code=401, detail="Unauthorized")

@app.get("/get-users", status_code = 200)
def getUsers(request: Request):
  
  if checkRateLimit('getUsers', 30): 
    raise HTTPException(status_code=429, detail="Too many requests")
      
  if not authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])) or not authorizedAdmin(getCookie('username', request.headers['cookies'])): 
      raise HTTPException(status_code=401, detail="Unauthorized") 

  operators = [json.loads(json_util.dumps(user)) for user in users.find()]
  
  content = { 'users': operators }
  response = JSONResponse(content) 

  return response 

@app.get("/get-user/{username}", status_code = 200)
def getUser(request: Request, username: str):

  if checkRateLimit('getUser', 80): 
    raise HTTPException(status_code=429, detail="Too many requests")

  if not authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])):
    raise HTTPException(status_code=401, detail="Unauthorized") 
  
  content = {}
  content['user'] = users.find_one({ 'username': username })

  if not content['user']:
    raise HTTPException(status_code=404, detail="Not found")

  if content['user']['rank']:
    raise HTTPException(status_code=400, detail="Bad request")

  content['user'] = json.loads(json_util.dumps(content['user']))
  return JSONResponse(content = content)

@app.post("/add-user", status_code = 200)
def addUser(request: Request, user: User):
    
    if checkRateLimit('addUser', 10): 
      raise HTTPException(status_code=429, detail="Too many requests")

    if not authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])) or not authorizedAdmin(getCookie('username', request.headers['cookies'])): 
      raise HTTPException(status_code=401, detail="Unauthorized") 
    
    content = {'addedUser': False}
    password = bcrypt.hashpw(user.password.encode('utf8'), bcrypt.gensalt())
    newUser = { 'username': user.username, 'password': password, 'employee_number': user.employee_number, 'phone_number': user.phone_number, 'area': user.area, 'rank': user.rank, 'courses': [] } 
    
    if user.username and user.password and user.area and user.employee_number:
        if not users.find_one({ 'username': user.username }): 
            users.insert_one(newUser)
            content['addedUser'] = True 

            if not newUser['rank']:
              needed_courses = [json.loads(json_util.dumps(course)) for course in courses.find({ '$or': [ { 'area': user.area }, { 'area': 'General' } ] })]
              for course in needed_courses: 
                users.update_one({ 'username': user.username }, { '$push': { 'courses': { 'name': course['name'], 'stage1': False, 'stage2': False } } })

    if not content['addedUser']: 
        raise HTTPException(status_code=400, detail="Invalid request")
    
    return JSONResponse(content = content)

@app.delete("/delete-user", status_code = 200)
def deleteUser(request: Request, user: findUser):
    
    if checkRateLimit('deleteUser', 10): 
      raise HTTPException(status_code=429, detail="Too many requests")

    if getCookie('username', request.headers['cookies']) == user.username: 
      raise HTTPException(status_code=400, detail="Bad request")

    if not authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])) or not authorizedAdmin(getCookie('username', request.headers['cookies'])): 
      raise HTTPException(status_code=401, detail="Unauthorized") 

    content = { 'deletedUser': False }

    if user.username:     
      if users.find_one_and_delete({ 'username': user.username }):
        content['deletedUser'] = True 
      
    return JSONResponse(content = content)

@app.get("/get-courses", status_code = 200)
def getCourses(request: Request):
  
  if checkRateLimit('getCourses', 30): 
    raise HTTPException(status_code=429, detail="Too many requests")

  if not authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])) or not authorizedAdmin(getCookie('username', request.headers['cookies'])): 
    raise HTTPException(status_code=401, detail="Unauthorized") 

  content = { 'courses': [json.loads(json_util.dumps(course)) for course in courses.find()] }
  response = JSONResponse(content = content) 

  return response 

@app.get("/get-course/{name}", status_code = 200)
def getCourse(request: Request, name: str): 

  if checkRateLimit('getCourse', 80): 
    raise HTTPException(status_code=429, detail="Too many requests")

  if not authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])): 
    raise HTTPException(status_code=401, detail="Unauthorized") 

  content = {}
  content['course'] = courses.find_one({ 'name': name })

  if not content['course']:
    raise HTTPException(status_code=404, detail="Not found")

  content['course'] = json.loads(json_util.dumps(content['course']))
  return JSONResponse(content = content)  
  

@app.post("/add-course", status_code = 200)
def addCourse(request: Request, course: Course):

    if checkRateLimit('addCourse', 10): 
      raise HTTPException(status_code=429, detail="Too many requests")

    if not authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])) or not authorizedAdmin(getCookie('username', request.headers['cookies'])): 
      raise HTTPException(status_code=401, detail="Unauthorized") 

    if course.threshold <= 0 or course.threshold > 10: 
      raise HTTPException(status_code=400, detail="Invalid request")

    content = { 'addedCourse': False }
    newCourse = dict(course)
    newCourse['date'] = date.today().strftime("%d/%m/%Y") 

    if not courses.find_one({ 'name': course.name }): 
      courses.insert_one(newCourse) 
      content['addedCourse'] = True 

      if course.area != 'General':
        users.update_many({ 'area': course.area }, { '$push': { 'courses' : { 'name': course.name, 'stage1': False, 'stage2': False } } }) 

      else: 
        users.update_many({ 'rank': { '$ne': True }}, { '$push': { 'courses' : { 'name': course.name, 'stage1': False, 'stage2': False } } })

    return JSONResponse(content = content)

@app.delete("/delete-course", status_code = 200)
def deleteCourse(request: Request, course: findCourse): 
    
    if checkRateLimit('deleteCourse', 10): 
      raise HTTPException(status_code=429, detail="Too many requests")

    if not authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])) or not authorizedAdmin(getCookie('username', request.headers['cookies'])): 
      raise HTTPException(status_code=401, detail="Unauthorized") 

    content = { 'deletedCourse': False }

    if courses.find_one_and_delete({ 'name': course.name }):
      content['deletedCourse'] = True 
    
    if course.area != 'General':
      users.update_many({ 'area':  course.area }, { '$pull': { 'courses': { 'name': course.name } } })
    
    else: 
      users.update_many({ 'rank': { '$ne': True } }, { '$pull': { 'courses': { 'name': course.name } } })

    return JSONResponse(content = content)

@app.post("/complete-first-stage", status_code = 200)
def completeFirstStage(request: Request, details: Stage): 

  if checkRateLimit('completeFirst', 50): 
    raise HTTPException(status_code=429, detail="Too many requests")

  if not authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])) or authorizedAdmin(getCookie('username', request.headers['cookies'])): 
    raise HTTPException(status_code=401, detail="Unauthorized")  

  content = { 'completedStage': False }
  
  user = dict(users.find_one({ 'username': details.username }))
  
  for cur in user['courses']: 
    if cur['name'] == details.coursename: 
      cur['stage1'] = True 
      users.delete_one({ 'username': details.username })
      users.insert_one(user) 
      content['completedStage'] = True 
      break

    
  return JSONResponse(content = content)

@app.post("/complete-second-stage", status_code = 200)
def completeSecondStage(request: Request, details: Stage): 

  if checkRateLimit('completeSecond', 50): 
    raise HTTPException(status_code=429, detail="Too many requests")

  if not authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])) or authorizedAdmin(getCookie('username', request.headers['cookies'])): 
    raise HTTPException(status_code=401, detail="Unauthorized")  

  content = { 'completedStage': False }
  
  user = dict(users.find_one({ 'username': details.username }))
  course = dict(courses.find_one({ 'name': details.coursename })) 

  cur = count = 0 

  for question in course['questions']: 
    if details.answers[cur] in question['correct']: 
      count += 1 
    
    cur += 1 
  
  score = count / len(details.answers)

  for cur in user['courses']: 
    if cur['name'] == details.coursename: 
      if score >= (course['threshold'] / 10):
        cur['stage2'] = score 
        content['completedStage'] = True 
      else: 
        cur['stage1'] = False 

      users.delete_one({ 'username': details.username })
      users.insert_one(user) 
      break
        
  return JSONResponse(content = content)

@app.get("/summary-first-stage/{coursename}", status_code = 200)
def summaryFirstStage(request: Request, coursename: str): 

  if checkRateLimit('summaryFirst', 30): 
    raise HTTPException(status_code=429, detail="Too many requests")

  if not authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])) or not authorizedAdmin(getCookie('username', request.headers['cookies'])): 
    raise HTTPException(status_code=401, detail="Unauthorized")  

  full_course = dict(courses.find_one({ 'name': coursename }))
  suitable_users = [user['courses'] for user in users.find({ '$and': [{ 'area': full_course['area'] }, { 'rank': { '$ne': True } } ]})]

  if full_course['area'] == 'General': 
    suitable_users = [user['courses'] for user in users.find({ 'rank': { '$ne': True } })]

  content = { 'total': len(suitable_users), 'completed': 0 }

  for cur in suitable_users:
    for each in cur: 
      if each['name'] == coursename and each['stage1']: 
        content['completed'] += 1 

  return JSONResponse(content = content)

@app.get("/summary-second-stage/{coursename}", status_code = 200)
def summarySecondStage(request: Request, coursename: str): 

  if checkRateLimit('summarySecond', 30): 
    raise HTTPException(status_code=429, detail="Too many requests")

  if not authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])) or not authorizedAdmin(getCookie('username', request.headers['cookies'])): 
    raise HTTPException(status_code=401, detail="Unauthorized")  

  full_course = courses.find_one({ 'name': coursename })
  suitable_users = [user['courses'] for user in users.find({ '$and': [{ 'area': full_course['area'] }, { 'rank': { '$ne': True } } ]})]

  if full_course['area'] == 'General': 
    suitable_users = [user['courses'] for user in users.find({ 'rank': { '$ne': True } })]

  content = { 'total': len(suitable_users), 'completed': 0 }

  for cur in suitable_users:
    for each in cur: 
      if each['name'] == coursename and each['stage2']: 
        content['completed'] += 1

  return JSONResponse(content = content)

@app.post("/reassign-course", status_code = 200)
def reassignCourse(request: Request, course: findCourse):
  
  if checkRateLimit('reassignCourse', 20): 
    raise HTTPException(status_code=429, detail="Too many requests")

  if not authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])) or not authorizedAdmin(getCookie('username', request.headers['cookies'])): 
    raise HTTPException(status_code=401, detail="Unauthorized")  

  users.update_many({ 'rank': { '$ne': True } }, { '$pull': { 'courses': { 'name': course.name } } })
  users.update_many({ 'rank': { '$ne': True } }, { '$push': { 'courses' : { 'name': course.name, 'stage1': False, 'stage2': False } } })

  return JSONResponse(content = { 'reassignedCourse': True })


@app.post("/change-phone-number", status_code = 200)
def changePhoneNumber(request: Request, details: ChangePhone): 

  if checkRateLimit('changePhone', 20): 
    raise HTTPException(status_code=429, detail="Too many requests")

  if not authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])) or not authorizedAdmin(getCookie('username', request.headers['cookies'])): 
    raise HTTPException(status_code=401, detail="Unauthorized")  

  content = { 'changedPhone': False }

  users.update_one({ 'username': details.username }, { '$set': { 'phone_number': details.phone_number } })
  content['changedPhone'] = True 

  return JSONResponse(content = content)

@app.get('/get-contacts', status_code = 200)
def getContacts(request: Request): 

  if checkRateLimit('getContacts', 80): 
    raise HTTPException(status_code=429, detail="Too many requests")

  if not authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])): 
    raise HTTPException(status_code=401, detail="Unauthorized") 

  content = { 'contacts': [json.loads(json_util.dumps(contact)) for contact in contacts.find()] }
  response = JSONResponse(content = content) 

  return response 

@app.post('/add-contact', status_code = 200)
def addContact(request: Request, contact: Contact): 

  if checkRateLimit('addContact', 20): 
    raise HTTPException(status_code=429, detail="Too many requests")

  if not authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])) or not authorizedAdmin(getCookie('username', request.headers['cookies'])): 
    raise HTTPException(status_code=401, detail="Unauthorized") 

  content = { 'addedContact': False }

  if not contact.phone_number: 
    raise HTTPException(status_code=400, detail="Bad request") 

  if not contacts.find_one({ 'name': contact.name }): 
    contacts.insert_one(dict(contact)) 
    content['addedContact'] = True 
  
  return JSONResponse(content = content)

@app.delete('/delete-contact', status_code = 200)
def deleteContact(request: Request, contact: Contact): 

  if checkRateLimit('deleteContact', 20): 
    raise HTTPException(status_code=429, detail="Too many requests")

  if not authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])) or not authorizedAdmin(getCookie('username', request.headers['cookies'])): 
    raise HTTPException(status_code=401, detail="Unauthorized")  

  if not contacts.find_one({ 'name': contact.name }): 
    raise HTTPException(status_code=404, detail="Not found") 
  
  contacts.delete_one({ 'name': contact.name })
  
  return JSONResponse(content = { 'deletedContact': True })

@app.get('/users-csv-file', status_code = 200)
async def getCSV(request: Request): 

  if checkRateLimit('getCSV', 2): 
    raise HTTPException(status_code=429, detail="Too many requests")
  
  if not authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])) or not authorizedAdmin(getCookie('username', request.headers['cookies'])): 
      raise HTTPException(status_code=401, detail="Unauthorized") 

  with open('/tmp/usuarios_exporte.csv', 'w', encoding='UTF8') as csv_file:

    writer = csv.writer(csv_file)

    headers = ['Name', 'Administrador', 'Area', 'Telefono', 'Cursos']

    writer.writerow(headers) 

    for user in [user for user in users.find()]: 
      filtered = [user['username'], user['rank'], user['area'], user.get('phone_number')]

      for course in user['courses']: 
        filtered.append(course['name']) 
        filtered.append(course['stage1'])
        filtered.append(course['stage2'] * 100)  
       
      writer.writerow(filtered)

  return FileResponse('/tmp/usuarios_exporte.csv')

@app.post('/add-message', status_code = 200)
def addMessage(request: Request, message: Message): 
  if checkRateLimit('addMessage', 20): 
    raise HTTPException(status_code=429, detail="Too many requests")
  
  if not authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])) or not authorizedAdmin(getCookie('username', request.headers['cookies'])): 
      raise HTTPException(status_code=401, detail="Unauthorized") 

  if not message.message: 
    raise HTTPException(status_code=400, detail="Bad request") 

  messages.insert_one(dict(message)) 
  
  return JSONResponse(content = { 'addedMessage': True })

@app.delete('/delete-message', status_code = 200)
def deleteMessage(request: Request, message: Message): 

  if checkRateLimit('deleteMessage', 20): 
    raise HTTPException(status_code=429, detail="Too many requests")

  if not authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])) or not authorizedAdmin(getCookie('username', request.headers['cookies'])): 
    raise HTTPException(status_code=401, detail="Unauthorized")  

  if not messages.find_one({ 'message': message.message }): 
    raise HTTPException(status_code=404, detail="Not found") 
  
  messages.delete_one({ 'message': message.message })
  
  return JSONResponse(content = { 'deletedMessage': True })

@app.get('/get-messages', status_code = 200)
def getMessages(request: Request): 

  if checkRateLimit('getMessages', 80): 
    raise HTTPException(status_code=429, detail="Too many requests")

  if not authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])): 
    raise HTTPException(status_code=401, detail="Unauthorized") 

  content = { 'messages': [json.loads(json_util.dumps(message)) for message in messages.find()] }
  response = JSONResponse(content = content) 

  return response 

@app.post('/change-contact', status_code = 200)
def changeContact(request: Request, contact: changeContact): 

  if checkRateLimit('changeContact', 30): 
    raise HTTPException(status_code=429, detail="Too many requests")

  if not authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])): 
    raise HTTPException(status_code=401, detail="Unauthorized") 

  contacts.delete_one({ 'name': contact.prevName })
  prototype = dict(contact)
  prototype.pop('prevName')
  contacts.insert_one(prototype) 

  return JSONResponse(content = { 'changedContact': True })

@app.post('/change-message', status_code = 200)
def changeMessage(request: Request, message: changeMessage): 

  if checkRateLimit('changeMessage', 30): 
    raise HTTPException(status_code=429, detail="Too many requests")

  if not authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])): 
    raise HTTPException(status_code=401, detail="Unauthorized") 

  messages.delete_one({ 'message': message.prevMessage })
  messages.insert_one(dict({ 'message': message.newMessage })) 

  return JSONResponse(content = { 'changedMessage': True })

@app.post('/change-user', status_code = 200)
def changeUser(request: Request, user: changeUser): 

  if checkRateLimit('changeUser', 5): 
    raise HTTPException(status_code=429, detail="Too many requests")

  if not authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])): 
    raise HTTPException(status_code=401, detail="Unauthorized") 

  target = dict(users.find_one({'username': user.prevUsername}))

  
  prototype = dict(user)

  if prototype.get('password'): 
    prototype['password'] = bcrypt.hashpw(prototype.get('password').encode('utf8'), bcrypt.gensalt())
  else:
    prototype['password'] = target['password']

  if prototype['rank']:
    prototype['courses'] = []
  else:
    cur_courses = []

    if target['rank']: 
      for course in courses.find():
        actual = dict(course)
        if actual['area'] == prototype['area'] or actual['area'] == 'General':
          cur_courses.append({ 'name': actual['name'], 'stage1': False, 'stage2': False })

    else: 
      
      for course in target['courses']:
        actual = dict(courses.find_one({'name': course['name']}))
        if actual['area'] == prototype['area'] or actual['area'] == 'General':
          cur_courses.append(course)
    
      if prototype['area'] != target['area']: 
        for course in courses.find():
          actual = dict(course)
          if actual['area'] == prototype['area']:
            cur_courses.append({ 'name': actual['name'], 'stage1': False, 'stage2': False })
      
    prototype['courses'] = cur_courses


  users.delete_one({ 'username': user.prevUsername })
  prototype.pop('prevUsername')
  users.insert_one(prototype) 

  return JSONResponse(content = { 'changedUser': True })

@app.post('/change-password', status_code = 200)
def changePassword(request: Request, password: changePassword): 

  if checkRateLimit('changePassword', 15): 
    raise HTTPException(status_code=429, detail="Too many requests")

  if not authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])): 
    raise HTTPException(status_code=401, detail="Unauthorized") 

  encrypted_password = bcrypt.hashpw(password.newPassword.encode('utf8'), bcrypt.gensalt())
  users.update_one({ 'username': password.username }, {'$set': {'password': encrypted_password }})

  return JSONResponse(content = {'changedPassword': True})

@app.post('/change-course', status_code = 200)
def changeCourse(request: Request, course: Course): 
  if checkRateLimit('changeCourse', 10): 
    raise HTTPException(status_code=429, detail="Too many requests")

  if not authenticatedUser(getCookie('username', request.headers['cookies']), getCookie('token', request.headers['cookies'])): 
    raise HTTPException(status_code=401, detail="Unauthorized") 
  
  target = dict(courses.find_one({'name':course.prevName}))

  courses.delete_one({'name': course.prevName})
  prototype = dict(course)
  prototype.pop('prevName') 
  prototype['date'] = date.today().strftime("%d/%m/%Y") 
  courses.insert_one(prototype)

  if target['area'] != prototype['area']: 
    newUsers = users.find()

    for user in newUsers: 
      actual = dict(user)
      done = False
      
      if prototype['area'] == 'General' and actual['area'] == target['area']: 
        continue 
      
      if prototype['area'] == 'General' and actual['area'] != target['area']: 
        done = actual['username']
        actual['courses'].append({'name': prototype['name'], 'stage1': False, 'stage2': False})

      elif actual['area'] == prototype['area'] and target['area'] != 'General': 
        done = actual['username']
        actual['courses'].append({'name': prototype['name'], 'stage1': False, 'stage2': False})
        
      elif actual['area'] != prototype['area'] and (target['area'] == 'General' or actual['area'] == target['area']): 
        done = actual['username']
        for i in range(len(actual['courses'])): 
          if actual['courses'][i]['name'] == target['name']: 
            actual['courses'] = actual['courses'][: i] + actual['courses'][i + 1: ]
            break
      
      if done: 
        users.delete_one({'username': done})
        users.insert_one(actual)

  return JSONResponse(content = { 'changedCourse': True })
