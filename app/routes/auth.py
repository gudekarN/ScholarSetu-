from flask import session
from flask import url_for
from flask import redirect
from flask import request
from flask import render_template
from flask import Blueprint

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
            if email=='gudekarnihar96@gmail.com' and password=="#Coder@123":
                session['email']=email
                session['role']=role

                return redirect(url_for('admin.dashboard'))
            
            return redirect(url_for('auth.login') + '?error=1')

        if role=='student':
            if email=='gudekarnihar96@gmail.com' and password=="#Coder@123":
                session['email']=email
                session['role']=role
                
                return redirect(url_for('student.dashboard'))
            
            return redirect(url_for('auth.login') + '?error=1')

@auth_bp.route("/logout", methods=["GET", "POST"])
def logout():
    session.clear()
    return redirect(url_for('main.index'))
    
@auth_bp.route("/register-college")
def register_college():
    return render_template("register_college.html")

@auth_bp.route("/forgot-password")
def forgot_password():
    return render_template("forgot_password.html")

@auth_bp.route("/join/<token>")
def join(token):
    return render_template("join.html", token=token)