import os
from flask import Blueprint, Flask, request, jsonify
from werkzeug.utils import secure_filename
from services import TireSegmentationService


from services.damage_detection_service import DamageDetectionService
from datetime import datetime

# Initialize Tire Segmentation service
tire_segmentation_service = TireSegmentationService()

# Blueprint for handling tire segmentation
tire_segmentation = Blueprint('tire_segmentation', __name__)

# Allowed file extensions for uploads
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
UPLOAD_FOLDER = '/../uploads'  # Absolute path for your uploads folder


# Helper function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# Route for uploading tire segmentation images
@tire_segmentation.route('/upload', methods=['POST'])
def upload_tire_image():
    if 'image' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    image = request.files['image']

    # Check if file is valid and allowed
    if image and allowed_file(image.filename):
        # Secure the filename and save the image
        filename = secure_filename(image.filename)
        folder_path = os.path.join(UPLOAD_FOLDER)

        # Ensure the folder exists
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)

        # Save the image to the designated folder
        image_path = os.path.join(folder_path, filename)
        image.save(image_path)

        print(f"Image saved at: {image_path}")  # Debug print

        # Use the TireSegmentationService to predict the tire segmentation
        try:
            tire_segmentation_result = tire_segmentation_service.segment_tire(image_path)

            # Return the results (both predicted depth and tire condition)
            return jsonify({
                "predicted_tire_depth_mm": tire_segmentation_result['predicted_tire_depth_mm'],
                "tire_condition": tire_segmentation_result['tire_condition']
            })
        except Exception as e:
            return jsonify({"error": f"Error processing image: {str(e)}"}), 500

    else:
        return jsonify({"error": "Invalid file format. Only PNG, JPG, JPEG, and GIF are allowed."}), 400



    damage_detection = Blueprint('damage_detection', __name__)

    @damage_detection.route('/upload', methods=['POST'])
    def upload_image():
        if 'image' not in request.files:
            return jsonify({"error": "No image provided"}), 400

        # Get form data
        image = request.files['image']
        vehicle = request.form.get('vehicle')
        body_type = request.form.get('body_type')

        # Your existing damage detection logic
        damage_type = "Dent"  # Replace with your actual detection
        repairability = "Repairable"  # Replace with your actual assessment

        # Get repair cost based on repairability
        repair_cost = DamageDetectionService.get_repair_cost(
            vehicle,
            body_type,
            repairability
        )

        if repair_cost is None:
            return jsonify({"error": "No cost data for this vehicle/part"}), 400

        # Save report
        report = DamageDetectionService.create_damage_report(
            vehicle=vehicle,
            body_type=body_type,
            damage_type=damage_type,
            repairability=repairability,
            repair_cost=repair_cost,
            image_path=f"uploads/{image.filename}"
        )

        return jsonify({
            "damage_type": damage_type,
            "repairability": repairability,
            "repair_cost": repair_cost,
            "report_id": report.id
        })

    @damage_detection.route('/reports', methods=['GET'])
    def get_reports():
        reports = DamageDetectionService.get_recent_reports()
        return jsonify([{
            "id": r.id,
            "vehicle": r.vehicle,
            "body_type": r.body_type,
            "damage_type": r.damage_type,
            "repairability": r.repairability,
            "repair_cost": r.repair_cost,
            "created_at": r.created_at.isoformat()
        } for r in reports])