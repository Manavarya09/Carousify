from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter()

TEMPLATES = [
    {
        "id": "three-panel",
        "name": "3 Panel Grid",
        "layout": "3-panel",
        "description": "Classic three equal panels",
        "category": "grid",
        "thumbnail": "/templates/three-panel.svg",
        "slots": [
            {"x": 0, "y": 0, "width": 1016, "height": 1350},
            {"x": 1017, "y": 0, "width": 1016, "height": 1350},
            {"x": 2034, "y": 0, "width": 1016, "height": 1350},
        ],
    },
    {
        "id": "two-panel-vertical",
        "name": "2 Panel Vertical",
        "layout": "2-panel-vertical",
        "description": "Two stacked panels",
        "category": "vertical",
        "thumbnail": "/templates/two-panel-vertical.svg",
        "slots": [
            {"x": 0, "y": 0, "width": 3050, "height": 675},
            {"x": 0, "y": 676, "width": 3050, "height": 674},
        ],
    },
    {
        "id": "six-panel-grid",
        "name": "6 Panel Grid",
        "layout": "6-panel",
        "description": "Six equal panels in grid",
        "category": "grid",
        "thumbnail": "/templates/six-panel.svg",
        "slots": [
            {"x": 0, "y": 0, "width": 1016, "height": 675},
            {"x": 1017, "y": 0, "width": 1016, "height": 675},
            {"x": 2034, "y": 0, "width": 1016, "height": 675},
            {"x": 0, "y": 676, "width": 1016, "height": 674},
            {"x": 1017, "y": 676, "width": 1016, "height": 674},
            {"x": 2034, "y": 676, "width": 1016, "height": 674},
        ],
    },
    {
        "id": "asymmetrical-left",
        "name": "Asymmetrical Left",
        "layout": "asymmetrical-left",
        "description": "Large left panel, two small right panels",
        "category": "asymmetrical",
        "thumbnail": "/templates/asymmetrical-left.svg",
        "slots": [
            {"x": 0, "y": 0, "width": 1524, "height": 1350},
            {"x": 1525, "y": 0, "width": 1525, "height": 675},
            {"x": 1525, "y": 676, "width": 1525, "height": 674},
        ],
    },
    {
        "id": "asymmetrical-right",
        "name": "Asymmetrical Right",
        "layout": "asymmetrical-right",
        "description": "Two small left panels, large right panel",
        "category": "asymmetrical",
        "thumbnail": "/templates/asymmetrical-right.svg",
        "slots": [
            {"x": 0, "y": 0, "width": 1525, "height": 675},
            {"x": 0, "y": 676, "width": 1525, "height": 674},
            {"x": 1526, "y": 0, "width": 1524, "height": 1350},
        ],
    },
    {
        "id": "hero-split",
        "name": "Hero Split",
        "layout": "hero-split",
        "description": "Full height left, two stacked right",
        "category": "split",
        "thumbnail": "/templates/hero-split.svg",
        "slots": [
            {"x": 0, "y": 0, "width": 1525, "height": 1350},
            {"x": 1526, "y": 0, "width": 1524, "height": 675},
            {"x": 1526, "y": 676, "width": 1524, "height": 674},
        ],
    },
    {
        "id": "four-panel",
        "name": "4 Panel Square",
        "layout": "4-panel",
        "description": "Four equal square panels",
        "category": "grid",
        "thumbnail": "/templates/four-panel.svg",
        "slots": [
            {"x": 0, "y": 0, "width": 1525, "height": 675},
            {"x": 1525, "y": 0, "width": 1525, "height": 675},
            {"x": 0, "y": 675, "width": 1525, "height": 675},
            {"x": 1525, "y": 675, "width": 1525, "height": 675},
        ],
    },
    {
        "id": "diagonal-split",
        "name": "Diagonal Split",
        "layout": "diagonal",
        "description": "Diagonal split layout",
        "category": "creative",
        "thumbnail": "/templates/diagonal.svg",
        "slots": [
            {"x": 0, "y": 0, "width": 1525, "height": 1350},
            {"x": 1525, "y": 0, "width": 1525, "height": 675},
            {"x": 1525, "y": 675, "width": 1525, "height": 675},
        ],
    },
    {
        "id": "horizontal-strip",
        "name": "5 Strip Layout",
        "layout": "5-strip",
        "description": "Five horizontal strips",
        "category": "strip",
        "thumbnail": "/templates/five-strip.svg",
        "slots": [
            {"x": 0, "y": 0, "width": 3050, "height": 270},
            {"x": 0, "y": 270, "width": 3050, "height": 270},
            {"x": 0, "y": 540, "width": 3050, "height": 270},
            {"x": 0, "y": 810, "width": 3050, "height": 270},
            {"x": 0, "y": 1080, "width": 3050, "height": 270},
        ],
    },
    {
        "id": "masonry",
        "name": "Masonry Mix",
        "layout": "masonry",
        "description": "Varied panel sizes",
        "category": "creative",
        "thumbnail": "/templates/masonry.svg",
        "slots": [
            {"x": 0, "y": 0, "width": 1525, "height": 900},
            {"x": 1525, "y": 0, "width": 1525, "height": 450},
            {"x": 1525, "y": 450, "width": 1525, "height": 450},
            {"x": 0, "y": 900, "width": 1016, "height": 450},
            {"x": 1016, "y": 900, "width": 1016, "height": 450},
            {"x": 2032, "y": 900, "width": 1018, "height": 450},
        ],
    },
]


class TemplateResponse(BaseModel):
    id: str
    name: str
    layout: str
    description: str | None
    category: str
    thumbnail: str
    slots: List[dict]


@router.get("", response_model=List[TemplateResponse])
def list_templates(category: str | None = None):
    if category:
        return [t for t in TEMPLATES if t["category"] == category]
    return TEMPLATES


@router.get("/{template_id}", response_model=TemplateResponse)
def get_template(template_id: str):
    template = next((t for t in TEMPLATES if t["id"] == template_id), None)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template
