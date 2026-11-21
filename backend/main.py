
import os
import cv2
import numpy as np

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

app = FastAPI(title="AETHER Lunar Hazard Detection API")

# Allow the React frontend to communicate with Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLO model
MODEL_PATH = os.getenv("YOLO_MODEL_PATH", "yolov8n.pt")
model = YOLO(MODEL_PATH)


@app.get("/")
def home():
    return {
        "message": "AETHER Hazard Detection API is running",
        "model": MODEL_PATH
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/api/hazards/detect")
async def detect_hazards(image: UploadFile = File(...)):

    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a valid image"
        )

    contents = await image.read()

    # Convert uploaded image into OpenCV format
    image_array = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    if frame is None:
        raise HTTPException(
            status_code=400,
            detail="Could not read uploaded image"
        )

    height, width = frame.shape[:2]

    # Run YOLO detection
    results = model.predict(
        source=frame,
        conf=0.25,
        verbose=False
    )

    detections = []

    for result in results:
        for box in result.boxes:

            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()

            class_id = int(box.cls[0].item())
            confidence = float(box.conf[0].item())

            category = model.names[class_id]

            # Convert bounding box into percentages
            detections.append({
                "id": len(detections) + 1,
                "category": category,
                "confidence": round(confidence, 3),
                "box": {
                    "x": round(float(x1 / width * 100), 2),
                    "y": round(float(y1 / height * 100), 2),
                    "w": round(float((x2 - x1) / width * 100), 2),
                    "h": round(float((y2 - y1) / height * 100), 2)
                }
            })

    return {
        "simulated": False,
        "model": MODEL_PATH,
        "detections": detections
    }
