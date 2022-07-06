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
  area: str

    
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

@app.post("/add-course", status_code = 200)
def addCourse(request: Request, course: Course): 
    
    content = { 'addedCourse': False }
    newCourse = dict(course)
    newCourse['date'] = date.today().strftime("%d/%m/%Y") 

    if not courses.find_one({ 'name': course.name }): 
      courses.insert_one(newCourse) 
      content['addedCourse'] = True 
    
      users.update_many({ 'area': course.area }, { '$push': { 'courses' : { 'name': course.name, 'stage1': False, 'stage2': False } } }) 

    return JSONResponse(content = content)

@app.delete("/delete-course", status_code = 200)
def deleteCourse(request: Request, course: findCourse): 
    
    content = { 'deletedCourse': False }

    if courses.find_one_and_delete({ 'name': course.name }):
      content['deletedCourse'] = True 
    
    users.update_many({ 'area':  course.area }, { '$pull': { 'courses': { 'name': course.name } } })
    return JSONResponse(content = content)
    



