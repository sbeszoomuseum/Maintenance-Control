"""
Analytics and Report Generation Script
Generates daily/weekly/monthly reports on subscription and revenue

Usage:
    python automation/scripts/analytics_report.py [--period daily|weekly|monthly]
    
Environment Variables:
    MONGODB_URI - MongoDB Atlas connection string
"""

import os
import sys
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from pymongo import MongoClient
except ImportError:
    print("Error: pymongo not installed. Install with: pip install pymongo python-dotenv")
    sys.exit(1)


class AnalyticsGenerator:
    def __init__(self):
        """Initialize MongoDB connection"""
        self.mongo_uri = os.getenv('MONGODB_URI')
        if not self.mongo_uri:
            raise ValueError("MONGODB_URI environment variable not set")
        
        self.client = MongoClient(self.mongo_uri)
        self.db = self.client.get_database()
        self.collection = self.db['maintenance_controls']
    
    def get_status_summary(self):
        """Get count of clients by status"""
        pipeline = [
            {'$match': {'isActive': True}},
            {
                '$group': {
                    '_id': '$status',
                    'count': {'$sum': 1}
                }
            }
        ]
        
        results = {}
        for doc in self.collection.aggregate(pipeline):
            results[doc['_id']] = doc['count']
        
        return {
            'active': results.get('active', 0),
            'due': results.get('due', 0),
            'suspended': results.get('suspended', 0)
        }
    
    def get_revenue_summary(self, days=None):
        """Get revenue data for given period"""
        pipeline = [
            {'$match': {'isActive': True}},
            {'$unwind': '$billingHistory'}
        ]
        
        if days:
            cutoff_date = datetime.now() - timedelta(days=days)
            pipeline.append({
                '$match': {'billingHistory.paymentDate': {'$gte': cutoff_date}}
            })
        
        pipeline.extend([
            {
                '$group': {
                    '_id': '$billingHistory.plan',
                    'totalAmount': {'$sum': '$billingHistory.amount'},
                    'count': {'$sum': 1},
                    'avgAmount': {'$avg': '$billingHistory.amount'}
                }
            },
            {'$sort': {'totalAmount': -1}}
        ])
        
        return list(self.collection.aggregate(pipeline))
    
    def get_plan_distribution(self):
        """Get distribution of clients by plan"""
        pipeline = [
            {'$match': {'isActive': True}},
            {
                '$group': {
                    '_id': '$plan',
                    'count': {'$sum': 1}
                }
            }
        ]
        
        results = {}
        for doc in self.collection.aggregate(pipeline):
            results[doc['_id']] = doc['count']
        
        return results
    
    def generate_report(self, period='daily'):
        """Generate comprehensive report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'period': period,
            'summary': {},
            'details': {}
        }
        
        # Status summary
        report['summary']['status'] = self.get_status_summary()
        
        # Plan distribution
        report['summary']['plans'] = self.get_plan_distribution()
        
        # Total clients
        total = self.collection.count_documents({'isActive': True})
        report['summary']['total_clients'] = total
        
        # Health percentage
        active = report['summary']['status'].get('active', 0)
        report['summary']['health_percentage'] = round((active / total * 100)) if total > 0 else 0
        
        # Revenue based on period
        if period == 'daily':
            days = 1
        elif period == 'weekly':
            days = 7
        else:  # monthly
            days = 30
        
        revenue_data = self.get_revenue_summary(days=days)
        report['details']['revenue'] = revenue_data
        
        total_revenue = sum(item['totalAmount'] for item in revenue_data)
        report['summary']['revenue'] = {
            'period_days': days,
            'total': total_revenue,
            'by_plan': {item['_id']: item['totalAmount'] for item in revenue_data}
        }
        
        return report
    
    def save_report(self, report):
        """Save report to database"""
        self.db['analytics_reports'].insert_one(report)
        return report
    
    def print_report(self, report):
        """Pretty print the report"""
        print(f"\n{'='*70}")
        print(f"Analytics Report - {report['period'].upper()}")
        print(f"Generated: {report['timestamp']}")
        print(f"{'='*70}\n")
        
        print("SUMMARY:")
        print(f"  Total Clients: {report['summary']['total_clients']}")
        print(f"  System Health: {report['summary']['health_percentage']}%")
        
        print("\nClient Status Distribution:")
        for status, count in report['summary']['status'].items():
            print(f"  {status.capitalize()}: {count}")
        
        print("\nSubscription Plans:")
        for plan, count in report['summary']['plans'].items():
            print(f"  {plan.capitalize()}: {count}")
        
        print("\nRevenue:")
        revenue = report['summary']['revenue']
        print(f"  Period: Last {revenue['period_days']} day(s)")
        print(f"  Total: ${revenue['total']:.2f}")
        print(f"  By Plan:")
        for plan, amount in revenue['by_plan'].items():
            print(f"    {plan.capitalize()}: ${amount:.2f}")
        
        print(f"\n{'='*70}\n")


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate analytics reports')
    parser.add_argument('--period', choices=['daily', 'weekly', 'monthly'], default='daily',
                       help='Report period (default: daily)')
    
    args = parser.parse_args()
    
    try:
        generator = AnalyticsGenerator()
        report = generator.generate_report(period=args.period)
        generator.save_report(report)
        generator.print_report(report)
        print("✓ Report saved successfully")
    except Exception as e:
        print(f"✗ Error generating report: {str(e)}")
        sys.exit(1)
    finally:
        generator.client.close()


if __name__ == '__main__':
    main()
