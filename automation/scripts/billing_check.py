"""
Billing Status Check Script
Automatically marks clients as 'due' when billing date has passed
Scheduled to run daily via cron job

Usage:
    python automation/scripts/billing_check.py
    
Environment Variables:
    MONGODB_URI - MongoDB Atlas connection string
"""

import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from pymongo import MongoClient
except ImportError:
    print("Error: pymongo not installed. Install with: pip install pymongo python-dotenv")
    sys.exit(1)


class BillingChecker:
    def __init__(self):
        """Initialize MongoDB connection"""
        self.mongo_uri = os.getenv('MONGODB_URI')
        if not self.mongo_uri:
            raise ValueError("MONGODB_URI environment variable not set")
        
        self.client = MongoClient(self.mongo_uri)
        self.db = self.client.get_database()
        self.collection = self.db['maintenance_controls']
    
    def check_billing_status(self):
        """Check if any clients have overdue billing dates"""
        today = datetime.now()
        
        # Find clients with nextBillingDate in the past and status != 'due'
        query = {
            'nextBillingDate': {'$lt': today},
            'status': {'$ne': 'due'},
            'isActive': True
        }
        
        result = self.collection.update_many(
            query,
            {
                '$set': {
                    'status': 'due',
                    'showReminder': True,
                    'updatedAt': datetime.now()
                }
            }
        )
        
        return result.modified_count
    
    def log_action(self, action, details):
        """Log actions to a log collection"""
        log_entry = {
            'timestamp': datetime.now(),
            'action': action,
            'details': details
        }
        self.db['automation_logs'].insert_one(log_entry)
        print(f"[{datetime.now().isoformat()}] {action}: {details}")
    
    def run(self):
        """Run the billing check"""
        try:
            print(f"\n{'='*60}")
            print(f"Billing Status Check - {datetime.now().isoformat()}")
            print(f"{'='*60}\n")
            
            modified_count = self.check_billing_status()
            
            if modified_count > 0:
                self.log_action(
                    'BILLING_CHECK',
                    f'Marked {modified_count} client(s) as due'
                )
                print(f"✓ Successfully marked {modified_count} client(s) as due for payment")
            else:
                self.log_action(
                    'BILLING_CHECK',
                    'No clients marked as due'
                )
                print("✓ No overdue clients found")
            
            # Print summary
            total_clients = self.collection.count_documents({'isActive': True})
            active_clients = self.collection.count_documents({
                'isActive': True,
                'status': 'active'
            })
            due_clients = self.collection.count_documents({
                'isActive': True,
                'status': 'due'
            })
            suspended_clients = self.collection.count_documents({
                'isActive': True,
                'status': 'suspended'
            })
            
            print(f"\nSummary:")
            print(f"  Total Clients: {total_clients}")
            print(f"  Active: {active_clients}")
            print(f"  Due: {due_clients}")
            print(f"  Suspended: {suspended_clients}")
            
            print(f"\n{'='*60}\n")
            
        except Exception as e:
            self.log_action('BILLING_CHECK_ERROR', str(e))
            print(f"✗ Error: {str(e)}")
            raise
        finally:
            self.client.close()


def main():
    """Main entry point"""
    try:
        checker = BillingChecker()
        checker.run()
    except Exception as e:
        print(f"Fatal Error: {str(e)}")
        sys.exit(1)


if __name__ == '__main__':
    main()
