from flask import Blueprint, request, jsonify
import os
from werkzeug.utils import secure_filename
from services.vehicle_classification_service import VehicleClassificationService

vehicle_classification = Blueprint('vehicle_classification', __name__)
vehicle_classification_service = VehicleClassificationService()

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'uploads', 'vehicles')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@vehicle_classification.route('/upload', methods=['POST'])
def upload_vehicle_image():
    if 'image' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    image = request.files['image']

    if image and allowed_file(image.filename):
        filename = secure_filename(image.filename)
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)

        image_path = os.path.join(UPLOAD_FOLDER, filename)
        image.save(image_path)

        vehicle_type = vehicle_classification_service.classify_vehicle(image_path)

        return jsonify({
            "vehicle_type": vehicle_type,
            "image_path": image_path
        })
    else:
        return jsonify({"error": "Invalid file format. Only PNG, JPG, JPEG, and GIF are allowed."}), 400


@vehicle_classification.route('/predict', methods=['POST'])
def predict_price():
    data = request.get_json()

    vehicle_type = data.get('vehicle_type')
    if not vehicle_type:
        return jsonify({'status': 'error', 'message': 'vehicle_type is required'}), 400

    features = {
        'car_type': vehicle_type,  # pass vehicle_type here for price model
        'year': data.get('year'),
        'color': data.get('color'),
        'mileage': data.get('mileage'),
        'owners': data.get('owners'),
        'fuel_type': data.get('fuelType'),
    }

    price = vehicle_classification_service.predict_price(features)

    if price is None:
        return jsonify({'status': 'error', 'message': 'Prediction failed'}), 500

    return jsonify({'status': 'success', 'predicted_price': price})
