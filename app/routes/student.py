from flask import jsonify
from datetime import datetime
from app.models import Students, Notices, College 
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