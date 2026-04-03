from flask import render_template
from flask import request
from flask import Blueprint
from flask import session
from flask import redirect
from flask import url_for
from flask import make_response

admin_bp=Blueprint('admin', __name__, url_prefix='/admin')

@admin_bp.route("/dashboard")
def dashboard():
    if 'email' not in session or session.get('role') != 'admin':
        session.clear() # wipe any partial/wrong session
        return redirect(url_for('auth.login'))

    response = make_response(render_template("admin_dashboard.html"))
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma']        = 'no-cache'
    response.headers['Expires']       = '0'
    return response