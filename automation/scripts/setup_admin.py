"""
Setup Script for Initial Super Admin User
Run this once to create the first super admin account

Usage:
    python automation/scripts/setup_admin.py
    python automation/scripts/setup_admin.py http://localhost:5001  (custom URL)
    
This will prompt you for the super admin email, password, and name,
then create the account via the backend API.
"""

import requests
import sys
import os
from getpass import getpass
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env
env_path = Path(__file__).parent.parent.parent / '.env'
load_dotenv(env_path)


class AdminSetup:
    def __init__(self, api_url=None):
        """Initialize with API base URL"""
        if api_url is None:
            # Get port from .env or default to 5000
            port = os.getenv('PORT', '5000')
            api_url = f"http://localhost:{port}"
        
        self.api_url = api_url
        self.endpoint = f"{api_url}/api/super-admin/auth/setup-admin"
    
    def create_admin(self, email, password, full_name):
        """Create a new super admin account via API"""
        try:
            response = requests.post(
                self.endpoint,
                json={
                    'email': email.strip(),
                    'password': password,
                    'fullName': full_name.strip(),
                }
            )
            
            if response.status_code == 201:
                data = response.json()
                print(f"\n✓ Super admin created successfully!")
                print(f"  Email: {data['data']['admin']['email']}")
                print(f"  Name: {data['data']['admin']['fullName']}")
                print(f"  ID: {data['data']['admin']['id']}")
                return True
            elif response.status_code == 409:
                print("✗ Admin account already exists")
                return False
            else:
                print(f"✗ Error: {response.json()['message']}")
                return False
                
        except requests.ConnectionError:
            print("✗ Error: Could not connect to server")
            print(f"  Make sure the server is running at {self.api_url}")
            print(f"  Run: npm run dev")
            return False
        except Exception as e:
            print(f"✗ Error: {str(e)}")
            return False


def main():
    """Main entry point"""
    print("\n" + "="*60)
    print("Super Admin Setup")
    print("="*60)
    print("\n⚠️  Make sure your server is running!")
    print("   Run: npm run dev\n")
    
    # Get API URL from command line or use default from .env
    api_url = sys.argv[1] if len(sys.argv) > 1 else None
    
    try:
        setup = AdminSetup(api_url)
        
        print(f"🔗 Connecting to: {setup.api_url}")
        
        print("="*60)
        print("Create New Super Admin")
        print("="*60 + "\n")
        
        # Get input
        email = input("Enter email address: ").strip()
        if not email:
            print("✗ Email is required")
            return
        
        full_name = input("Enter full name: ").strip()
        if not full_name:
            print("✗ Full name is required")
            return
        
        password = getpass("Enter password (minimum 6 characters): ")
        if len(password) < 6:
            print("✗ Password must be at least 6 characters")
            return
        
        confirm = getpass("Confirm password: ")
        if password != confirm:
            print("✗ Passwords do not match")
            return
        
        # Create admin via API
        if setup.create_admin(email, password, full_name):
            print("\n✓ Setup Complete! You can now log in with:")
            print(f"  Email: {email}")
            print(f"  Dashboard: {setup.api_url}\n")
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        sys.exit(1)


if __name__ == '__main__':
    main()
