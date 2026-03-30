import io
import base64
from PIL import Image
import numpy as np


class ImageService:
    @staticmethod
    def resize_image(
        image_data: bytes, width: int, height: int, maintain_aspect: bool = True
    ) -> bytes:
        img = Image.open(io.BytesIO(image_data))

        if maintain_aspect:
            img.thumbnail((width, height), Image.Resampling.LANCZOS)
        else:
            img = img.resize((width, height), Image.Resampling.LANCZOS)

        output = io.BytesIO()
        img.save(output, format="PNG")
        return output.getvalue()

    @staticmethod
    def crop_image(image_data: bytes, x: int, y: int, width: int, height: int) -> bytes:
        img = Image.open(io.BytesIO(image_data))
        cropped = img.crop((x, y, x + width, y + height))

        output = io.BytesIO()
        cropped.save(output, format="PNG")
        return output.getvalue()

    @staticmethod
    def get_image_info(image_data: bytes) -> dict:
        img = Image.open(io.BytesIO(image_data))
        return {
            "width": img.width,
            "height": img.height,
            "format": img.format,
            "mode": img.mode,
        }

    @staticmethod
    def to_base64(image_data: bytes, format: str = "PNG") -> str:
        return f"data:image/{format.lower()};base64,{base64.b64encode(image_data).decode()}"

    @staticmethod
    def from_base64(data_url: str) -> bytes:
        _, encoded = data_url.split(",", 1)
        return base64.b64decode(encoded)
