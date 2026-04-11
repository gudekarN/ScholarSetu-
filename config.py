import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY=os.getenv('SECRET_KEY', 'fallback-key')
    SQLALCHEMY_DATABASE_URI=os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SUPERADMIN_EMAIL=os.getenv("SUPERADMIN_EMAIL")
    SUPERADMIN_PASSWORD=os.getenv("SUPERADMIN_PASSWORD")

    MAIL_SERVER   = 'smtp-relay.brevo.com'
    MAIL_PORT     = 587
    MAIL_USE_TLS  = True
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')