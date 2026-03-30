from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
import io
import zipfile
from PIL import Image
import base64

router = APIRouter()

CANVAS_WIDTH = 3050
CANVAS_HEIGHT = 1350


class ExportRequest(BaseModel):
    images: List[str]
    slot_positions: List[dict]
    slice_count: int = 3
    format: str = "png"


@router.post("/slice")
async def slice_images(request: ExportRequest):
    if len(request.images) != len(request.slot_positions):
        raise HTTPException(
            status_code=400, detail="Number of images must match number of slots"
        )

    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for i, (image_data, slot) in enumerate(
            zip(request.images, request.slot_positions)
        ):
            try:
                image_bytes = base64.b64decode(image_data.split(",")[1])
                img = Image.open(io.BytesIO(image_bytes))

                if img.mode == "RGBA":
                    img = img.convert("RGB")

                output = io.BytesIO()
                img.save(output, format=request.format.upper())
                output.seek(0)

                filename = f"carousel-{i + 1}.{request.format}"
                zip_file.writestr(filename, output.getvalue())

            except Exception as e:
                raise HTTPException(
                    status_code=400, detail=f"Failed to process image {i + 1}: {str(e)}"
                )

    zip_buffer.seek(0)

    return StreamingResponse(
        iter([zip_buffer.getvalue()]),
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=carousify-export.zip"},
    )


@router.post("/canvas")
async def export_full_canvas(request: ExportRequest):
    canvas = Image.new("RGB", (CANVAS_WIDTH, CANVAS_HEIGHT), "white")

    for image_data, slot in zip(request.images, request.slot_positions):
        try:
            image_bytes = base64.b64decode(image_data.split(",")[1])
            img = Image.open(io.BytesIO(image_bytes))

            if img.mode == "RGBA":
                background = Image.new("RGB", img.size, "white")
                background.paste(img, mask=img.split()[3])
                img = background

            slot_x = slot.get("x", 0)
            slot_y = slot.get("y", 0)
            slot_width = slot.get("width", 0)
            slot_height = slot.get("height", 0)

            img.thumbnail((slot_width, slot_height), Image.Resampling.LANCZOS)

            paste_x = slot_x + (slot_width - img.width) // 2
            paste_y = slot_y + (slot_height - img.height) // 2

            canvas.paste(img, (paste_x, paste_y))

        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Failed to process image: {str(e)}"
            )

    output = io.BytesIO()
    canvas.save(output, format=request.format.upper())
    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type=f"image/{request.format}",
        headers={"Content-Disposition": "attachment; filename=carousify-canvas.png"},
    )
