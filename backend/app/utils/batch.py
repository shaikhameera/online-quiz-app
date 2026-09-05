

def settings_collection():
    from app.database import quiz_settings_collection
    return quiz_settings_collection


def get_config():
    config = settings_collection().find_one({"_id": "default"})
    if not config:
        return {"quiz_name": "General Quiz", "duration_seconds": None,
                "subjects": [], "available_subjects": []}
    duration = config.get("duration_seconds")
    return {"quiz_name": config.get("quiz_name") or "General Quiz",
            "duration_seconds": duration if type(duration) is int and 0 < duration <= 86400 else None,
            "subjects": [{"name": subject["name"]} for subject in config.get("subjects", [])], "available_subjects": [subject["name"] for subject in config.get("subjects", [])]}
