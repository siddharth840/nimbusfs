import time
import requests
import threading
import os

# Configuration
API_URL = "http://localhost:8005"
USERNAME = "demo_user_" + str(int(time.time()))
PASSWORD = "password123"

def print_step(msg):
    print(f"\n[DEMO STEP] {msg}")

def test_system():
    # 1. Registration & Login
    print_step("Registering and Logging in...")
    reg = requests.post(f"{API_URL}/register", json={"username": USERNAME, "password": PASSWORD})
    print(f"Registration: {reg.status_code}")
    
    login = requests.post(f"{API_URL}/login", data={"username": USERNAME, "password": PASSWORD})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Logged in successfully.")

    # 2. Upload & Replication Verification
    print_step("Uploading file for replication test...")
    filename = "replication_test.txt"
    with open("test.txt", "w") as f: f.write("Distributed System Demo Content")
    
    with open("test.txt", "rb") as f:
        files = {"file": (filename, f)}
        up = requests.post(f"{API_URL}/upload", headers=headers, files=files)
    
    file_data = up.json()
    nodes = file_data["node_locations"].split(",")
    print(f"File '{filename}' replicated on: {nodes}")

    # 3. Concurrency Control (File Locking)
    print_step("Testing Concurrency Control (Locking)...")
    
    def attempt_lock(client_id):
        print(f"Client {client_id} attempting to lock {filename} for 1 hour...")
        res = requests.post(f"{API_URL}/lock/{filename}?duration_hours=1", headers=headers)
        print(f"Client {client_id} Lock Result: {res.status_code} - {res.json().get('message', res.json().get('detail'))}")

    # Use threads to simulate simultaneous lock attempts
    t1 = threading.Thread(target=attempt_lock, args=(1,))
    t2 = threading.Thread(target=attempt_lock, args=(2,))
    
    t1.start()
    t2.start()
    t1.join()
    t2.join()

    # 4. Cleanup
    print_step("Cleaning up...")
    requests.delete(f"{API_URL}/file/{filename}?permanent=true", headers=headers)
    os.remove("test.txt")
    print("Demo completed.")

if __name__ == "__main__":
    print("=== NimbusFS Distributed System Demonstration ===")
    print("Ensure the backend (main.py) and at least one node_server.py are running.")
    try:
        test_system()
    except Exception as e:
        print(f"\nError: {e}")
        print("Please make sure the server is running on http://localhost:8005")
