from pydantic import BaseModel, EmailStr, field_validator

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

    @field_validator("name")
    @classmethod
    def valid_name(cls, value):
        value = value.strip()
        if not value or len(value) > 100:
            raise ValueError("Name must contain 1-100 characters")
        return value

class AdminUserCreate(UserRegister):
    @field_validator("password")
    @classmethod
    def valid_default_password(cls, value):
        if len(value) < 8:
            raise ValueError("Default password must contain at least 8 characters")
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Default password must be at most 72 UTF-8 bytes")
        return value

class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserAccessUpdate(BaseModel):
    can_take_test: bool
    can_retake_test: bool


class PasswordChange(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def valid_new_password(cls, value):
        if len(value) < 8:
            raise ValueError("New password must contain at least 8 characters")
        if len(value.encode("utf-8")) > 72:
            raise ValueError("New password must be at most 72 UTF-8 bytes")
        return value
