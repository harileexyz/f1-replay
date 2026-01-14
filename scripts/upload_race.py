#!/usr/bin/env python3
"""
Upload F1 race telemetry data to Firebase Storage and Firestore.

Usage:
    python scripts/upload_race.py --year 2024 --round 1

Requirements:
    pip install firebase-admin
"""

import argparse
import json
import os
import sys
from datetime import datetime
import math

import numpy as np

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.f1_data import enable_cache, load_session, get_race_telemetry, get_driver_colors

# Firebase imports
import firebase_admin
from firebase_admin import credentials, storage, firestore


def numpy_to_python(obj):
    """
    Recursively convert numpy types to standard Python types for JSON serialization.
    Ensures all floats are finite, replacing non-finite values with None.
    """
    if isinstance(obj, np.ndarray):
        return [numpy_to_python(item) for item in obj.tolist()]
    elif isinstance(obj, (np.integer, np.int64, np.int32)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64, np.float32)):
        value = float(obj)
        return value if math.isfinite(value) else None
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, float):
        return obj if math.isfinite(obj) else None
    elif isinstance(obj, dict):
        return {str(key): numpy_to_python(value) for key, value in obj.items()}
    elif isinstance(obj, (list, tuple, set)):
        return [numpy_to_python(item) for item in obj]
    elif hasattr(obj, 'tolist'):  # Catch other numpy-like objects
        return numpy_to_python(obj.tolist())
    else:
        return obj


def init_firebase(credentials_path: str = None):
    """
    Initialize Firebase Admin SDK.
    
    Args:
        credentials_path: Path to service account JSON file.
                         If None, uses GOOGLE_APPLICATION_CREDENTIALS env var.
    """
    if firebase_admin._apps:
        return  # Already initialized
    
    if credentials_path:
        cred = credentials.Certificate(credentials_path)
    else:
        # Use default credentials from environment
        cred = credentials.ApplicationDefault()
    
    firebase_admin.initialize_app(cred, {
        'storageBucket': os.environ.get('FIREBASE_STORAGE_BUCKET', 'your-project.appspot.com')
    })


def upload_to_storage(data: dict, year: int, round_num: int) -> str:
    """
    Upload race data JSON to Firebase Storage.
    
    Returns:
        Public URL of the uploaded file.
    """
    bucket = storage.bucket()
    blob_path = f"races/{year}/{round_num}.json"
    blob = bucket.blob(blob_path)
    
    # Convert to JSON string
    json_data = json.dumps(data, indent=None, separators=(',', ':'), allow_nan=False)
    
    # Upload with content type
    blob.upload_from_string(
        json_data,
        content_type='application/json'
    )
    
    # Make publicly accessible (optional - depends on your security needs)
    # blob.make_public()
    
    # Generate a signed URL or use public URL
    # For public access:
    # return blob.public_url
    
    # For authenticated access, return the gs:// path
    return f"gs://{bucket.name}/{blob_path}"


def create_firestore_record(year: int, round_num: int, storage_url: str, event_name: str):
    """
    Create a metadata record in Firestore.
    """
    db = firestore.client()
    
    doc_ref = db.collection('races').document(f"{year}_{round_num}")
    doc_ref.set({
        'year': year,
        'round': round_num,
        'event_name': event_name,
        'storage_url': storage_url,
        'uploaded_at': datetime.utcnow(),
        'status': 'available'
    })
    
    print(f"Created Firestore record: races/{year}_{round_num}")


def export_race_data(year: int, round_num: int, session_type: str = 'R') -> dict:
    """
    Fetch race telemetry and prepare for export.
    
    Returns:
        Dictionary with race data in the schema expected by the frontend.
    """
    print(f"Loading session: {year} Round {round_num} ({session_type})")
    
    enable_cache()
    session = load_session(year, round_num, session_type)
    
    print(f"Fetching telemetry for: {session.event['EventName']}")
    race_data = get_race_telemetry(session, session_type=session_type)
    
    # Transform to frontend schema
    # The existing get_race_telemetry returns:
    # {
    #   "frames": [...],
    #   "driver_colors": {"VER": (0, 0, 255), ...},
    #   "track_statuses": [...],
    #   "total_laps": int
    # }
    #
    # We need to ensure driver_colors are lists not tuples
    
    export_data = {
        "frames": race_data["frames"],
        "track_layout": race_data.get("track_layout", []),
        "track_statuses": race_data["track_statuses"],
        "driver_colors": {
            code: list(rgb) if isinstance(rgb, tuple) else rgb
            for code, rgb in race_data["driver_colors"].items()
        },
        "total_laps": race_data["total_laps"],
        "metadata": {
            "year": year,
            "round": round_num,
            "event_name": session.event['EventName'],
            "session_type": session_type,
            "exported_at": datetime.utcnow().isoformat()
        }
    }
    
    return numpy_to_python(export_data)


def main():
    parser = argparse.ArgumentParser(
        description="Export F1 race telemetry to Firebase"
    )
    parser.add_argument(
        "--year", type=int, required=True,
        help="Race year (e.g., 2024)"
    )
    parser.add_argument(
        "--round", type=int, required=True,
        help="Race round number"
    )
    parser.add_argument(
        "--session-type", type=str, default="R",
        choices=["R", "S", "Q", "SQ"],
        help="Session type: R=Race, S=Sprint, Q=Qualifying, SQ=Sprint Qualifying"
    )
    parser.add_argument(
        "--credentials", type=str, default=None,
        help="Path to Firebase service account JSON (optional if using env vars)"
    )
    parser.add_argument(
        "--local-only", action="store_true",
        help="Export to local JSON file instead of uploading to Firebase"
    )
    parser.add_argument(
        "--output", type=str, default=None,
        help="Output path for local export (default: computed_data/{year}_{round}.json)"
    )
    
    args = parser.parse_args()
    
    # Export the race data
    race_data = export_race_data(args.year, args.round, args.session_type)
    
    if args.local_only:
        # Save locally instead of uploading
        output_path = args.output or f"computed_data/{args.year}_{args.round}.json"
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w') as f:
            json.dump(race_data, f, separators=(',', ':'), allow_nan=False)
        
        print(f"Exported to: {output_path}")
        print(f"File size: {os.path.getsize(output_path) / (1024*1024):.2f} MB")
    else:
        # Upload to Firebase
        init_firebase(args.credentials)
        
        print("Uploading to Firebase Storage...")
        storage_url = upload_to_storage(race_data, args.year, args.round)
        print(f"Uploaded to: {storage_url}")
        
        print("Creating Firestore record...")
        create_firestore_record(
            args.year,
            args.round,
            storage_url,
            race_data["metadata"]["event_name"]
        )
        
        print("Done!")


if __name__ == "__main__":
    main()
