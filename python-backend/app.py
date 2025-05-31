import os
import sys
import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS
from db import db
from Config import Config
from routes.store_routes import store_bp
from helper import preprocessing, vectorizer, get_prediction
from controllers.damage_detection_controller import damage_detection
from controllers.tire_segmentation_controller import tire_segmentation
from controllers.vehicle_classification_controller import vehicle_classification
from datetime import datetime

sys.path.append(os.path.abspath(os.path.dirname(__file__)))


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize DB and CORS
    db.init_app(app)
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Register blueprints
    app.register_blueprint(store_bp, url_prefix='/api')
    app.register_blueprint(damage_detection, url_prefix='/damage_detection')
    app.register_blueprint(tire_segmentation, url_prefix='/tire_segmentation')
    app.register_blueprint(vehicle_classification, url_prefix='/vehicle_classification')

    # Sentiment analysis variables
    app.config["reviews"] = []
    app.config["positive"] = 0
    app.config["negative"] = 0

    # Initialize all necessary tables in SQLite
    def init_db():
        with app.app_context():
            conn = sqlite3.connect('stores.db')
            c = conn.cursor()
            # Stores table
            c.execute('''CREATE TABLE IF NOT EXISTS stores
                         (id INTEGER PRIMARY KEY AUTOINCREMENT,
                          store_name TEXT NOT NULL,
                          store_type TEXT NOT NULL,
                          store_description TEXT,
                          contact_number TEXT NOT NULL,
                          email TEXT NOT NULL,
                          password TEXT NOT NULL,
                          latitude REAL NOT NULL,
                          longitude REAL NOT NULL)''')

            # Logs table
            c.execute('''CREATE TABLE IF NOT EXISTS logs
                         (id INTEGER PRIMARY KEY AUTOINCREMENT,
                          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                          level TEXT NOT NULL,
                          message TEXT NOT NULL,
                          user_email TEXT,
                          endpoint TEXT NOT NULL)''')

            # Products table
            c.execute('''CREATE TABLE IF NOT EXISTS products
                         (id INTEGER PRIMARY KEY AUTOINCREMENT,
                          store_id INTEGER NOT NULL,
                          name TEXT NOT NULL,
                          price REAL NOT NULL,
                          stock BOOLEAN NOT NULL,
                          FOREIGN KEY (store_id) REFERENCES stores (id))''')

            # Vehicle repair costs table
            c.execute('''CREATE TABLE IF NOT EXISTS repair_costs
                         (id INTEGER PRIMARY KEY AUTOINCREMENT,
                          vehicle TEXT NOT NULL,
                          part TEXT NOT NULL,
                          new_price_low INTEGER NOT NULL,
                          new_price_high INTEGER NOT NULL,
                          repair_value_low INTEGER NOT NULL,
                          repair_value_high INTEGER NOT NULL,
                          UNIQUE(vehicle, part))''')

            # Damage reports table
            c.execute('''CREATE TABLE IF NOT EXISTS damage_reports
                         (id INTEGER PRIMARY KEY AUTOINCREMENT,
                          vehicle TEXT NOT NULL,
                          body_type TEXT NOT NULL,
                          damage_type TEXT NOT NULL,
                          repairability TEXT NOT NULL,
                          repair_cost INTEGER NOT NULL,
                          image_path TEXT,
                          created_at DATETIME DEFAULT CURRENT_TIMESTAMP)''')

            conn.commit()
            conn.close()

    init_db()

    # Logging function
    def log_to_db(level, message, user_email=None, endpoint=None):
        try:
            conn = sqlite3.connect('stores.db')
            c = conn.cursor()
            c.execute('''INSERT INTO logs (level, message, user_email, endpoint)
                         VALUES (?, ?, ?, ?)''',
                      (level, message, user_email, endpoint))
            conn.commit()
        except sqlite3.OperationalError as e:
            print(f"Database error: {e}")
        finally:
            conn.close()


    # Store registration
    @app.route('/register', methods=['POST'])
    def register_store():
        data = request.get_json()
        store_name = data.get('store_name')
        store_type = data.get('store_type')
        store_description = data.get('store_description')
        contact_number = data.get('contact_number')
        email = data.get('email')
        password = data.get('password')
        latitude = data.get('latitude')
        longitude = data.get('longitude')

        if not all([store_name, store_type, contact_number, email, password, latitude, longitude]):
            log_to_db('ERROR', 'Missing required fields', email, '/register')
            return jsonify({'message': 'All fields are required'}), 400

        try:
            conn = sqlite3.connect('stores.db')
            c = conn.cursor()
            c.execute('''INSERT INTO stores (store_name, store_type, store_description, contact_number, email, password, latitude, longitude)
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                      (store_name, store_type, store_description, contact_number, email, password, latitude, longitude))
            conn.commit()
        except sqlite3.OperationalError as e:
            log_to_db('ERROR', f'Database error: {e}', email, '/register')
            return jsonify({'message': 'Database error'}), 500
        finally:
            conn.close()

        log_to_db('INFO', 'Store registered successfully', email, '/register')
        return jsonify({'message': 'Store registered successfully'}), 201

    # Store login
    @app.route('/login', methods=['POST'])
    def login():
        data = request.json
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            log_to_db('ERROR', 'Login attempt with missing fields', email, '/login')
            return jsonify({'message': 'Email and password are required'}), 400

        conn = sqlite3.connect('stores.db')
        c = conn.cursor()
        c.execute('SELECT * FROM stores WHERE email = ? AND password = ?', (email, password))
        user = c.fetchone()
        conn.close()

        if user:
            log_to_db('INFO', 'Login successful', email, '/login')
            return jsonify({'message': 'Login successful'}), 200
        else:
            log_to_db('ERROR', 'Login failed: Invalid credentials', email, '/login')
            return jsonify({'message': 'Invalid credentials'}), 401

    # Get store details
    @app.route('/store/<int:store_id>', methods=['GET'])
    def get_store(store_id):
        conn = sqlite3.connect('stores.db')
        c = conn.cursor()
        c.execute('SELECT * FROM stores WHERE id = ?', (store_id,))
        store = c.fetchone()
        conn.close()

        if store:
            return jsonify({
                'id': store[0],
                'store_name': store[1],
                'store_type': store[2],
                'store_description': store[3],
                'contact_number': store[4],
                'email': store[5],
                'latitude': store[7],
                'longitude': store[8]
            }), 200
        else:
            return jsonify({'message': 'Store not found'}), 404

    # Add product to store
    @app.route('/store/<int:store_id>/add-product', methods=['POST'])
    def add_product(store_id):
        data = request.json
        name = data.get('name')
        price = data.get('price')
        stock = data.get('stock', True)

        if not name or not price:
            return jsonify({'message': 'Name and price are required'}), 400

        conn = sqlite3.connect('stores.db')
        c = conn.cursor()
        c.execute('''INSERT INTO products (store_id, name, price, stock)
                     VALUES (?, ?, ?, ?)''',
                  (store_id, name, price, stock))
        conn.commit()
        product_id = c.lastrowid
        conn.close()

        return jsonify({
            'id': product_id,
            'store_id': store_id,
            'name': name,
            'price': price,
            'stock': stock,
        }), 201

    # Sentiment analysis endpoint
    @app.route('/predict', methods=['POST'])
    def predict():
        data = request.json
        text = data.get("text", "").strip()

        if not text:
            return jsonify({"error": "No text provided"}), 400

        processed_text = preprocessing(text)
        vectorized_text = vectorizer(processed_text)
        prediction = get_prediction(vectorized_text)

        if prediction == "negative":
            app.config["negative"] += 1
        else:
            app.config["positive"] += 1

        app.config["reviews"].insert(0, {"text": text, "prediction": prediction})

        return jsonify({
            "prediction": prediction,
            "positive_count": app.config["positive"],
            "negative_count": app.config["negative"],
            "recent_reviews": app.config["reviews"][:5]
        })

    # Log messages endpoint
    @app.route('/log', methods=['POST'])
    def log():
        data = request.json
        level = data.get('level')
        message = data.get('message')
        user_email = data.get('user_email')
        endpoint = data.get('endpoint')

        if not all([level, message, endpoint]):
            return jsonify({'message': 'Missing required fields'}), 400

        log_to_db(level, message, user_email, endpoint)
        return jsonify({'message': 'Log recorded successfully'}), 201



    # Damage detection upload endpoint
    @app.route('/damage_detection/upload', methods=['POST'])
    def upload_image():
        if 'image' not in request.files:
            return jsonify({"error": "No image provided"}), 400

        try:
            image = request.files['image']
            vehicle = request.form.get('vehicle')
            body_type = request.form.get('body_type')

            if not vehicle or not body_type:
                return jsonify({"error": "Missing vehicle or body type"}), 400

            prediction = damage_detection.DamageDetectionService().predict_damage_and_repairability(image)
            damage_type = prediction.get('damage_type', 'Unknown')
            repairability = prediction.get('repairability', 'Unknown')

            conn = sqlite3.connect('stores.db')
            c = conn.cursor()
            c.execute('''SELECT new_price_low, new_price_high, repair_value_low, repair_value_high
                         FROM repair_costs
                         WHERE vehicle = ? AND part = ?''',
                      (vehicle, body_type))
            price_data = c.fetchone()
            conn.close()

            if not price_data:
                fallback_new_price_range = "Rs. 35,000 - 60,000"
                fallback_repair_cost = "Rs. 8,000 - 15,000"

                return jsonify({
                    "status": "error",
                    "error": "No price data for this vehicle and part",
                    "fallback_data": {
                        "vehicle": vehicle,
                        "body_type": body_type,
                        "damage_type": damage_type,
                        "repairability": repairability,
                        "new_price_range": fallback_new_price_range,
                        "repair_cost_range": fallback_repair_cost,
                        "repair_cost_low": fallback_repair_cost,
                        "repair_cost_high": fallback_repair_cost
                    }
                }), 200

            new_price_low, new_price_high, repair_low, repair_high = price_data

            repair_cost_str = repair_low if repairability == "Repairable" else repair_high

            return jsonify({
                "status": "success",
                "vehicle": vehicle,
                "body_type": body_type,
                "damage_type": damage_type,
                "repairability": repairability,
                "new_price_range_low": new_price_low,
                "new_price_range_high": new_price_high,
                "repair_cost": repair_cost_str
            })

        except Exception as e:
            return jsonify({"status": "error", "error": str(e)}), 500

    # Get damage reports endpoint
    @app.route('/damage_reports', methods=['GET'])
    def get_damage_reports():
        conn = sqlite3.connect('stores.db')
        c = conn.cursor()
        c.execute('SELECT * FROM damage_reports ORDER BY created_at DESC LIMIT 50')
        reports = c.fetchall()
        conn.close()

        report_list = []
        for report in reports:
            report_list.append({
                "id": report[0],
                "vehicle": report[1],
                "body_type": report[2],
                "damage_type": report[3],
                "repairability": report[4],
                "repair_cost": report[5],
                "created_at": report[7]
            })

        return jsonify(report_list)

    # Get shop locations endpoint
    @app.route('/shop_locations', methods=['GET'])
    def get_locations():
        conn = sqlite3.connect('stores.db')
        c = conn.cursor()
        c.execute('SELECT DISTINCT location_id, location_name FROM shop_locations')
        rows = c.fetchall()
        conn.close()
        locations = [{"id": loc_id, "name": loc_name} for loc_id, loc_name in rows]
        return jsonify(locations)

    # Get repair shops for a location
    @app.route('/repair_shops', methods=['GET'])
    def get_repair_shops():
        location_id = request.args.get('location_id')
        if not location_id:
            return jsonify({"error": "location_id is required"}), 400

        conn = sqlite3.connect('stores.db')
        c = conn.cursor()
        c.execute('''SELECT rank, shop_name, address, phone, mapslink
                     FROM shop_locations WHERE location_id = ? ORDER BY rank''',
                  (location_id,))
        rows = c.fetchall()
        conn.close()

        shops = [{
            "rank": r,
            "shopName": name,
            "address": addr,
            "phone": phone,
            "mapslink": link
        } for r, name, addr, phone, link in rows]

        return jsonify(shops)

    # Vehicle price trends endpoint
    @app.route('/vehicle_price_trends', methods=['GET'])
    def vehicle_price_trends():
        vehicle_type = request.args.get('vehicle_type')
        model_year = request.args.get('model_year')

        print(f"Received vehicle_type: {vehicle_type}, model_year: {model_year}")

        if not vehicle_type or not model_year:
            return jsonify({'status': 'error', 'message': 'Missing vehicle_type or model_year parameter'}), 400

        if vehicle_type.startswith("Toyota_"):
            vehicle_type = vehicle_type.replace("Toyota_", "")

        conn = sqlite3.connect('stores.db')
        cursor = conn.cursor()

        query = '''
            SELECT year_2020, year_2021, year_2022, year_2023, year_2024
            FROM vehicle_market_analysis
            WHERE vehicle_type = ? AND model_year = ?
        '''
        cursor.execute(query, (vehicle_type, int(model_year)))
        row = cursor.fetchone()
        conn.close()

        if not row:
            print(f"No data found for vehicle_type={vehicle_type} and model_year={model_year}")
            return jsonify({'status': 'error', 'message': 'No data found for given parameters'}), 404

        data = {
            '2020': row[0],
            '2021': row[1],
            '2022': row[2],
            '2023': row[3],
            '2024': row[4],
        }

        return jsonify({'status': 'success', 'data': data})

    return app


if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000, debug=True)
