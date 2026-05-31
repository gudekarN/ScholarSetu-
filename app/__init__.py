from config import Config
from flask import Flask
from .routes import main_bp, auth_bp, admin_bp, student_bp, superadmin_bp
from .extensions import db, mail

def create_app():

    app=Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    mail.init_app(app)

    with app.app_context():
        db.create_all()
        
        # Add extra_data column if it doesn't exist yet
        from sqlalchemy import text, inspect
        with db.engine.connect() as conn:
            inspector = inspect(db.engine)
            columns = [col['name'] for col in inspector.get_columns('student_scholarship_data')]
            if 'extra_data' not in columns:
                conn.execute(text('ALTER TABLE student_scholarship_data ADD COLUMN extra_data TEXT'))
                conn.commit()

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(superadmin_bp)

    return app