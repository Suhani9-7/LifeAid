from pathlib import Path
from django.core.exceptions import ValidationError

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024


def validate_medical_document(file_obj):
    extension = Path(file_obj.name).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise ValidationError("Only PDF, JPG, JPEG, and PNG files are allowed.")
    if file_obj.size > MAX_FILE_SIZE:
        raise ValidationError("Maximum file size is 5MB.")
