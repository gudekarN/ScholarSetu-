from app.utils import get_academic_year
from flask_mail import Message
from app.models import Students
from datetime import datetime
from flask import jsonify
from app.extensions import db, mail
from app.models import InviteTokens, Notices, Queries, QueryReplies
from flask import abort
from app.models import College
from flask import render_template
from flask import request
from flask import Blueprint
from flask import session
from flask import redirect
from flask import url_for
from flask import make_response
import uuid 

admin_bp=Blueprint('admin', __name__, url_prefix='/admin')

# Admin dashboard

@admin_bp.route("/dashboard")
def dashboard():
    if 'user_id' not in session or session.get('role') != 'admin':
        session.clear() # wipe any partial/wrong session
        return redirect(url_for('auth.login'))

    response = make_response(render_template("admin_dashboard.html"))
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma']        = 'no-cache'
    response.headers['Expires']       = '0'
    return response

# Generate token (Generate by admin)

@admin_bp.route("/generate_token", methods=["GET", "POST"])
def generate_token():
    if request.method=="POST":
        if 'user_id' not in session or session["role"]!="admin":
            return abort(401)

        existing=InviteTokens.query.filter_by(college_id=session['user_id'], is_active=True).first()

        if existing:
            existing.is_active=False
            db.session.commit()

        token=str(uuid.uuid4())

        new_token=InviteTokens(
            college_id=session['user_id'],
            token=token,
            is_active=True
        )

        try:
            db.session.add(new_token)
            db.session.commit()
            return jsonify({"success": True, "token": token})

        except Exception as e:
            db.session.rollback()
            return jsonify({"success": False})

# Get Token (This code is define for get the real token show in generate token field for the perticular college)

@admin_bp.route("/get_token")
def get_token():
    if 'user_id' not in session or session.get('role') != 'admin':
        return abort(401)

    inviteToken=InviteTokens.query.filter_by(college_id=session['user_id'], is_active=True).first()

    if inviteToken:
        token=inviteToken.token
        createdAt=inviteToken.created_at

        return jsonify({"success":True, "token":token, "created_at":str(createdAt)})

    return jsonify({"success":False})

@admin_bp.route("/post_notice", methods=["POST"])
def post_notice():
    if request.method=="POST":

        if 'user_id' not in session or session["role"]!="admin":
            return abort(401)

        data=request.get_json()

        title=data.get("title")
        content=data.get("content")
        notice_type =data.get("type")
        deadline_date=data.get("deadline_date")

        parsed_deadline = None
        if deadline_date:
            parsed_deadline = datetime.strptime(deadline_date, "%Y-%m-%d")

        db_college=College.query.filter_by(college_id=session["user_id"]).first()

        if db_college:

            notice=Notices(
                college_id=session["user_id"],
                title= title,
                content= content,
                type= notice_type ,
                deadline_date= parsed_deadline,
                academic_year=get_academic_year()
            )

            try:
                db.session.add(notice)
                db.session.commit()

                if notice_type =="high":
                    db_student=Students.query.filter_by(college_id=session["user_id"]).all()

                    emails = [s.email for s in db_student]

                    html_body = f"""
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                        <h2 style="color: #e07b00;">{title}</h2>
                        <p style="font-size: 15px; color: #333;">{content}</p>
                        <hr style="border: none; border-top: 1px solid #eee;">
                        <p style="font-size: 12px; color: #888;">This is an automated notice from ScholarSetu. Do not reply to this email.</p>
                    </div>
                    """

                    message = Message(
                        subject=title,
                        sender="gudekarnihar96@gmail.com",
                        recipients=emails
                    )
                    message.html = html_body
                    mail.send(message)

                return jsonify({"success":True})
                
            except Exception as e:
                db.session.rollback()
                return jsonify({"success":False})
        
        return jsonify({"success":False})

@admin_bp.route("/get_notices")
def get_notices():
    if 'user_id' not in session or session["role"]!="admin":
        return abort(401)

    notices=Notices.query.filter_by(college_id=session["user_id"]).order_by(Notices.posted_at.desc()).all()

    if notices:

        data=[]

        for notice in notices:
            data.append({
                "notice_id": notice.notice_id,
                "title": notice.title,
                "content": notice.content,
                "type": notice.type,
                "deadline_date": str(notice.deadline_date) if notice.deadline_date else None,
                "posted_at": notice.posted_at.strftime("%d %b %Y") if notice.posted_at else None
            })

        return jsonify({"success": True, "notices": data})

    return jsonify({"success":False})

@admin_bp.route("/get_students")
def get_students():
    if "user_id" not in session or session["role"]!="admin":
        return abort(401)

    db_students=Students.query.filter_by(college_id=session["user_id"]).order_by(Students.student_id.asc()).all()

    if db_students:
        data=[]

        for student in db_students:
            data.append({
                "student_id": student.student_id,
                "full_name":student.full_name,
                "prn":student.prn,
                "email":student.email,
                "contact_number":student.contact_number,
                "department":student.department,
                "year":student.year,
                "is_verified":student.is_verified,
                "joined_at":datetime.strftime(student.joined_at, "%Y-%m-%d")
            })

        return jsonify({"success":True, "students":data})

    return jsonify({"success":False})
        
@admin_bp.route("/update_student", methods=["POST"])
def update_student():
    if request.method=="POST":
        if "user_id" not in session or session["role"]!="admin":
            return abort(401)

        data=request.get_json()
        student_id= data.get("student_id")

        db_student=Students.query.filter_by(college_id=session["user_id"], student_id=student_id).first()

        if db_student:
            try:
                db_student.full_name= data.get("full_name", db_student.full_name)
                db_student.prn= data.get("prn", db_student.prn)
                db_student.email= data.get("email", db_student.email)
                db_student.contact_number= data.get("contact_number", db_student.contact_number)
                db_student.department= data.get("department", db_student.department)
                db_student.year= data.get("year", db_student.year)

                db.session.commit()

                return jsonify({"success":True})

            except Exception as e:
                db.session.rollback()
                
        return jsonify({"success":False}) 

@admin_bp.route("/get_queries")
def get_queries():
    if "user_id" not in session or session["role"]!="admin":
            return abort(401)

    db_queries=Queries.query.filter_by(college_id=session["user_id"]).order_by(Queries.posted_at.desc()).all()

    queries=[]
    
    for query in db_queries:
        db_student=Students.query.filter_by(student_id=query.student_id).first()

        db_queryReplies=QueryReplies.query.filter_by(query_id=query.query_id).order_by(QueryReplies.replied_at.asc()).all()

        queryReplies=[]

        for reply in db_queryReplies:
            if reply.is_admin:
                responder_name = "Admin"
                responder_email = "Replay By Admin" if db_student else ""
            else:
                responder = Students.query.filter_by(student_id=reply.responder_id).first()
                responder_name = responder.full_name if responder else "Student"
                responder_email = responder.email if responder else ""

            queryReplies.append({
                "reply_id":        reply.reply_id,
                "is_admin":        reply.is_admin,
                "reply_text":      reply.reply_text,
                "replied_at":      str(reply.replied_at),
                "responder_name":  responder_name,
                "responder_email": responder_email
            })

        queries.append({
            "query_id": query.query_id,
            "question_text": query.question_text,
            "replies": queryReplies,
            "is_answered": query.is_answered,
            "posted_at": str(query.posted_at),
            "student_name": db_student.full_name,
            "student_email": db_student.email
        })

    return jsonify({"success": True, "questions": queries})

@admin_bp.route("/post_reply", methods=["POST"])
def post_reply():
    if "user_id" not in session or session["role"]!="admin":
        return abort(401)

    data=request.get_json()

    query_id=data.get("query_id")
    reply_text=data.get("reply_text")

    if not reply_text or len(reply_text.strip()) <=2:
        return jsonify({"success": False})

    query=Queries.query.filter_by(college_id=session["user_id"], query_id=query_id).first()    
    
    if not query:
        return jsonify({"success":False})

    queryreply=QueryReplies(
        query_id=query_id, 
        responder_id=session['user_id'], 
        is_admin=True, 
        reply_text=reply_text
    )

    query=Queries.query.get(query_id)
    query.is_answered=True

    try:
        db.session.add(queryreply)
        db.session.commit()
        
        return jsonify({"success":True})
    except Exception as e:
        db.session.rollback()

        return jsonify({"success":False})