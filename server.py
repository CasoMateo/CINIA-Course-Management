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

class User(BaseModel):
  username: str
  password: str 
  rank: bool
  area: str 

class findUser(BaseModel): 
  username: str
    
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

  content['user'] = json.loads(json_util.dumps(content['user']))
  return JSONResponse(content = content)

@app.post("/add-user", status_code = 200)
def addUser(request: Request, user: User):
    
    content = {'addedUser': False}
    password = bcrypt.hashpw(user.password.encode('utf8'), bcrypt.gensalt())
    newUser = { 'username': user.username, 'password': password, 'area': user.area, 'rank': user.rank, 'courses': {} } 
    
    if user.username and user.password and user.area:
        if not users.find_one({ 'username': user.username }): 
            users.insert_one(newUser)
            content['addedUser'] = True 
         
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
