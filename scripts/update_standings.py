import requests
import json
import os
import datetime

# Setup directories
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'web', 'src', 'data')
os.makedirs(DATA_DIR, exist_ok=True)
OUTPUT_FILE = os.path.join(DATA_DIR, 'standings.ts')

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
            # Fallback for images - in a real app better to fetch from F1 website map
            driver_code = driver.get('code', 'UNK')
            
            # Attempt to build an F1.com style image URL (this is a guess, usually needs a map)
            # Using generic placeholders from the mock for safety if we can't map strictly
            
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
                'podiums': 0, # Ergast doesn't give podium count in standings directly, would need to calc. Leaving 0 or generic? 
                 # Actually let's assume wins is enough for now or use a placeholder
                'trend': 'SAME', # Live trend requires previous race comparison. 
                'avatarUrl': f"https://media.formula1.com/content/dam/fom-website/drivers/{driver['givenName'][0].upper()}/{driver['code'].upper()}01_{driver['givenName']}_{driver['familyName']}/{driver['code'].lower()}01.png", 
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
                'drivers': [] # Would need another call to fill this perfectly
            })
        return formatted_standings
    except Exception as e:
        print(f"Error fetching constructor standings: {e}")
        return []

def generate_ts_file(drivers, constructors):
    print(f"Generating {OUTPUT_FILE}...")
    
    ts_content = f"""export interface StandingItem {{
    position: number;
    driverId: string;
    constructorId: string;
    name: string;
    team: string;
    points: number;
    wins: number;
    podiums: number;
    trend: 'UP' | 'DOWN' | 'SAME';
    trendPos?: number;
    avatarUrl: string;
    teamColor: string;
}}

export interface ConstructorStandingItem {{
    position: number;
    constructorId: string;
    name: string;
    points: number;
    wins: number;
    podiums: number;
    trend: 'UP' | 'DOWN' | 'SAME';
    logoUrl: string;
    teamColor: string;
    drivers: string[];
}}

export const DRIVER_STANDINGS_2024: StandingItem[] = {json.dumps(drivers, indent=4)};

export const CONSTRUCTOR_STANDINGS_2024: ConstructorStandingItem[] = {json.dumps(constructors, indent=4)};

// Mock history data preserved for the graph until we build the rigorous history fetcher
export const POINTS_HISTORY_DATA = [
    {{ round: 'BHR', VER: 25, LEC: 12, NOR: 10, HAM: 8 }},
    {{ round: 'SAU', VER: 50, LEC: 27, NOR: 18, HAM: 14 }},
    {{ round: 'AUS', VER: 50, LEC: 45, NOR: 33, HAM: 20 }},
    {{ round: 'JPN', VER: 76, LEC: 57, NOR: 45, HAM: 26 }},
    {{ round: 'CHN', VER: 101, LEC: 72, NOR: 60, HAM: 36 }},
    {{ round: 'MIA', VER: 120, LEC: 90, NOR: 85, HAM: 40 }},
    {{ round: 'EMI', VER: 145, LEC: 108, NOR: 103, HAM: 50 }},
    {{ round: 'MON', VER: 155, LEC: 133, NOR: 113, HAM: 60 }},
    {{ round: 'CAN', VER: 180, LEC: 133, NOR: 128, HAM: 75 }},
    {{ round: 'ESP', VER: 205, LEC: 145, NOR: 146, HAM: 85 }}
];
"""
    
    with open(OUTPUT_FILE, 'w') as f:
        f.write(ts_content)
    print("Done!")

if __name__ == "__main__":
    drivers = fetch_driver_standings()
    constructors = fetch_constructor_standings()
    
    # If API fails (e.g. rate limit or downtime for 2024/future), fallback to maintaining existing or empty?
    # For now, we write what we found.
    if drivers and constructors:
        generate_ts_file(drivers, constructors)
    else:
        print("Failed to fetch complete data, not overwriting file.")
