import requests
import sys
from datetime import datetime, timedelta
import json

class RackRollAPITester:
    def __init__(self, base_url="https://optimize-tools.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_menu_endpoints(self):
        """Test menu-related endpoints"""
        print("\n📋 Testing Menu Endpoints...")
        
        # Test get menu
        success, menu_data = self.run_test("Get Menu", "GET", "menu", 200)
        if success and menu_data:
            print(f"   Found {len(menu_data)} menu items")
            # Check if prices are in INR (should be > 50 for INR vs USD)
            if menu_data and len(menu_data) > 0:
                sample_price = menu_data[0].get('price', 0)
                if sample_price > 50:
                    print(f"✅ Menu prices appear to be in INR (sample: ₹{sample_price})")
                else:
                    print(f"⚠️  Menu prices might still be in USD (sample: ${sample_price})")
        
        # Test get categories
        success, cat_data = self.run_test("Get Menu Categories", "GET", "menu/categories", 200)
        if success and cat_data:
            categories = cat_data.get('categories', [])
            print(f"   Found categories: {categories}")
        
        return success

    def test_trash_talk_removed(self):
        """Test that trash talk endpoint is removed"""
        print("\n🗑️ Testing Trash Talk Removal...")
        success, _ = self.run_test("Trash Talk Endpoint (should 404)", "POST", "ai/trashtalk", 404, 
                                 data={"text": "test"})
        if success:
            print("✅ Trash talk endpoint properly removed (404 as expected)")
        return success

    def test_ai_planner(self):
        """Test AI visit planner endpoint"""
        print("\n🤖 Testing AI Visit Planner...")
        test_data = {
            "group": "Flying solo",
            "vibe": "Chill and relaxed"
        }
        success, response = self.run_test("AI Visit Planner", "POST", "ai/plan", 200, data=test_data)
        if success and response:
            if 'text' in response and response['text']:
                print(f"✅ AI planner returned response: {response['text'][:100]}...")
            else:
                print("⚠️  AI planner response missing 'text' field")
        return success

    def test_booking_availability(self):
        """Test booking availability endpoint"""
        print("\n📅 Testing Booking Availability...")
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        
        success, response = self.run_test("Get Availability", "GET", "bookings/availability", 200, 
                                        params={"date": tomorrow})
        if success and response:
            if 'all_slots' in response and 'slots' in response:
                print(f"✅ Found {len(response['all_slots'])} time slots")
                if response['slots']:
                    sample_slot = response['slots'][0]
                    activities = sample_slot.get('available', {})
                    print(f"   Sample availability: {activities}")
            else:
                print("⚠️  Availability response missing expected fields")
        return success

    def test_multi_activity_booking(self):
        """Test multi-activity booking functionality"""
        print("\n🎯 Testing Multi-Activity Booking...")
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        
        booking_data = {
            "name": "Test User",
            "phone": "9260940347",
            "email": "test@example.com",
            "date": tomorrow,
            "time_slot": "2:00 PM - 3:00 PM",
            "activities": [
                {"activity": "Snooker", "quantity": 1},
                {"activity": "PS5", "quantity": 1}
            ],
            "group_size": 3,
            "notes": "Test booking with multiple activities"
        }
        
        success, response = self.run_test("Create Multi-Activity Booking", "POST", "bookings", 201, 
                                        data=booking_data)
        if success and response:
            if 'activities' in response and len(response['activities']) == 2:
                print("✅ Multi-activity booking created successfully")
                activities_str = [f"{a['activity']} x{a['quantity']}" for a in response['activities']]
                print(f"   Activities: {activities_str}")
                return True, response.get('id')
            else:
                print("⚠️  Booking response missing activities or incorrect format")
        return False, None

    def test_booking_validation(self):
        """Test booking validation (no activities)"""
        print("\n⚠️  Testing Booking Validation...")
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        
        invalid_booking = {
            "name": "Test User",
            "phone": "9260940347",
            "date": tomorrow,
            "time_slot": "3:00 PM - 4:00 PM",
            "activities": [],  # Empty activities should fail
            "group_size": 2
        }
        
        success, _ = self.run_test("Invalid Booking (no activities)", "POST", "bookings", 400, 
                                 data=invalid_booking)
        if success:
            print("✅ Booking validation working (rejected empty activities)")
        return success

    def test_get_bookings(self):
        """Test get all bookings endpoint"""
        print("\n📋 Testing Get All Bookings...")
        success, response = self.run_test("Get All Bookings", "GET", "bookings", 200)
        if success and isinstance(response, list):
            print(f"✅ Retrieved {len(response)} bookings")
        return success

def main():
    print("🚀 Starting Rack&Roll Cafe API Tests...")
    print("=" * 60)
    
    tester = RackRollAPITester()
    
    # Run all tests
    tests = [
        tester.test_root_endpoint,
        tester.test_menu_endpoints,
        tester.test_trash_talk_removed,
        tester.test_ai_planner,
        tester.test_booking_availability,
        tester.test_multi_activity_booking,
        tester.test_booking_validation,
        tester.test_get_bookings
    ]
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            tester.failed_tests.append({"test": test.__name__, "error": str(e)})
    
    # Print summary
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.failed_tests:
        print("\n❌ Failed Tests:")
        for failure in tester.failed_tests:
            print(f"   - {failure.get('test', 'Unknown')}: {failure.get('error', failure.get('response', 'Unknown error'))}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())