from datetime import datetime

def get_academic_year():
    today = datetime.today()
    if today.month >= 6:  # June onwards = new academic year
        return f"{today.year}-{today.year + 1}"
    else:
        return f"{today.year - 1}-{today.year}"