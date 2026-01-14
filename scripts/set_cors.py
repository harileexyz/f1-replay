from google.cloud import storage
import json

def set_cors(creds_path, bucket_name):
    client = storage.Client.from_service_account_json(creds_path)
    bucket = client.get_bucket(bucket_name)

    bucket.cors = [
        {
            "origin": ["*"],
            "responseHeader": ["Content-Type"],
            "method": ["GET"],
            "maxAgeSeconds": 3600
        }
    ]
    bucket.patch()
    print(f"✅ CORS set successfully for {bucket_name}")

if __name__ == "__main__":
    set_cors("firebase-key.json", "f1-play-6c206.firebasestorage.app")
