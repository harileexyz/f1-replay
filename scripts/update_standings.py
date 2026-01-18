import requests
import json
import os
import sys
import firebase_admin
from firebase_admin import credentials, firestore
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# API Endpoints
# Using 2024 specifically as requested, or 'current' for live data
YEAR = "2024" 
BASE_URL = f"https://api.jolpi.ca/ergast/f1/{YEAR}" # Using Jolpi mirror which is more reliable post-Ergast sunset
HEADERS = {
    'User-Agent': 'F1FanHub/1.0 (daily-driver-project)'
}

# Team mapping for colors and IDs
TEAM_MAP = {
    'red_bull': {'color': '#3671C6', 'name': 'Red Bull Racing', 'logo': 'https://media.formula1.com/content/dam/fom-website/teams/2024/red-bull-racing-logo.png'},
    'ferrari': {'color': '#E8002D', 'name': 'Ferrari', 'logo': 'https://media.formula1.com/content/dam/fom-website/teams/2024/ferrari-logo.png'},
    'mclaren': {'color': '#FF8700', 'name': 'McLaren', 'logo': 'https://media.formula1.com/content/dam/fom-website/teams/2024/mclaren-logo.png'},
    'mercedes': {'color': '#00D2BE', 'name': 'Mercedes', 'logo': 'https://media.formula1.com/content/dam/fom-website/teams/2024/mercedes-logo.png'},
    'aston_martin': {'color': '#006F62', 'name': 'Aston Martin', 'logo': 'https://media.formula1.com/content/dam/fom-website/teams/2024/aston-martin-logo.png'},
    'rb': {'color': '#6692FF', 'name': 'RB', 'logo': 'https://media.formula1.com/content/dam/fom-website/teams/2024/rb-logo.png'},
    'haas': {'color': '#B6BABD', 'name': 'Haas F1 Team', 'logo': 'https://media.formula1.com/content/dam/fom-website/teams/2024/haas-f1-team-logo.png'},
    'williams': {'color': '#64C4FF', 'name': 'Williams', 'logo': 'https://media.formula1.com/content/dam/fom-website/teams/2024/williams-logo.png'},
    'alpine': {'color': '#0093CC', 'name': 'Alpine', 'logo': 'https://media.formula1.com/content/dam/fom-website/teams/2024/alpine-logo.png'},
    'sauber': {'color': '#52E252', 'name': 'Kick Sauber', 'logo': 'https://media.formula1.com/content/dam/fom-website/teams/2024/kick-sauber-logo.png'},
}

def get_high_res_image(code):
    """Return high-res image URL for the driver code."""
    # Map 'CODE' to 'ID_Name'
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

def init_firebase():
    if not firebase_admin._apps:
        # Try to find credentials
        cred_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
        
        if not cred_path:
             # Check explicitly for our CI/CD key file first
            if os.path.exists("firebase-key.json"):
                cred_path = "firebase-key.json"
            else:
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
            logger.info(f"Initialized Firebase with credentials from: {cred_path}")
        else:
            # Use default credentials (for GCP environments)
            logger.info("Initialized Firebase with Application Default Credentials")
            firebase_admin.initialize_app()
    
    return firestore.client()

def get_team_id(constructor_id):
    # Map API constructor IDs to our internal IDs if needed
    mapping = {
        'red_bull': 'red_bull',
        'ferrari': 'ferrari',
        'mclaren': 'mclaren',
        'mercedes': 'mercedes',
        'aston_martin': 'aston_martin',
        'rb': 'rb',
        'haas': 'haas',
        'williams': 'williams',
        'alpine': 'alpine',
        'sauber': 'sauber',
        'kick_sauber': 'sauber'
    }
    return mapping.get(constructor_id, constructor_id)

def fetch_driver_standings():
    print("Fetching driver standings...")
    try:
        response = requests.get(f"{BASE_URL}/driverStandings.json", headers=HEADERS)
        response.raise_for_status()
        data = response.json()
        standings_list = data['MRData']['StandingsTable']['StandingsLists'][0]['DriverStandings']
        
        formatted_standings = []
        for item in standings_list:
            driver = item['Driver']
            constructor = item['Constructors'][0]
            
            # Construct meaningful IDs and URLs
            driver_name = f"{driver['givenName']} {driver['familyName']}"
            driver_id = driver['driverId']
            driver_code = driver.get('code', 'UNK')
            
            # Use high-res image mapping
            avatar_url = get_high_res_image(driver_code)
            if not avatar_url:
                 # Fallback if mapping fails
                 avatar_url = f"https://media.formula1.com/content/dam/fom-website/drivers/{driver.get('givenName', 'A')[0].upper()}/{driver_code.upper()}01_{driver.get('givenName')}_{driver.get('familyName')}/{driver_code.lower()}01.png"

            team_id = get_team_id(constructor['constructorId'])
            team_info = TEAM_MAP.get(team_id, {'color': '#000000', 'name': constructor['name']})
            
            formatted_standings.append({
                'position': int(item['position']),
                'driverId': driver_id,
                'constructorId': team_id,
                'name': driver_name,
                'team': team_info['name'],
                'points': float(item['points']),
                'wins': int(item['wins']),
                'podiums': 0, 
                'trend': 'SAME', 
                'avatarUrl': avatar_url, 
                'teamColor': team_info['color']
            })
            
        return formatted_standings
    except Exception as e:
        print(f"Error fetching driver standings: {e}")
        return []

def fetch_constructor_standings():
    print("Fetching constructor standings...")
    try:
        response = requests.get(f"{BASE_URL}/constructorStandings.json", headers=HEADERS)
        response.raise_for_status()
        data = response.json()
        standings_list = data['MRData']['StandingsTable']['StandingsLists'][0]['ConstructorStandings']
        
        formatted_standings = []
        for item in standings_list:
            constructor = item['Constructor']
            team_id = get_team_id(constructor['constructorId'])
            team_info = TEAM_MAP.get(team_id, {'color': '#000000', 'name': constructor['name'], 'logo': ''})
            
            formatted_standings.append({
                'position': int(item['position']),
                'constructorId': team_id,
                'name': team_info['name'],
                'points': float(item['points']),
                'wins': int(item['wins']),
                'podiums': 0,
                'trend': 'SAME',
                'logoUrl': team_info['logo'],
                'teamColor': team_info['color'],
                'drivers': [] 
            })
        return formatted_standings
    except Exception as e:
        print(f"Error fetching constructor standings: {e}")
        return []

def upload_standings(db, drivers, constructors):
    print("Uploading standings to Firebase...")
    
    # We store standings in a document per season, e.g. 'standings/2024'
    # This document will contain two sub-fields or sub-collections: 'drivers' and 'constructors'
    # To keep it simple and querying fast, let's just make it a single document with arrays.
    
    doc_ref = db.collection('standings').document(YEAR)
    
    data = {
        'season': int(YEAR),
        'updated_at': firestore.SERVER_TIMESTAMP,
        'driver_standings': drivers,
        'constructor_standings': constructors
    }
    
    doc_ref.set(data, merge=True)
    print(f"Successfully uploaded standings for {YEAR}!")

def main():
    print("=" * 60)
    print("F1 Standings Uploader")
    print("=" * 60)
    
    import argparse
    parser = argparse.ArgumentParser(description='Update F1 Standings')
    parser.add_argument('--year', type=str, default="2024", help='Season year')
    args = parser.parse_args()
    
    global YEAR, BASE_URL
    YEAR = args.year
    BASE_URL = f"https://api.jolpi.ca/ergast/f1/{YEAR}"

    db = init_firebase()

    drivers = fetch_driver_standings()
    constructors = fetch_constructor_standings()
    
    if drivers and constructors:
        upload_standings(db, drivers, constructors)
    else:
        print("Failed to fetch complete data, skipping upload.")

if __name__ == "__main__":
    main()
