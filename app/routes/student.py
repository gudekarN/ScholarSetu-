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

    response = make_response(render_template("student_dashboard.html"))
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma']        = 'no-cache'
    response.headers['Expires']       = '0'
    return response