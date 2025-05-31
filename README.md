# AutoXpert - Vehicle Damage Detection System


Smart AI-powered solutions for vehicle damage assessment and repair cost estimation.

## 🚀 Features

- **Damage Detection**: Identifies scratches, dents, and other common vehicle damages
- **Repairability Analysis**: Determines if damage can be repaired or requires replacement
- **Cost Estimation**: Provides repair cost ranges based on vehicle make and part
- **Vehicle Selection**: Supports multiple Toyota models (Prius, Highlander, Tacoma, Tundra)
- **Body Part Analysis**: Detailed assessment for doors, bumpers, hoods, etc.

## 🛠️ Tech Stack

### Backend

- **Python** with Flask framework
- **SQLite** database for repair cost storage
- **YOLOv8** for object detection and damage localization
- **EfficientNetV2** for damage type classification

### Frontend

- **React Native** for cross-platform mobile app
- **Expo** for development and deployment
- **Axios** for API communication
- **Lottie** for animations

## 📦 Installation

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/autoxpert.git
cd autoxpert/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

# Install dependencies
pip install -r requirements.txt

# Initialize database
python app.py
```
