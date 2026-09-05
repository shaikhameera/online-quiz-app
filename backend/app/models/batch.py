from pydantic import BaseModel, Field, field_validator


class SubjectConfig(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def valid_name(cls, value):
        value = value.strip()
        if not value or len(value) > 100:
            raise ValueError("Subject name must contain 1-100 characters")
        return value

class BatchConfig(BaseModel):
    quiz_name: str = Field(min_length=1, max_length=100)
    duration_seconds: int | None = Field(default=None, ge=1, le=86400, strict=True)
    subjects: list[SubjectConfig] = Field(min_length=1, max_length=4)

    @field_validator("quiz_name")
    @classmethod
    def valid_name(cls, value):
        if not value.strip():
            raise ValueError("Quiz name is required")
        return value.strip()

    @field_validator("subjects")
    @classmethod
    def unique_subjects(cls, value):
        if len({subject.name.casefold() for subject in value}) != len(value):
            raise ValueError("Subjects must be unique")
        return value
