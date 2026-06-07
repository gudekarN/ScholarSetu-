import json
import os
from flask import jsonify
from datetime import datetime
from app.models import Students, Notices, College, Queries, QueryReplies, StoryImages, StepReports
from app.extensions import db
from flask import abort
from flask import make_response
from flask import render_template
from flask import request
from flask import Blueprint
from flask import session
from flask import redirect
from flask import url_for
from app.utils import check_eligibility

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


@student_bp.route('/check_eligibility', methods=['POST'])
def check_eligibility_route():
    if session.get('role') != 'student':
        return jsonify({"success": False, "message": "Unauthorized"}), 403

    data = request.get_json()

    inputs = {
        "domicile":              data.get("domicile"),
        "caste":                 data.get("caste"),
        "religion":              data.get("religion"),
        "income":                data.get("income"),
        "course_level":          data.get("course_level"),
        "course_type":           data.get("course_type"),
        "admission_type":        data.get("admission_type"),
        "year":                  data.get("year"),
        "percentage":            data.get("percentage"),
        "gap_years":             data.get("gap_years"),
        "applicant_type":        data.get("applicant_type"),
        "disability":            data.get("disability"),
        "disability_percentage": data.get("disability_percentage", 0),
        "gender":                data.get("gender"),
        "employment_status":     data.get("employment_status")
    }

    json_path = os.path.join(
        os.path.dirname(__file__), '..', 'static', 'data', 'scholarships.json'
    )

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            schemes = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        return jsonify({"success": False, "message": "Could not load scholarship data."}), 500

    eligible_schemes = check_eligibility(inputs, schemes)

    return jsonify({"success": True, "eligible_schemes": eligible_schemes})


@student_bp.route("/get_story/<process>/<method>")
def get_story(process, method):
    if 'user_id' not in session or session.get('role') != 'student':
        return jsonify({"success": False, "message": "Unauthorized"}), 401
    images = StoryImages.query.filter_by(process=process, method=method)\
               .order_by(StoryImages.step_number.asc()).all()
    if not images:
        return jsonify({"success": False, "message": "No steps found"})
    data = [
        {
            "step_number": img.step_number,
            "image_path": url_for('static', filename=img.image_path),
            "caption": img.caption,
            "description": img.description
        }
        for img in images
    ]
    return jsonify({"success": True, "steps": data})

@student_bp.route("/report_step", methods=["POST"])
def report_step():
    if 'user_id' not in session or session.get('role') != 'student':
        return jsonify({"success": False, "message": "Unauthorized"}), 401
    try:
        data = request.get_json()
        process = data.get('process')
        step_number = data.get('step_number')
        if not process or step_number is None:
            return jsonify({"success": False, "message": "Missing fields"})
        report = StepReports(
            student_id=session['user_id'],
            process=process,
            step_number=step_number
        )
        db.session.add(report)
        db.session.commit()
        return jsonify({"success": True})
    except Exception:
        db.session.rollback()
        return jsonify({"success": False})