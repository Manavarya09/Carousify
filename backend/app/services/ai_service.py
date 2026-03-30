import cv2
import numpy as np
from PIL import Image
import io


class FaceDetectionService:
    HAARCASCADE_PATH = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"

    @classmethod
    def detect_faces(cls, image_data: bytes) -> list:
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return []

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(cls.HAARCASCADE_PATH)

        faces = face_cascade.detectMultiScale(
            gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
        )

        return [
            {"x": int(x), "y": int(y), "width": int(w), "height": int(h)}
            for x, y, w, h in faces
        ]

    @classmethod
    def get_optimal_crop(
        cls, image_data: bytes, target_width: int, target_height: int
    ) -> tuple:
        faces = cls.detect_faces(image_data)

        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        img_height, img_width = img.shape[:2]

        if faces:
            face = faces[0]
            center_x = face["x"] + face["width"] // 2
            center_y = face["y"] + face["height"] // 2
        else:
            center_x = img_width // 2
            center_y = img_height // 2

        target_ratio = target_width / target_height
        img_ratio = img_width / img_height

        if img_ratio > target_ratio:
            crop_width = int(img_height * target_ratio)
            crop_height = img_height
        else:
            crop_width = img_width
            crop_height = int(img_width / target_ratio)

        crop_x = max(0, center_x - crop_width // 2)
        crop_y = max(0, center_y - crop_height // 2)

        if crop_x + crop_width > img_width:
            crop_x = img_width - crop_width
        if crop_y + crop_height > img_height:
            crop_y = img_height - crop_height

        return (
            max(0, crop_x),
            max(0, crop_y),
            min(crop_width, img_width - crop_x),
            min(crop_height, img_height - crop_y),
        )


class BackgroundRemovalService:
    @classmethod
    def remove_background(cls, image_data: bytes) -> bytes:
        try:
            from rembg import remove

            img = Image.open(io.BytesIO(image_data))
            result = remove(img)

            output = io.BytesIO()
            result.save(output, format="PNG")
            return output.getvalue()
        except ImportError:
            img = Image.open(io.BytesIO(image_data))
            if img.mode != "RGBA":
                img = img.convert("RGBA")

            output = io.BytesIO()
            img.save(output, format="PNG")
            return output.getvalue()
