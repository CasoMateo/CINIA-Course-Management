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

score_threshold = 0.6

class User(BaseModel):
  username: str
  password: str 
  employee_number: int
  rank: bool
  area: str 

class Course(BaseModel):
  name: str
  area: str 
  resources: list
  questions: list 

class findUser(BaseModel): 
  username: str

class findCourse(BaseModel): 
  name: str
  area: Optional[str]

class Stage(BaseModel): 
  username: str
  coursename: str
  answers: Optional[list]

@app.get("/get-users", status_code = 200)
def getUsers(request: Request):
  
  operators = [json.loads(json_util.dumps(user)) for user in users.find()]
  
  content = { 'users': operators }
  response = JSONResponse(content) 

  return response 

@app.get("/get-user/{usernameID}", status_code = 200)
def getUser(request: Request, usernameID: str):
  
  content = {}
  content['user'] = users.find_one({ '_id': ObjectId(usernameID) })

  if not content['user']:
    raise HTTPException(status_code=404, detail="Not found")

  content['user'] = json.loads(json_util.dumps(content['user']))
  return JSONResponse(content = content)

@app.post("/add-user", status_code = 200)
def addUser(request: Request, user: User):
    
    content = {'addedUser': False}
    password = bcrypt.hashpw(user.password.encode('utf8'), bcrypt.gensalt())
    newUser = { 'username': user.username, 'password': password, 'employee_number': user.employee_number, 'area': user.area, 'rank': user.rank, 'courses': [] } 
    
    if user.username and user.password and user.area and user.employee_number:
        if not users.find_one({ 'username': user.username }): 
            users.insert_one(newUser)
            content['addedUser'] = True 

            needed_courses = [json.loads(json_util.dumps(course)) for course in courses.find({ 'area': user.area })]
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
    
    content = { 'addedCourse': False }
    newCourse = dict(course)
    newCourse['date'] = date.today().strftime("%d/%m/%Y") 

    if not courses.find_one({ 'name': course.name }): 
      courses.insert_one(newCourse) 
      content['addedCourse'] = True 

      if course.area != 'General':
        users.update_many({ 'area': course.area }, { '$push': { 'courses' : { 'name': course.name, 'stage1': False, 'stage2': False } } }) 

      else: 
        users.update_many({ 'area': { '$ne': 'Administrativo' }}, { '$push': { 'courses' : { 'name': course.name, 'stage1': False, 'stage2': False } } })

    return JSONResponse(content = content)

@app.delete("/delete-course", status_code = 200)
def deleteCourse(request: Request, course: findCourse): 
    
    content = { 'deletedCourse': False }

    if courses.find_one_and_delete({ 'name': course.name }):
      content['deletedCourse'] = True 
    
    if course.area != 'General':
      users.update_many({ 'area':  course.area }, { '$pull': { 'courses': { 'name': course.name } } })
    
    else: 
      users.update_many({ }, { '$pull': { 'courses': { 'name': course.name } } })

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

  if score >= score_threshold: 
    for cur in user['courses']: 
      if cur['name'] == details.coursename: 
        cur['stage2'] = score 
        users.delete_one({ 'username': details.username })
        users.insert_one(user) 
        content['completedStage'] = True 
        break
    
    
  return JSONResponse(content = content)
