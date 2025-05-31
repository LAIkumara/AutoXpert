from flask import Blueprint, request, jsonify
import sqlite3
from services.damage_detection_service import DamageDetectionService

damage_detection = Blueprint('damage_detection', __name__)

_detection_service = DamageDetectionService()

@damage_detection.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    try:
        image = request.files['image']
        vehicle = request.form.get('vehicle')
        body_type = request.form.get('body_type')

        if not all([vehicle, body_type]):
            return jsonify({"error": "Missing vehicle or body type"}), 400

        # Use the already-loaded service
        prediction = _detection_service.predict_damage_and_repairability(image)
        damage_type = prediction.get('damage_type', 'Unknown')
        repairability = prediction.get('repairability', 'Unknown')

        # Fetch the formatted strings directly from your DB
        conn = sqlite3.connect('stores.db')
        c = conn.cursor()
        c.execute('''
            SELECT new_price_range, repair_value_low, repair_value_high
            FROM repair_costs
            WHERE vehicle = ? AND part = ?
        ''', (vehicle, body_type))
        price_data = c.fetchone()
        conn.close()

        if not price_data:
            return jsonify({
                "status": "error",
                "error": "No price data available",
                "fallback_data": {
                    "vehicle": vehicle,
                    "body_type": body_type,
                    "damage_type": damage_type,
                    "repairability": repairability,
                    "new_price_range": "Rs. 35,000 - 60,000",
                    "repair_cost_range": "Rs. 8,000 - 15,000",
                    "repair_cost_low": "Rs. 8,000 - 15,000",
                    "repair_cost_high": "Rs. 8,000 - 15,000"
                }
            }), 200

        new_price_range, repair_low, repair_high = price_data

        if repairability == "Repairable":
            repair_cost_range = repair_low
        else:
            repair_cost_range = repair_high

        response_json = {
            "status": "success",
            "vehicle": vehicle,
            "body_type": body_type,
            "damage_type": damage_type,
            "repairability": repairability,
            "new_price_range": new_price_range,
            "repair_cost_range": repair_cost_range,
            "repair_cost_low": repair_cost_range,
            "repair_cost_high": repair_cost_range
        }

        return jsonify(response_json)

    except Exception as e:
        print("Error in /damage_detection/upload:", e)
        return jsonify({"status": "error", "error": str(e)}), 500
