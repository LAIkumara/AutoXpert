from db import db

class Store(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    store_name = db.Column(db.String(100), nullable=False)
    store_type = db.Column(db.String(50), nullable=False)
    store_description = db.Column(db.Text, nullable=False)
    contact_number = db.Column(db.String(15), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Boolean, default=True)
    quantity = db.Column(db.Integer, nullable=False)
    store_id = db.Column(db.Integer, db.ForeignKey('store.id'), nullable=False)


class RepairCost(db.Model):
    __tablename__ = 'repair_costs'

    id = db.Column(db.Integer, primary_key=True)
    vehicle = db.Column(db.String(50), nullable=False)
    part = db.Column(db.String(50), nullable=False)
    new_price_low = db.Column(db.Integer, nullable=False)
    new_price_high = db.Column(db.Integer, nullable=False)
    repair_value_low = db.Column(db.Integer, nullable=False)
    repair_value_high = db.Column(db.Integer, nullable=False)


class DamageReport(db.Model):
    __tablename__ = 'damage_reports'

    id = db.Column(db.Integer, primary_key=True)
    vehicle = db.Column(db.String(50), nullable=False)
    body_type = db.Column(db.String(50), nullable=False)
    damage_type = db.Column(db.String(50), nullable=False)
    repairability = db.Column(db.String(20), nullable=False)
    repair_cost = db.Column(db.Integer, nullable=False)
    image_path = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.now)