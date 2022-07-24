from typing import Optional
from fastapi import Cookie, FastAPI, HTTPException, Request
from fastapi.testclient import TestClient
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
import bcrypt
import os
from dotenv import load_dotenv, find_dotenv
from bson import json_util, ObjectId
import json 
from datetime import date
import jwt 

app = FastAPI()

origins = [
  "http://localhost:3000"
]

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

load_dotenv('.env')
cluster = MongoClient(os.getenv("CONNECTION_TO_DB"))
db = cluster['InventoryManagement']
users = db['operators']
courses = db['courses']
contacts = db['contacts']

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

class Contact(BaseModel): 
  name: str 
  phone_number: Optional[int] 

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


@app.post("/login", status_code = 200) 
def login(request: Request, user: Payload): 

  content = { 'loggedIn': False, 'admin': False }

  if user.username and user.password: 

    current = users.find_one({ 'username' : user.username}) 
    
    if current: 
      if bcrypt.checkpw(user.password.encode("utf8"), current['password']): 
        content['loggedIn'] = True 

        content['token'] = jwt.encode({ "username": user.username }, os.getenv('PRIVATE_TOKEN_KEY'), algorithm="HS256")

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
  
  operators = [json.loads(json_util.dumps(user)) for user in users.find()]
  
  content = { 'users': operators }
  response = JSONResponse(content) 

  return response 

@app.get("/get-user/{username}", status_code = 200)
def getUser(request: Request, username: str):
  
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
    
    content = { 'deletedUser': False }

    if user.username:     
      if users.find_one_and_delete({ 'username': user.username }):
        content['deletedUser'] = True 
      
    return JSONResponse(content = content)

@app.get("/get-courses", status_code = 200)
def getCourses(request: Request):
  
  content = { 'courses': [json.loads(json_util.dumps(course)) for course in courses.find()] }
  response = JSONResponse(content = content) 

  return response 

@app.get("/get-course/{name}", status_code = 200)
def getCourse(request: Request, name: str): 

  content = {}
  content['course'] = courses.find_one({ 'name': name })

  if not content['course']:
    raise HTTPException(status_code=404, detail="Not found")

  content['course'] = json.loads(json_util.dumps(content['course']))
  return JSONResponse(content = content)  
  

@app.post("/add-course", status_code = 200)
def addCourse(request: Request, course: Course): 
    
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

  content = { 'completedStage': False }
  
  user = dict(users.find_one({ 'username': details.username }))
  course = dict(courses.find_one({ 'name': details.coursename })) 

  cur = count = 0 

  for question in course['questions']: 
    if details.answers[cur] in question['correct']: 
      count += 1 
    
    cur += 1 
  
  score = count / len(details.answers)

  if score >= (course['threshold'] / 100): 
    for cur in user['courses']: 
      if cur['name'] == details.coursename: 
        cur['stage2'] = score 
        users.delete_one({ 'username': details.username })
        users.insert_one(user) 
        content['completedStage'] = True 
        break
    
    
  return JSONResponse(content = content)

@app.get("/summary-first-stage/{coursename}", status_code = 200)
def summaryFirstStage(request: Request, coursename: str): 

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
  
  users.update_many({ 'rank': { '$ne': True } }, { '$pull': { 'courses': { 'name': course.name } } })
  users.update_many({ 'rank': { '$ne': True } }, { '$push': { 'courses' : { 'name': course.name, 'stage1': False, 'stage2': False } } })

  return JSONResponse(content = { 'reassignedCourse': True })


@app.post("/change-phone-number", status_code = 200)
def changePhoneNumber(request: Request, details: ChangePhone): 

  content = { 'changedPhone': False }

  users.update_one({ 'username': details.username }, { '$set': { 'phone_number': details.phone_number } })
  content['changedPhone'] = True 

  return JSONResponse(content = content)

@app.get('/get-contacts', status_code = 200)
def getContacts(request: Request): 

  content = { 'contacts': [json.loads(json_util.dumps(contact)) for contact in contacts.find()] }
  response = JSONResponse(content = content) 

  return response 

@app.post('/add-contact', status_code = 200)
def addContact(request: Request, contact: Contact): 

  content = { 'addedContact': False }

  if not contact.phone_number: 
    raise HTTPException(status_code=400, detail="Bad request") 

  if not contacts.find_one({ 'name': contact.name }): 
    contacts.insert_one(dict(contact)) 
    content['addedContact'] = True 
  
  return JSONResponse(content = content)

@app.delete('/delete-contact', status_code = 200)
def deleteContact(request: Request, contact: Contact): 

  if not contacts.find_one({ 'name': contact.name }): 
    raise HTTPException(status_code=404, detail="Not found") 
  
  contacts.delete_one({ 'name': contact.name })
  
  return JSONResponse(content = { 'deletedContact': True })