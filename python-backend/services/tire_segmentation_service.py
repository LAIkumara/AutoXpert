from PIL import Image
import numpy as np
import tensorflow as tf
import os
import logging
from tensorflow.keras.applications.resnet50 import preprocess_input

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TireSegmentationService:
    def __init__(self):
        try:
            # Load the U-Net model for tire segmentation
            unet_model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'unet_tire_model.h5')
            self.model_unet = tf.keras.models.load_model(unet_model_path)
            logger.info("U-Net model loaded successfully")

            # Load the ResNet50 model for tire condition prediction
            resnet_model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'resnet50_tire_condition.h5')
            self.model_resnet = tf.keras.models.load_model(resnet_model_path)
            logger.info("ResNet50 model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            raise

    def segment_tire(self, image_path):
        try:
            logger.info(f"Processing image: {image_path}")

            # Step 1: Predict tire condition using ResNet50
            tire_condition = self._predict_tire_condition(image_path)

            # Step 2: Predict tire depth using U-Net
            predicted_depth = self._predict_tire_depth(image_path)

            # Prepare response
            response = {
                'tire_condition': tire_condition,
                'predicted_tire_depth_mm': predicted_depth
            }
            logger.info("Backend Response: %s", response)  # Debug log

            return response
        except Exception as e:
            logger.error(f"Error in segment_tire: {e}")
            raise

    def _predict_tire_condition(self, image_path):
        try:
            # Load the image
            image = Image.open(image_path)
            logger.info("Image loaded successfully")

            # Preprocess the image for ResNet50 model
            processed_image = self._preprocess_image_for_resnet(image)
            logger.info("Image preprocessed for ResNet50")

            # Predict tire condition
            prediction = self.model_resnet.predict(processed_image)
            logger.info("Raw Prediction Output: %s", prediction)  # Debug log

            # Get the predicted class index
            predicted_class_index = np.argmax(prediction, axis=1)[0]
            logger.info("Predicted Class Index: %s", predicted_class_index)  # Debug log

            # Map the predicted class index to the corresponding label
            labels = ["very good", "good", "middle", "low"]
            condition = labels[predicted_class_index]
            logger.info(f"Tire Condition Prediction: {condition}")  # Debug log

            return condition
        except Exception as e:
            logger.error(f"Error in _predict_tire_condition: {e}")
            raise

    def _predict_tire_depth(self, image_path):
        try:
            # Load the image
            image = Image.open(image_path)
            logger.info("Image loaded successfully")

            # Preprocess the image for U-Net model
            processed_image = self._preprocess_image_for_unet(image)
            logger.info("Image preprocessed for U-Net")

            # Predict the tire segmentation using U-Net
            prediction = self.model_unet.predict(processed_image)
            logger.info("U-Net prediction completed")

            # Post-process the mask
            mask = (prediction[0] > 0.5).astype(np.uint8)  # Binary mask thresholding
            logger.info("Mask post-processed")

            # Calculate predicted depth from the mask
            predicted_depth = self._calculate_predicted_depth(mask)
            logger.info(f"Predicted Depth: {predicted_depth}")

            return predicted_depth
        except Exception as e:
            logger.error(f"Error in _predict_tire_depth: {e}")
            raise

    @staticmethod
    def _preprocess_image_for_resnet(image):
        try:
            # Resize the image to the expected input size of the model (224x224)
            target_size = (224, 224)
            image = image.resize(target_size)

            # Convert the image to RGB (ResNet expects 3 channels)
            image = image.convert('RGB')

            # Convert the image to a numpy array and normalize it
            image_array = np.array(image)
            image_array = preprocess_input(image_array)  # Normalize using ResNet50 preprocessing

            # Add batch dimension
            image_array = np.expand_dims(image_array, axis=0)

            return image_array
        except Exception as e:
            logger.error(f"Error in _preprocess_image_for_resnet: {e}")
            raise

    @staticmethod
    def _preprocess_image_for_unet(image):
        try:
            # Resize the image to the expected input size of the model (256x256)
            target_size = (256, 256)
            image = image.resize(target_size)

            # Convert the image to grayscale
            image = image.convert('L')  # 'L' mode converts the image to grayscale

            # Normalize the image and add batch dimension
            image = np.array(image) / 255.0  # Normalize to [0, 1]
            image = np.expand_dims(image, axis=-1)  # Add channel dimension (shape becomes [256, 256, 1])
            image = np.expand_dims(image, axis=0)  # Add batch dimension (shape becomes [1, 256, 256, 1])

            return image
        except Exception as e:
            logger.error(f"Error in _preprocess_image_for_unet: {e}")
            raise

    @staticmethod
    def _calculate_predicted_depth(mask):
        try:
            # Calculate the predicted depth based on the mask (normalized pixel count)
            predicted_depth = np.sum(mask) / (256 * 256)  # Normalized pixel count (0 to 1)

            # Define real-world depth range (in mm)
            min_depth_mm = 1.59  # Unsafe tread depth in mm (2/32")
            max_depth_mm = 8.73  # New tire tread depth in mm (11/32")

            # Convert predicted depth to real-world depth (in mm)
            real_depth_mm = min_depth_mm + (predicted_depth * (max_depth_mm - min_depth_mm))

            return real_depth_mm
        except Exception as e:
            logger.error(f"Error in _calculate_predicted_depth: {e}")
            raise