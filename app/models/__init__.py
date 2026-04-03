from app.extensions import db
from datetime import datetime

class College(db.Model):
    __tablename__ ="colleges"

    college_id= db.Column(db.Integer, primary_key=True)
    aishe_code= db.Column(db.String(200), unique=True, nullable=False)
    secret_key= db.Column(db.String(200), nullable=False)
    admin_email= db.Column(db.String(200), nullable=False)
    password=db.Column(db.String(200), nullable=False)
    status=db.Column(db.Boolean, nullable=False, default=False)
    created_at=db.Column(db.DateTime, default=datetime.utcnow)

class StoryImages(db.Model):
    __tablename__="story_images"

    image_id= db.Column(db.Integer, primary_key=True)
    process= db.Column(db.String(200), nullable=False)
    step_number= db.Column(db.Integer, nullable=False)
    image_path= db.Column(db.String(200), nullable=False)
    caption= db.Column(db.String(200))
    method= db.Column(db.String(200))

class ScholarshipData(db.Model):
    __tablename__="scholarship_data"

    scheme_id= db.Column(db.Integer, primary_key=True)
    name= db.Column(db.String(200), nullable=False, unique=True)
    department= db.Column(db.String(200), nullable=False)
    category= db.Column(db.String(200), nullable=False)
    eligibility_json= db.Column(db.Text, nullable=False)
    documents_json= db.Column(db.Text, nullable=False)
    official_link= db.Column(db.String(200), nullable=False)
    updated_at= db.Column(db.DateTime, default=datetime.utcnow)

class Students(db.Model):
    __tablename__="students"
    __table_args__ = (db.UniqueConstraint('prn', 'college_id'),)

    student_id= db.Column(db.Integer, primary_key=True)
    college_id= db.Column(db.Integer, db.ForeignKey('colleges.college_id'), nullable=False)
    full_name= db.Column(db.String(200), nullable=False)
    email= db.Column(db.String(200), nullable=False, unique=True)
    password= db.Column(db.String(200), nullable=False)
    prn= db.Column(db.String(200), nullable=False)
    contact_number= db.Column(db.String(10), nullable=False)
    department= db.Column(db.String(200), nullable=False)
    year= db.Column(db.String(200), nullable=False)
    is_verified= db.Column(db.Boolean, nullable=False, default=False)
    joined_at= db.Column(db.DateTime, default=datetime.utcnow)

class Notices(db.Model):
    __tablename__="notices"

    notice_id= db.Column(db.Integer, primary_key=True)
    college_id= db.Column(db.Integer, db.ForeignKey('colleges.college_id'), nullable=False)
    title= db.Column(db.String(200), nullable=False)
    content= db.Column(db.Text, nullable=False)
    type= db.Column(db.String(200))
    deadline_date= db.Column(db.DateTime)
    is_active= db.Column(db.Boolean, nullable=False, default=True)
    academic_year= db.Column(db.String(200))
    posted_at= db.Column(db.DateTime, default=datetime.utcnow)

class InviteTokens(db.Model):
    __tablename__="invite_tokens"

    token_id= db.Column(db.Integer, primary_key=True) 
    college_id= db.Column(db.Integer, db.ForeignKey('colleges.college_id'), nullable=False)
    token= db.Column(db.String(200), unique=True, nullable=False)
    is_active= db.Column(db.Boolean, nullable=False, default=True)
    created_at= db.Column(db.DateTime, default=datetime.utcnow)

class Queries(db.Model):
    __tablename__="queries"

    query_id= db.Column(db.Integer, primary_key=True) 
    student_id= db.Column(db.Integer, db.ForeignKey('students.student_id'), nullable=False) 
    college_id= db.Column(db.Integer, db.ForeignKey('colleges.college_id'), nullable=False) 
    question_text= db.Column(db.Text, nullable=False)
    is_answered= db.Column(db.Boolean, nullable=False, default=False)
    posted_at= db.Column(db.DateTime, default=datetime.utcnow)

class EmailVerifications(db.Model):
    __tablename__="email_verifications"

    verify_id= db.Column(db.Integer, primary_key=True) 
    student_id= db.Column(db.Integer, db.ForeignKey('students.student_id'), nullable=False)
    token=  db.Column(db.String(200), nullable=False)
    expires_at= db.Column(db.DateTime)
    is_used= db.Column(db.Boolean, nullable=False, default=False)

class StepReports(db.Model):
    __tablename__="step_reports"

    report_id= db.Column(db.Integer, primary_key=True) 
    student_id= db.Column(db.Integer, db.ForeignKey('students.student_id'), nullable=False) 
    process=  db.Column(db.String(200), nullable=False)
    step_number= db.Column(db.Integer, nullable=False)
    reported_at= db.Column(db.DateTime, default=datetime.utcnow) 

class StudentScholarshipData(db.Model):
    __tablename__="student_scholarship_data"

    record_id= db.Column(db.Integer, primary_key=True) 
    student_id= db.Column(db.Integer, db.ForeignKey('students.student_id'), nullable=False)
    college_id= db.Column(db.Integer, db.ForeignKey('colleges.college_id'), nullable=False)
    application_id=  db.Column(db.String(200), nullable=False)
    category=  db.Column(db.String(200), nullable=False)
    scheme_name=  db.Column(db.String(200), nullable=False)
    application_date=db.Column(db.DateTime)
    status=  db.Column(db.String(200))
    added_via=  db.Column(db.String(200))

class QueryReplies(db.Model):
    __tablename__="query_replies"

    reply_id= db.Column(db.Integer, primary_key=True) 
    query_id= db.Column(db.Integer, db.ForeignKey('queries.query_id'), nullable=False)
    responder_id= db.Column(db.Integer, nullable=False)
    is_admin= db.Column(db.Boolean, nullable=False, default=False)
    reply_text=  db.Column(db.Text, nullable=False)
    replied_at= db.Column(db.DateTime, default=datetime.utcnow) 