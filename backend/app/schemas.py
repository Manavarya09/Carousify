from pydantic import BaseModel, EmailStr, validator
from typing import List, Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserCreate(UserBase):
    password: str
    password_confirm: str

    @validator("password_confirm")
    def passwords_match(cls, v, values):
        if "password" in values and v != values["password"]:
            raise ValueError("Passwords do not match")
        return v


class UserUpdate(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None


class UserResponse(UserBase):
    id: str
    avatar_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ProjectBase(BaseModel):
    name: str
    template_id: str


class ProjectCreate(ProjectBase):
    slots: List[dict]


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    slots: Optional[List[dict]] = None
    thumbnail_url: Optional[str] = None


class ProjectResponse(ProjectBase):
    id: str
    user_id: str
    slots: List[dict]
    thumbnail_url: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TemplateResponse(BaseModel):
    id: str
    name: str
    layout: str
    description: Optional[str]
    category: str
    thumbnail: str
    slots: List[dict]


class ExportRequest(BaseModel):
    images: List[str]
    slot_positions: List[dict]
    slice_count: int = 3
    format: str = "png"


class AutoCropRequest(BaseModel):
    image_url: str


class BackgroundRemovalRequest(BaseModel):
    image_url: str
