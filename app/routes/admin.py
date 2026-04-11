from flask import jsonify
from app.extensions import db
from app.models import InviteTokens
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

        existing=InviteTokens.query.filter_by(college_id=str(session['user_id']), is_active=True).first()

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

    inviteToken=InviteTokens.query.filter_by(college_id=str(session['user_id']), is_active=True).first()

    if inviteToken:
        token=inviteToken.token
        createdAt=inviteToken.created_at

        return jsonify({"success":True, "token":token, "created_at":createdAt})

    return jsonify({"success":False})