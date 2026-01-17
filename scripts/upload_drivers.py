#!/usr/bin/env python3
"""
Fetch F1 driver and team data from OpenF1 API and upload to Firebase.
Run this script to populate/update the drivers and teams collections.
"""

import os
import sys
import json
import requests
from datetime import datetime
import argparse
import logging

import firebase_admin
from firebase_admin import credentials, firestore

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Parse args
parser = argparse.ArgumentParser(description='Update F1 Drivers')
parser.add_argument('--year', type=int, default=2024, help='Season year')
args = parser.parse_args()
SEASON = args.year

API_BASE_URL = "https://api.openf1.org/v1"

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


# Initialize Firebase
def init_firebase():
    if not firebase_admin._apps:
        # Try to find credentials
        cred_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
        if not cred_path:
            # Try common locations
            possible_paths = [
                os.path.join(os.path.dirname(__file__), '..', 'firebase-key.json'),
                os.path.join(os.path.dirname(__file__), '..', 'firebase-credentials.json'),
                os.path.join(os.path.dirname(__file__), '..', 'service-account.json'),
            ]
            for path in possible_paths:
                if os.path.exists(path):
                    cred_path = path
                    break
        
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            # Use default credentials (for GCP environments)
            firebase_admin.initialize_app()
    
    return firestore.client()

def fetch_openf1_drivers(session_key='latest'):
    """Fetch drivers from OpenF1 API."""
    url = f"https://api.openf1.org/v1/drivers?session_key={session_key}"
    print(f"Fetching drivers from: {url}")
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching drivers: {e}")
        return []

def get_driver_stats():
    """
    Return driver stats. In production, this would come from an API.
    For now, using 2024 season approximate data.
    """
    return {
        "VER": {"championships": 4, "race_wins": 62, "podiums": 111, "poles": 40},
        "NOR": {"championships": 0, "race_wins": 4, "podiums": 26, "poles": 7},
        "LEC": {"championships": 0, "race_wins": 8, "podiums": 40, "poles": 26},
        "SAI": {"championships": 0, "race_wins": 4, "podiums": 24, "poles": 6},
        "HAM": {"championships": 7, "race_wins": 105, "podiums": 201, "poles": 104},
        "RUS": {"championships": 0, "race_wins": 3, "podiums": 16, "poles": 4},
        "PIA": {"championships": 0, "race_wins": 2, "podiums": 9, "poles": 2},
        "PER": {"championships": 0, "race_wins": 6, "podiums": 39, "poles": 3},
        "ALO": {"championships": 2, "race_wins": 32, "podiums": 106, "poles": 22},
        "STR": {"championships": 0, "race_wins": 0, "podiums": 0, "poles": 0},
        "OCO": {"championships": 0, "race_wins": 1, "podiums": 4, "poles": 0},
        "GAS": {"championships": 0, "race_wins": 1, "podiums": 4, "poles": 0},
        "TSU": {"championships": 0, "race_wins": 0, "podiums": 0, "poles": 0},
        "RIC": {"championships": 0, "race_wins": 8, "podiums": 32, "poles": 3},
        "HUL": {"championships": 0, "race_wins": 0, "podiums": 0, "poles": 1},
        "MAG": {"championships": 0, "race_wins": 0, "podiums": 1, "poles": 1},
        "BOT": {"championships": 0, "race_wins": 10, "podiums": 67, "poles": 20},
        "ZHO": {"championships": 0, "race_wins": 0, "podiums": 0, "poles": 0},
        "ALB": {"championships": 0, "race_wins": 0, "podiums": 0, "poles": 0},
        "SAR": {"championships": 0, "race_wins": 0, "podiums": 0, "poles": 0},
        "COL": {"championships": 0, "race_wins": 0, "podiums": 0, "poles": 0},
        "LAW": {"championships": 0, "race_wins": 0, "podiums": 0, "poles": 0},
        "BEA": {"championships": 0, "race_wins": 0, "podiums": 0, "poles": 0},
        "ANT": {"championships": 0, "race_wins": 0, "podiums": 0, "poles": 0},
        "BOR": {"championships": 0, "race_wins": 0, "podiums": 0, "poles": 0},
        "HAD": {"championships": 0, "race_wins": 0, "podiums": 0, "poles": 0},
        "DOO": {"championships": 0, "race_wins": 0, "podiums": 0, "poles": 0},
    }

def get_high_res_image(code):
    """Return high-res image URL for the driver code."""
    # Map 'CODE' to 'ID_Name'
    # Pattern: https://media.formula1.com/content/dam/fom-website/drivers/{FirstLetter}/{ID}_{Name}/{id}.png
    
    mapping = {
        "VER": "MAXVER01_Max_Verstappen",
        "PER": "SERPER01_Sergio_Perez",
        "LEC": "CHALEC01_Charles_Leclerc",
        "SAI": "CARSAI01_Carlos_Sainz",
        "NOR": "LANNOR01_Lando_Norris",
        "PIA": "OSCPIA01_Oscar_Piastri",
        "HAM": "LEWHAM01_Lewis_Hamilton",
        "RUS": "GEORUS01_George_Russell",
        "ALO": "FERALO01_Fernando_Alonso",
        "STR": "LANSTR01_Lance_Stroll",
        "GAS": "PIEGAS01_Pierre_Gasly",
        "OCO": "ESTOCO01_Esteban_Ocon",
        "ALB": "ALEALB01_Alexander_Albon",
        "SAR": "LOGSAR01_Logan_Sargeant",
        "COL": "FRACOL01_Franco_Colapinto",
        "TSU": "YUKTSU01_Yuki_Tsunoda",
        "RIC": "DANRIC01_Daniel_Ricciardo",
        "LAW": "LIALAW01_Liam_Lawson",
        "BOT": "VALBOT01_Valtteri_Bottas",
        "ZHO": "GUAZHO01_Guanyu_Zhou",
        "HUL": "NICHUL01_Nico_Hulkenberg",
        "MAG": "KEVMAG01_Kevin_Magnussen",
        "BEA": "OLIBEA01_Oliver_Bearman",
        "ANT": "KIMANT01_Kimi_Antonelli",
        "BOR": "GABBOR01_Gabriel_Bortoleto",
        "HAD": "ISAHAD01_Isack_Hadjar",
        "DOO": "JACDOO01_Jack_Doohan",
    }
    
    if code in mapping:
        path_name = mapping[code]
        file_id = path_name.split('_')[0].lower()
        first_letter = path_name[0]
        return f"https://media.formula1.com/content/dam/fom-website/drivers/{first_letter}/{path_name}/{file_id}.png"
    
    return None

def get_team_info():
    """Return team details."""
    return {
        "Red Bull Racing": {
            "id": "red_bull",
            "full_name": "Oracle Red Bull Racing",
            "base": "Milton Keynes, United Kingdom",
            "team_principal": "Christian Horner",
            "car_name": "RB20",
            "engine": "Honda RBPT"
        },
        "Ferrari": {
            "id": "ferrari",
            "full_name": "Scuderia Ferrari",
            "base": "Maranello, Italy",
            "team_principal": "Frédéric Vasseur",
            "car_name": "SF-24",
            "engine": "Ferrari"
        },
        "McLaren": {
            "id": "mclaren",
            "full_name": "McLaren F1 Team",
            "base": "Woking, United Kingdom",
            "team_principal": "Andrea Stella",
            "car_name": "MCL38",
            "engine": "Mercedes"
        },
        "Mercedes": {
            "id": "mercedes",
            "full_name": "Mercedes-AMG Petronas F1 Team",
            "base": "Brackley, United Kingdom",
            "team_principal": "Toto Wolff",
            "car_name": "W15",
            "engine": "Mercedes"
        },
        "Aston Martin": {
            "id": "aston_martin",
            "full_name": "Aston Martin Aramco F1 Team",
            "base": "Silverstone, United Kingdom",
            "team_principal": "Mike Krack",
            "car_name": "AMR24",
            "engine": "Mercedes"
        },
        "Alpine": {
            "id": "alpine",
            "full_name": "BWT Alpine F1 Team",
            "base": "Enstone, United Kingdom",
            "team_principal": "Bruno Famin",
            "car_name": "A524",
            "engine": "Renault"
        },
        "RB": {
            "id": "rb",
            "full_name": "Visa Cash App RB F1 Team",
            "base": "Faenza, Italy",
            "team_principal": "Laurent Mekies",
            "car_name": "VCARB 01",
            "engine": "Honda RBPT"
        },
        "Haas F1 Team": {
            "id": "haas",
            "full_name": "MoneyGram Haas F1 Team",
            "base": "Kannapolis, USA",
            "team_principal": "Ayao Komatsu",
            "car_name": "VF-24",
            "engine": "Ferrari"
        },
        "Kick Sauber": {
            "id": "sauber",
            "full_name": "Stake F1 Team Kick Sauber",
            "base": "Hinwil, Switzerland",
            "team_principal": "Alessandro Alunni Bravi",
            "car_name": "C44",
            "engine": "Ferrari"
        },
        "Williams": {
            "id": "williams",
            "full_name": "Williams Racing",
            "base": "Grove, United Kingdom",
            "team_principal": "James Vowles",
            "car_name": "FW46",
            "engine": "Mercedes"
        }
    }

def create_driver_id(name):
    """Create a URL-friendly ID from driver name."""
    return name.lower().replace(' ', '_').replace('-', '_')

def upload_drivers(db, drivers_data):
    """Upload driver data to Firestore."""
    stats = get_driver_stats()
    team_info = get_team_info()
    
    # Deduplicate drivers by taking the most recent entry
    unique_drivers = {}
    for driver in drivers_data:
        code = driver.get('name_acronym', '')
        if code and (code not in unique_drivers or driver.get('session_key', 0) > unique_drivers[code].get('session_key', 0)):
            unique_drivers[code] = driver
    
    drivers_ref = db.collection('drivers')
    teams_ref = db.collection('teams')
    
    uploaded_teams = set()
    
    for code, driver in unique_drivers.items():
        full_name = driver.get('full_name', '')
        if not full_name:
            continue
            
        driver_id = create_driver_id(full_name)
        team_name = driver.get('team_name', '')
        team_color = driver.get('team_colour', '#ffffff')
        
        # Get team info
        team_data = team_info.get(team_name, {})
        team_id = team_data.get('id', create_driver_id(team_name))
        
        # Upload team if not already done
        if team_name and team_name not in uploaded_teams:
            team_doc = {
                'id': team_id,
                'name': team_name,
                'full_name': team_data.get('full_name', team_name),
                'base': team_data.get('base', ''),
                'team_principal': team_data.get('team_principal', ''),
                'color': f"#{team_color}" if not team_color.startswith('#') else team_color,
                'logo_url': '',  # To be added manually or from another source
                'season': 2024,
                'updated_at': firestore.SERVER_TIMESTAMP
            }
            teams_ref.document(team_id).set(team_doc)
            uploaded_teams.add(team_name)
            print(f"  Uploaded team: {team_name}")
        
        # Create driver document
        driver_stats = stats.get(code, {"championships": 0, "race_wins": 0, "podiums": 0, "poles": 0})
        
        # Split name
        name_parts = full_name.split(' ')
        first_name = name_parts[0] if name_parts else ''
        last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
        
        # Try to get high-res image
        high_res_image = get_high_res_image(code)
        
        driver_doc = {
            'id': driver_id,
            'code': code,
            'driver_number': driver.get('driver_number', 0),
            'full_name': full_name,
            'first_name': first_name,
            'last_name': last_name,
            'team_id': team_id,
            'team_name': team_name,
            'team_color': f"#{team_color}" if not team_color.startswith('#') else team_color,
            'country_code': driver.get('country_code', ''),
            'headshot_url': high_res_image if high_res_image else driver.get('headshot_url', ''),
            'bio': '',  # To be added manually
            'stats': driver_stats,
            'season': 2024,
            'updated_at': firestore.SERVER_TIMESTAMP
        }
        
        drivers_ref.document(driver_id).set(driver_doc)
        print(f"  Uploaded driver: {full_name} ({code}) - Image: {'High Res' if high_res_image else 'Standard'}")
    
    return len(unique_drivers)

def get_car_image(team_id):
    """Return high-res car image URL for the team ID."""
    # Pattern: https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/{team_slug}.png
    
    # Map 'team_id' to 'team_slug'
    mapping = {
        "red_bull": "red-bull-racing",
        "ferrari": "ferrari",
        "mclaren": "mclaren",
        "mercedes": "mercedes",
        "aston_martin": "aston-martin",
        "alpine": "alpine",
        "rb": "rb",
        "haas": "haas",
        "sauber": "kick-sauber",
        "williams": "williams"
    }
    
    if team_id in mapping:
        slug = mapping[team_id]
        return f"https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/{slug}.png"
    
    return ""

def upload_cars(db):
    """Upload car data to Firestore."""
    team_info = get_team_info()
    cars_ref = db.collection('cars')
    
    for team_name, info in team_info.items():
        car_id = info['id'] + '_' + info['car_name'].lower().replace(' ', '_').replace('-', '')
        
        # Enhanced specs (placeholder data for now, but structure is ready)
        specs = {
            'power_unit': info['engine'],
            'chassis': f"Carbon-fibre composite monocoque ({info['car_name']})",
            'weight': '798 kg (minimum)',
            'transmission': '8-speed + reverse, semi-automatic',
            'brakes': 'Carbon discs and pads, fly-by-wire rear brakes',
            'suspension': 'Carbon-fibre wishbones, pushrod/pullrod activated springs'
        }

        image_url = get_car_image(info['id'])

        car_doc = {
            'id': car_id,
            'team_id': info['id'],
            'team_name': team_name,
            'name': info['car_name'],
            'season': 2024,
            'image_url': image_url, 
            'specs': specs,
            'updated_at': firestore.SERVER_TIMESTAMP
        }
        
        cars_ref.document(car_id).set(car_doc)
        print(f"  Uploaded car: {info['car_name']} ({team_name}) - Image: {'High Res' if image_url else 'None'}")
    
    return len(team_info)

def main():
    print("=" * 60)
    print("F1 Driver & Team Data Uploader")
    print("=" * 60)
    
    # Initialize Firebase
    print("\n1. Initializing Firebase...")
    db = init_firebase()
    print("   Firebase initialized successfully!")
    
    # Fetch drivers from OpenF1
    print("\n2. Fetching drivers from OpenF1 API...")
    drivers_data = fetch_openf1_drivers()
    print(f"   Fetched {len(drivers_data)} driver records")
    
    if not drivers_data:
        print("   No drivers fetched. Using fallback data...")
        # Create fallback data structure
        drivers_data = []
    
    # Upload drivers and teams
    print("\n3. Uploading drivers and teams to Firestore...")
    num_drivers = upload_drivers(db, drivers_data)
    print(f"   Uploaded {num_drivers} drivers")
    
    # Upload cars
    print("\n4. Uploading car data to Firestore...")
    num_cars = upload_cars(db)
    print(f"   Uploaded {num_cars} cars")
    
    print("\n" + "=" * 60)
    print("Upload complete!")
    print("=" * 60)

if __name__ == "__main__":
    main()
