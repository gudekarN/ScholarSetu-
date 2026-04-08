from flask import session
from flask import render_template, redirect, url_for
from flask import render_template_string
from app.models import SecretKeys
from flask import jsonify
from flask import request
from flask import Blueprint
from app.extensions import db
import secrets


superadmin_bp=Blueprint('superadmin', __name__, url_prefix="/superadmin")

@superadmin_bp.route('/dashboard', methods=['GET', 'POST'])
def dashboard():
    if "user_id" not in session or session["role"]!="superadmin":
        return redirect(url_for('auth.login') + '?error=1')

    return render_template("superadmin.html")

@superadmin_bp.route('/logME/3EJS-6WiO9lYl93yJPKrpvwvG_hMpSqM7QbxTXgaa0I', methods=['GET', 'POST'])
def logME():
    if request.method=="GET":
        return render_template_string("""
            <form action="{{url_for('auth.login') }}" method="POST"> 
                <label for="email">Email</label>
                <input type="email" name="email"/><br>
                <label for="password">Password</label>
                <input type="password" name="password"/><br>
                <input type="hidden" name="role" value="superadmin" />
                <button type="submit">Submit</button>
            </form>
        """)

@superadmin_bp.route("/generate_key", methods=["GET", "POST"])
def generate_key():
    if request.method=="POST":
        if "user_id" not in session or session["role"]!="superadmin":
            return redirect(url_for('auth.login') + '?error=1')
            
        data=request.get_json()

        college_name=data.get('college_name')
        aishe_code=data.get('aishe_code')

        if not college_name or not college_name.strip():
            return jsonify({"success":False})

        if not aishe_code or not aishe_code.strip():
            return jsonify({"success":False})

        db_aishe_code=SecretKeys.query.filter_by(aishe_code=aishe_code, is_used=False).first()

        if  db_aishe_code:
            return jsonify({"success":False, "message": "AISHE code already has an active key"})

        generated_key=secrets.token_urlsafe(32)

        secretkeys=SecretKeys(
            college_name = college_name,
            aishe_code  = aishe_code,
            secret_key  = generated_key
        )

        try:
            db.session.add(secretkeys)
            db.session.commit()

            return jsonify({"success":True, "key":generated_key})

        except Exception as e:
            db.session.rollback()

            return jsonify({"success":False})
