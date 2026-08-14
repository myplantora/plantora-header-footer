import asyncio
import os
import json
import sys
from pathlib import Path
from playwright.async_api import async_playwright

# Configuration for verification
BASE_URL = "http://localhost:8080"
TEST_PRODUCT = "/product/philodendron-birkin"

async def verify_conversion_funnel(browser):
    context = await browser.new_context(viewport={"width": 1280, "height": 1800})
    page = await context.new_page()
    
    events = []
    
    def handle_request(request):
        url = request.url
        if "posthog.com" in url or "monorail-edge.shopifysvc.com" in url or "facebook.com/tr" in url:
            try:
                # Try to extract event info from post data if available
                post_data = request.post_data
                events.append({"url": url, "method": request.method, "data": post_data})
            except:
                events.append({"url": url, "method": request.method})

    page.on("request", handle_request)
    
    print(f"Starting Conversion Funnel Test at {TEST_PRODUCT}...")
    
    try:
        # 1. ADD TO CART
        await page.goto(f"{BASE_URL}{TEST_PRODUCT}", wait_until="networkidle")
        add_button = page.get_by_role("button", name="Add to basket", exact=False).first
        await add_button.click()
        await asyncio.sleep(3) # Wait for success and side effects
        
        atc_events = [e for e in events if "add_to_cart" in str(e).lower() or "product_added_to_cart" in str(e).lower()]
        print(f"  [ATC] Events captured: {len(atc_events)}")
        
        # 2. BEGIN CHECKOUT
        checkout_button = page.get_by_role("button", name="Secure Checkout", exact=False).first
        if await checkout_button.count() == 0:
            # Try finding by text if role fails
            checkout_button = page.get_by_text("Secure Checkout").first
            
        await checkout_button.click()
        await asyncio.sleep(3)
        
        checkout_events = [e for e in events if "begin_checkout" in str(e).lower() or "initiatecheckout" in str(e).lower()]
        print(f"  [CHECKOUT] Events captured: {len(checkout_events)}")
        
        # Check properties (simplified check for presence)
        all_passed = len(atc_events) > 0 and len(checkout_events) > 0
        
        if all_passed:
            # Check for duplicates (should fire once per step)
            # We filter by service to ensure we don't count cross-service fires as duplicates
            ph_atc = [e for e in atc_events if "posthog" in e['url']]
            if len(ph_atc) > 1:
                print("  [WARNING] Multiple PostHog ATC events detected")
            
            print("\nConversion Funnel Verification: PASSED")
            return True
        else:
            print("\nConversion Funnel Verification: FAILED")
            return False

    except Exception as e:
        print(f"  Error during funnel test: {e}")
        return False
    finally:
        await context.close()

async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        success = await verify_conversion_funnel(browser)
        await browser.close()
        if not success:
            sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
