from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from datetime import datetime
import uuid

from app.models.database import get_db
from app.models.models import Project, User
from app.routes.auth import get_current_user

router = APIRouter()


class SlotData(BaseModel):
    id: str
    x: int
    y: int
    width: int
    height: int
    image_url: str | None = None
    image_position: dict | None = None
    image_scale: float = 1.0
    crop_data: dict | None = None


class ProjectCreate(BaseModel):
    name: str
    template_id: str
    slots: List[SlotData]


class ProjectUpdate(BaseModel):
    name: str | None = None
    slots: List[SlotData] | None = None
    thumbnail_url: str | None = None


class ProjectResponse(BaseModel):
    id: str
    user_id: str
    name: str
    template_id: str
    slots: List[dict]
    thumbnail_url: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.get("", response_model=List[ProjectResponse])
def list_projects(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    projects = db.query(Project).filter(Project.user_id == current_user.id).all()
    return projects


@router.post("", response_model=ProjectResponse)
def create_project(
    project: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_project = Project(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        name=project.name,
        template_id=project.template_id,
        slots=[slot.model_dump() for slot in project.slots],
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.user_id == current_user.id)
        .first()
    )

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return project


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: str,
    project_update: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.user_id == current_user.id)
        .first()
    )

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project_update.name is not None:
        project.name = project_update.name
    if project_update.slots is not None:
        project.slots = [slot.model_dump() for slot in project_update.slots]
    if project_update.thumbnail_url is not None:
        project.thumbnail_url = project_update.thumbnail_url

    project.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}")
def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.user_id == current_user.id)
        .first()
    )

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}
