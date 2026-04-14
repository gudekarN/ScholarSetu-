from flask_mail import Message
from datetime import datetime, timedelta
from flask import jsonify, render_template, url_for, redirect
from flask import request, session 
from flask import Blueprint
from app.extensions import db, mail
from app.models import College, Students, SecretKeys, EmailVerifications, InviteTokens
from werkzeug.security import generate_password_hash, check_password_hash
import os
import uuid

auth_bp = Blueprint('auth', __name__, url_prefix="/auth")


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html")

    if request.method == "POST":
        email = request.form.get('email')
        password = request.form.get('password')
        role = request.form.get('role')

        if not email or not password or not role:
            return redirect(url_for('auth.login') + '?error=1')

        if role == 'admin':
            college = College.query.filter_by(admin_email=email).first()

            if college:
                decrypted_password = check_password_hash(college.password, password)

                if decrypted_password:
                    if college.status == True:
                        return redirect(url_for('auth.login') + '?error=pending')

                    session['user_id'] = college.college_id
                    session['role'] = role
                    return redirect(url_for('admin.dashboard'))

            return redirect(url_for('auth.login') + '?error=1')

        if role == 'student':
            student = Students.query.filter_by(email=email).first()

            if student:
                decrypted_password = check_password_hash(student.password, password)

                if decrypted_password:
                    if not student.is_verified:
                        return redirect(url_for('auth.login') + '?error=pending')

                    session['user_id'] = student.student_id
                    session['role'] = role
                    return redirect(url_for('student.dashboard'))

            return redirect(url_for('auth.login') + '?error=1')

        if role == "superadmin":
            if email == os.getenv("SUPERADMIN_EMAIL") and password == os.getenv("SUPERADMIN_PASSWORD"):
                session['user_id'] = email
                session['role'] = role
                return redirect(url_for('superadmin.dashboard'))

            return redirect(url_for('auth.login') + '?error=1')

    return render_template("login.html")


@auth_bp.route("/logout", methods=["GET", "POST"])
def logout():
    session.clear()
    return redirect(url_for('main.index'))


@auth_bp.route("/register-college", methods=["GET", "POST"])
def register_college():
    if request.method == "GET":
        return render_template("register_college.html")

    if request.method == "POST":
        data = request.get_json()

        college_name = data.get('college_name')
        aishe_code   = data.get('aishe_code')
        secret_key   = data.get('secret_key')
        district     = data.get('district')
        college_type = data.get('college_type')
        admin_email  = data.get('admin_email')
        admin_phone  = data.get('admin_phone')
        password     = data.get('password')

        db_aishe_code  = College.query.filter_by(aishe_code=aishe_code).first()
        db_secret_key  = SecretKeys.query.filter_by(secret_key=secret_key, is_used=False).first()
        db_admin_email = College.query.filter_by(admin_email=admin_email).first()

        if db_aishe_code:
            return jsonify({"success": False, "field": "aishe_code", "message": "Already registered"})

        if not db_secret_key:
            return jsonify({"success": False, "field": "secret_key", "message": "Wrong secret OR Application not approved yet"})

        if db_admin_email:
            return jsonify({"success": False, "field": "admin_email", "message": "Admin email already registered"})

        encrypted_password = generate_password_hash(password)

        college = College(
            college_name = college_name,
            aishe_code   = aishe_code,
            secret_key   = secret_key,
            district     = district,
            college_type = college_type,
            admin_email  = admin_email,
            admin_phone  = admin_phone,
            password     = encrypted_password
        )

        try:
            db.session.add(college)
            db.session.commit()

            db_secret_key.is_used = True
            db.session.commit()

            return jsonify({"success": True})

        except Exception as e:
            db.session.rollback()
            return jsonify({"success": False})


@auth_bp.route("/register_student", methods=["POST"])
def register_student():
    if request.method=="POST":
        data=request.get_json()

        full_name=data.get('full_name')
        email=data.get('email')
        password=data.get('password')
        prn=data.get('prn')
        contact_number=data.get('contact_number')
        department=data.get('department')
        year=data.get('year')
        token=data.get('token')

        db_inviteToken=InviteTokens.query.filter_by(token=token, is_active=True).first()

        if db_inviteToken:
            # Check PRN uniqueness within this college
            existing_prn = Students.query.filter_by(college_id=db_inviteToken.college_id,prn=prn).first()

            if existing_prn:
                return jsonify({"success": False, "field": "prn", "message": "PRN already registered"})

            # Check email uniqueness globally 
            # We don’t check college_id for email because email is treated as a globally unique identifier across the system,
            # unlike PRN which is unique only within a specific college.
            existing_email = Students.query.filter_by(email=email).first()

            if existing_email:
                return jsonify({"success": False, "field": "email", "message": "Email already registered"})

        else:
            return jsonify({"success": False, "field": "token", "message": "Invalid or expired invite link"})

        encrypted_password = generate_password_hash(password)

        student = Students(
            college_id     = db_inviteToken.college_id,
            full_name      = full_name,
            email          = email,
            password       = encrypted_password,
            prn            = prn,
            contact_number = contact_number,
            department     = department,
            year           = year,
            is_verified    = False
        )

        verification_token = str(uuid.uuid4())
        expiry = datetime.utcnow() + timedelta(minutes=5)

        try:
            db.session.add(student)
            db.session.flush()  # assigns student.student_id without committing yet

            emailVerification = EmailVerifications(
                student_id = student.student_id,  # available after flush
                token      = verification_token,
                expires_at = expiry,
                is_used    = False
            )

            db.session.add(emailVerification)
            db.session.commit()  # single commit for both student + verification record

        except Exception as e:
            db.session.rollback()
            return jsonify({"success": False})

        message = Message(
            subject   = "Student Verification",
            sender    = "gudekarnihar96@gmail.com",
            recipients = [email]
        )

        message.html = f"<h1>This is STUDENT VERIFICATION mail</h1><br><a href='http://127.0.0.1:5000/auth/verify/{verification_token}'>Click here</a><br><h2 style='color:Red'>Link is valid for only 5 minutes</h2>"

        mail.send(message)

        return jsonify({"success": True})
        

@auth_bp.route("/forgot-password")
def forgot_password():
    return render_template("forgot_password.html")


@auth_bp.route("/join/<token>")
def join(token):
    # Query using the token string field, not token_id
    invite = InviteTokens.query.filter_by(token=token, is_active=True).first()

    # Invalid or expired token — show error, hide form
    if not invite:
        return render_template("join.html", invalid=True)

    # Valid token — fetch college name and pass to template
    college = College.query.filter_by(college_id=invite.college_id).first()

    return render_template("join.html", invalid=False, college_name=college.college_name, token=token)

@auth_bp.route("/verify/<token>", methods=["GET"])
def verify(token):
        db_emailVerification=EmailVerifications.query.filter_by(token=token).first()

        if not db_emailVerification or db_emailVerification.is_used==True:
            return redirect(url_for('auth.login') + '?error=1')

        if datetime.utcnow() > db_emailVerification.expires_at:
            return redirect(url_for('auth.login') + '?error=expired') 

        student_id=db_emailVerification.student_id
        db_student=Students.query.filter_by(student_id=student_id).first()

        try:
            db_student.is_verified=True
            db_emailVerification.is_used=True
            db.session.commit()

            return redirect(url_for('auth.login'))  
        
        except Exception as e:
            db.session.rollback()
            return jsonify({"success":False})