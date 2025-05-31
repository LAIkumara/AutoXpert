import os
import joblib
import numpy as np
import tensorflow as tf
from PIL import Image
import pandas as pd

_MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'toyota_price_model.joblib')
_PRICE_MODEL = joblib.load(_MODEL_PATH)
print("Toyota price predictor model loaded")

class VehicleClassificationService:
    BRAND_MAP = {
        "Toyota_Tundra": "Tundra",
        "Toyota_Tacoma": "Tacoma",
        "Toyota_Prius": "Prius",
        "Toyota_Highlander": "Highlander"
    }

    def __init__(self):
        model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'mobilenetv2_toyota.keras')
        self.model_mobilenetv2 = tf.keras.models.load_model(model_path)
        print("MobileNetV2 model loaded successfully")

    def classify_vehicle(self, image_path):
        image = Image.open(image_path)
        processed_image = self._preprocess_image_for_mobilenetv2(image)
        prediction = self.model_mobilenetv2.predict(processed_image)
        vehicle_class = np.argmax(prediction, axis=1)[0]
        vehicle_classes = ["Toyota_Tundra", "Toyota_Tacoma", "Toyota_Prius", "Toyota_Highlander"]
        vehicle_type = vehicle_classes[vehicle_class]
        print(f"Vehicle Type Prediction: {vehicle_type}")
        return vehicle_type

    @staticmethod
    def _preprocess_image_for_mobilenetv2(image):
        target_size = (224, 224)
        image = image.resize(target_size)
        image = np.array(image) / 255.0
        image = np.expand_dims(image, axis=0)
        return image

    @classmethod
    def predict_price(cls, features: dict):
        try:
            brand = cls.BRAND_MAP.get(features.get('car_type'), "Unknown")

            input_data = {
                'Brand': brand,
                'Year': features.get('year', 0),
                'Mileage': features.get('mileage', ''),
                'Num_Owners': features.get('owners', 0),
                'Color': features.get('color', ''),
                'Fuel_Type': features.get('fuel_type', '')
            }

            input_df = pd.DataFrame([input_data])
            prediction = _PRICE_MODEL.predict(input_df)
            return prediction[0]

        except Exception as e:
            print(f"Prediction error: {e}")
            return None
