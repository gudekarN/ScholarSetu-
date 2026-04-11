from config import Config
from flask import Flask
from .routes import main_bp, auth_bp, admin_bp, student_bp, superadmin_bp
from .extensions import db, mail

def create_app():

    app=Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)

    with app.app_context():
        db.create_all()

    mail.init_app(app)

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(superadmin_bp)

    return app