from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List
import numpy as np
import cv2
import io
from PIL import Image
import base64

router = APIRouter()

CANVAS_WIDTH = 3050
CANVAS_HEIGHT = 1350


class CropData(BaseModel):
    x: float
    y: float
    width: float
    height: float
    rotation: float = 0


class AutoCropResponse(BaseModel):
    success: bool
    crop_data: CropData | None = None
    detected_faces: List[dict] | None = None
    error: str | None = None


class BackgroundRemovalResponse(BaseModel):
    success: bool
    image_url: str | None = None
    error: str | None = None


def pil_to_bytes(img: Image.Image, format: str = "PNG") -> bytes:
    buffer = io.BytesIO()
    img.save(buffer, format=format)
    return buffer.getvalue()


def bytes_to_base64(bytes_data: bytes, mime_type: str = "image/png") -> str:
    return f"data:{mime_type};base64,{base64.b64encode(bytes_data).decode()}"


@router.post("/auto-crop", response_model=AutoCropResponse)
async def auto_crop(image: UploadFile = File(...)):
    try:
        contents = await image.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )

        faces = face_cascade.detectMultiScale(
            gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
        )

        detected_faces = []
        if len(faces) > 0:
            for x, y, w, h in faces:
                detected_faces.append(
                    {"x": int(x), "y": int(y), "width": int(w), "height": int(h)}
                )

            face = faces[0]
            x, y, w, h = face

            aspect_ratio = 1080 / 1350
            face_center_x = x + w // 2
            face_center_y = y + h // 2

            crop_width = int(w * 1.5)
            crop_height = int(crop_width / aspect_ratio)

            crop_x = max(0, face_center_x - crop_width // 2)
            crop_y = max(0, face_center_y - crop_height // 2)

            if crop_x + crop_width > img.shape[1]:
                crop_x = img.shape[1] - crop_width
            if crop_y + crop_height > img.shape[0]:
                crop_y = img.shape[0] - crop_height

            crop_data = CropData(
                x=float(crop_x),
                y=float(crop_y),
                width=float(crop_width),
                height=float(crop_height),
            )
        else:
            img_height, img_width = img.shape[:2]
            target_ratio = 1080 / 1350
            img_ratio = img_width / img_height

            if img_ratio > target_ratio:
                crop_width = int(img_height * target_ratio)
                crop_height = img_height
                crop_x = (img_width - crop_width) // 2
                crop_y = 0
            else:
                crop_width = img_width
                crop_height = int(img_width / target_ratio)
                crop_x = 0
                crop_y = (img_height - crop_height) // 2

            crop_data = CropData(
                x=float(crop_x),
                y=float(crop_y),
                width=float(crop_width),
                height=float(crop_height),
            )

        return AutoCropResponse(
            success=True, crop_data=crop_data, detected_faces=detected_faces
        )

    except Exception as e:
        return AutoCropResponse(success=False, error=str(e))


@router.post("/remove-bg", response_model=BackgroundRemovalResponse)
async def remove_background(image: UploadFile = File(...)):
    try:
        try:
            from rembg import remove

            has_rembg = True
        except ImportError:
            has_rembg = False

        contents = await image.read()
        input_img = Image.open(io.BytesIO(contents))

        if input_img.mode == "RGBA":
            output_img = input_img
        elif has_rembg:
            output_img = remove(input_img)
        else:
            background = Image.new("RGBA", input_img.size, (255, 255, 255, 255))
            output_img = Image.alpha_composite(background, input_img.convert("RGBA"))

        output_bytes = pil_to_bytes(output_img.convert("RGB"), "PNG")
        base64_image = bytes_to_base64(output_bytes, "image/png")

        return BackgroundRemovalResponse(success=True, image_url=base64_image)

    except Exception as e:
        return BackgroundRemovalResponse(success=False, error=str(e))


@router.post("/smart-layout")
async def smart_layout_suggestion(images: List[UploadFile] = File(...)):
    try:
        layouts = []

        for i, img in enumerate(images):
            contents = await img.read()
            nparr = np.frombuffer(contents, np.uint8)
            img_array = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if img_array is not None:
                height, width = img_array.shape[:2]
                aspect_ratio = width / height

                if aspect_ratio > 1.5:
                    layout_type = "landscape"
                elif aspect_ratio < 0.8:
                    layout_type = "portrait"
                else:
                    layout_type = "square"

                layouts.append(
                    {
                        "index": i,
                        "aspect_ratio": aspect_ratio,
                        "layout_type": layout_type,
                        "suggested_position": "full"
                        if aspect_ratio > 1.2
                        else "partial",
                    }
                )

        return {
            "success": True,
            "layouts": layouts,
            "suggested_template": "three-panel"
            if len(images) == 3
            else "six-panel-grid",
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
