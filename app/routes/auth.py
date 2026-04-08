from flask import jsonify
from flask import session
from flask import url_for
from flask import redirect
from flask import request
from flask import render_template
from flask import Blueprint
from app.extensions import db
from app.models import College, Students, SecretKeys
from werkzeug.security import generate_password_hash, check_password_hash
import os

auth_bp = Blueprint('auth', __name__, url_prefix="/auth")

@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method=="GET":
        return render_template("login.html")

    if request.method=="POST":
        email=request.form.get('email')
        password=request.form.get('password')
        role=request.form.get('role')

        if not email or not password or not role:
            return redirect(url_for('auth.login') + '?error=1')

        if role=='admin':

            college=College.query.filter_by(admin_email=email).first()

            if college:
                encrypted_password= college.password

                decrypted_password= check_password_hash(encrypted_password, password)

                if decrypted_password:
                    if college.status == False:
                        return redirect(url_for('auth.login') + '?error=pending')

                    session['user_id']=college.college_id
                    session['role']=role

                    return redirect(url_for('admin.dashboard'))
            
            return redirect(url_for('auth.login') + '?error=1')

        if role=='student':
            student=Students.query.filter_by(email=email).first()

            if student:
                encrypted_password=student.password

                decrypted_password= check_password_hash(encrypted_password, password)

                if decrypted_password:
                    if not student.is_verified:
                        return redirect(url_for('auth.login')+ '?error=pending')
                    session['user_id']=student.student_id
                    session['role']=role

                    return redirect(url_for('student.dashboard'))
            
            return redirect(url_for('auth.login') + '?error=1')

        if role=="superadmin":

            if email== os.getenv("SUPERADMIN_EMAIL") and password==os.getenv("SUPERADMIN_PASSWORD"):
                session['user_id']=email
                session['role']=role

                return redirect(url_for('superadmin.dashboard'))

            return redirect(url_for('auth.login') + '?error=1')

    return render_template("login.html")

@auth_bp.route("/logout", methods=["GET", "POST"])
def logout():
    session.clear()
    return redirect(url_for('main.index'))
    
@auth_bp.route("/register-college", methods=["GET", "POST"])
def register_college():
    if request.method=="GET":
        return render_template("register_college.html")

    if request.method=="POST":
        data=request.get_json()

        college_name=data.get('college_name')
        aishe_code=data.get('aishe_code')
        secret_key=data.get('secret_key')
        district=data.get('district')
        college_type=data.get('college_type')
        admin_email=data.get('admin_email')
        admin_phone=data.get('admin_phone')
        password=data.get('password')
        
        db_aishe_code=College.query.filter_by(aishe_code=aishe_code).first()
        db_secret_key=SecretKeys.query.filter_by(secret_key=secret_key, is_used=False).first()                                    
        db_admin_email=College.query.filter_by(admin_email=admin_email).first()

        if db_aishe_code:
            return jsonify({"success":False, "field":"aishe_code", "message": "Already registered"})

        if not db_secret_key:
            return jsonify({"success":False, "field":"secret_key", "message": "Wrong secret OR Application not approved yet"})

        if db_admin_email:
            return jsonify({"success":False, "field":"admin_email", "message": "Admin email already registered"})

        encrypted_password=generate_password_hash(password)

        college=College(
            college_name= college_name,
            aishe_code= aishe_code,
            secret_key= secret_key,
            district= district, 
            college_type= college_type,
            admin_email= admin_email,
            admin_phone= admin_phone,
            password= encrypted_password
        )

        try:
            db.session.add(college)
            db.session.commit()

            db_secret_key.is_used = True 
            db.session.commit()            


            return jsonify({"success":True})

        except Exception as e:
            db.session.rollback()
            return jsonify({"success":False})



@auth_bp.route("/forgot-password")
def forgot_password():
    return render_template("forgot_password.html")

@auth_bp.route("/join/<token>")
def join(token):
    return render_template("join.html", token=token)