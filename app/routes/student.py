from flask import jsonify
from datetime import datetime
from app.models import Students, Notices, College, Queries, QueryReplies
from app.extensions import db
from flask import abort
from flask import make_response
from flask import render_template
from flask import request
from flask import Blueprint
from flask import session
from flask import redirect
from flask import url_for

student_bp=Blueprint('student', __name__, url_prefix="/student")

@student_bp.route("/dashboard")
def dashboard():
    if 'user_id' not in session or session.get('role') != 'student':
        session.clear()  # wipe any partial/wrong session
        return redirect(url_for('auth.login'))

    db_student = Students.query.filter_by(student_id=session["user_id"]).first()

    name = db_student.full_name.strip().split()

    if len(name) == 1:
        initials = name[0][0].upper()
    else:
        initials = (name[0][0] + name[-1][0]).upper()

    full_name=db_student.full_name
    prn=db_student.prn
    db_college=College.query.filter_by(college_id=db_student.college_id).first()
    college_name=db_college.college_name


    response = make_response(render_template("student_dashboard.html", full_name=full_name, initials=initials, prn=prn, college_name=college_name))
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma']        = 'no-cache'
    response.headers['Expires']       = '0'
    return response

@student_bp.route("/get_notices")
def get_notices():
    if 'user_id' not in session or session["role"]!="student":
        return abort(401)

    db_student = Students.query.filter_by(student_id=session["user_id"]).first()

    if db_student:
        college_id = db_student.college_id

        notices=Notices.query.filter_by(college_id=college_id).order_by(Notices.posted_at.desc()).all()

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
    
    # for fallback
    return jsonify({"success": False, "notices": []})

@student_bp.route("/get_questions")
def get_questions():
    if 'user_id' not in session or session["role"]!="student":
        return abort(401)

    db_student=Students.query.filter_by(student_id=session["user_id"]).first()

    if db_student:
        db_queries=Queries.query.filter_by(college_id=db_student.college_id).order_by(Queries.posted_at.desc()).all()

        queries=[]

        for query in db_queries:
            db_queryReplies=QueryReplies.query.filter_by(query_id=query.query_id).order_by(QueryReplies.replied_at.asc()).all()

            queryReplies=[]

            for reply in db_queryReplies:
                queryReplies.append({
                    "reply_id": reply.reply_id,  
                    "is_admin": reply.is_admin,
                    "reply_text": reply.reply_text,
                    "replied_at": str(reply.replied_at)
                })

           
            queries.append({
                "query_id": query.query_id,
                "question_text": query.question_text,
                "replies": queryReplies,
                "is_answered": query.is_answered,
                "posted_at": str(query.posted_at)
            })

        return jsonify({"success":True, "questions": queries})
    
    return jsonify({"success": False})

@student_bp.route("/post_question", methods=["POST"])
def post_question():
    if 'user_id' not in session or session["role"]!="student":
        return abort(401)

    data=request.get_json()

    question_text=data.get("question_text")

    if not question_text or len(question_text.strip()) < 20:
        return jsonify({"success":False, "error":"Enter minimum 20 charaters"})

    db_student=Students.query.filter_by(student_id=session["user_id"]).first()

    if db_student:
        query=Queries(
            student_id= session["user_id"],
            college_id= db_student.college_id,
            question_text= question_text,
            is_answered= False
        )

        try:
            db.session.add(query)
            db.session.commit()
            formatted_datetime = query.posted_at.strftime("%d %b %Y")
            return jsonify({"success": True, "query_id": query.query_id, "posted_at": formatted_datetime})

        except Exception as e:
            db.session.rollback()
            return jsonify({"success":False})
    
    return jsonify({"success": False})

@student_bp.route("/post_reply", methods=["POST"])
def post_reply():
    if 'user_id' not in session or session["role"]!="student":
        return abort(401)

    data=request.get_json()

    query_id=data.get("query_id")
    reply_text=data.get("reply_text")

    if not reply_text or len(reply_text.strip()) < 3:
        return jsonify({"success": False})

    queryReplay=QueryReplies(
        query_id=query_id,
        responder_id=session['user_id'], 
        is_admin=False, 
        reply_text=reply_text
    )

    try:
        db.session.add(queryReplay)
        db.session.commit()

        return jsonify({"success": True})

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False})