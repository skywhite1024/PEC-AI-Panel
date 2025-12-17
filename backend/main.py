from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import engine, Base
from .api import auth

app = FastAPI(title='PEC-AI Backend')

# CORS: 根据需要调整
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)

@app.get('/')
def root():
    return {'status': 'ok', 'service': 'PEC-AI backend'}

