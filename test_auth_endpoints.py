#!/usr/bin/env python3
import requests
import json

BASE_URL = "http://localhost:4000/api/v1"

USER_CREDENTIALS = {
    "email": "testuser@example.com",
    "username": "testuser",
    "password": "password123"
}

WRONG_USER_CREDENTIALS = {
    "email": "testuser@example.com",
    "password": "wrongpassword"
}

REGISTER_URL = f"{BASE_URL}/auth/register"
LOGIN_URL = f"{BASE_URL}/auth/login"
PROFILE_URL = f"{BASE_URL}/users/me/profile"
LOGOUT_URL = f"{BASE_URL}/auth/logout"

headers = {
    "Content-Type": "application/json"
}

access_token = None

def print_response(response):
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response JSON: {response.json()}")
    except requests.exceptions.JSONDecodeError:
        print(f"Response Text: {response.text}")
    print("---")

# 1. Register a new user
print("1. Testing User Registration...")
response = requests.post(REGISTER_URL, headers=headers, json=USER_CREDENTIALS)
print_response(response)

# Try to register the same user again (should fail)
print("1a. Testing User Registration with existing email/username...")
response = requests.post(REGISTER_URL, headers=headers, json=USER_CREDENTIALS)
print_response(response)

# 2. Login with the new user's credentials
print("2. Testing User Login...")
login_payload = {"email": USER_CREDENTIALS["email"], "password": USER_CREDENTIALS["password"]}
response = requests.post(LOGIN_URL, headers=headers, json=login_payload)
print_response(response)

if response.status_code == 200:
    access_token = response.json().get("access_token")
    print(f"Access Token: {access_token}")
else:
    print("Login failed, cannot proceed with token-dependent tests.")
    exit()

# 3. Fetch user profile with the access token
print("3. Testing Fetch User Profile (with token)...")
auth_headers = {"Authorization": f"Bearer {access_token}"}
response = requests.get(PROFILE_URL, headers=auth_headers)
print_response(response)

# 4. Attempt to fetch profile with an invalid token
print("4. Testing Fetch User Profile (with invalid token)...")
invalid_auth_headers = {"Authorization": "Bearer invalidtoken123"}
response = requests.get(PROFILE_URL, headers=invalid_auth_headers)
print_response(response)

# 5. Attempt to fetch profile without a token
print("5. Testing Fetch User Profile (without token)...")
response = requests.get(PROFILE_URL) # No auth header
print_response(response)

# 6. Logout using the access token
print("6. Testing User Logout (with token)...")
response = requests.post(LOGOUT_URL, headers=auth_headers) # Logout needs auth header
print_response(response)

# 7. Attempt to fetch profile again with the (now presumably invalidated) token
print("7. Testing Fetch User Profile (with token after logout)...")
response = requests.get(PROFILE_URL, headers=auth_headers)
print_response(response)

# 8. Login with wrong credentials
print("8. Testing User Login (with wrong credentials)...")
response = requests.post(LOGIN_URL, headers=headers, json=WRONG_USER_CREDENTIALS)
print_response(response)

print("Testing complete.")

