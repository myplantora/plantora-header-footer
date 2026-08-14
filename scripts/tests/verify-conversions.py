import asyncio
import os
import json
import sys
from pathlib import Path
from playwright.async_api import async_playwright

# Configuration for verification
BASE_URL = "http://localhost:8080"
# Using a likely product handle based on previous messages
TEST_PRODUCT = "/product/philodendron-birkin"

async def verify_conversion_funnel(browser):
    context = await browser.new_context(viewport={"width": 1280, "height": 1800})
    page = await context.new_page()
    
    events = []
    
    def handle_request(request):
        url = request.url
        # Capture all analytics requests for debugging
        if any(domain in url for domain in ["posthog.com", "monorail-edge.shopifysvc.com", "facebook.com/tr"]):
            try:
                post_data = request.post_data
                events.append({"url": url, "method": request.method, "data": post_data})
            except:
                events.append({"url": url, "method": request.method})

    page.on("request", handle_request)
    
    print(f"Starting Conversion Funnel Test at {TEST_PRODUCT}...")
    
    try:
        # Navigate to product page
        response = await page.goto(f"{BASE_URL}{TEST_PRODUCT}", wait_until="networkidle")
        if response.status != 200:
            print(f"  [ERROR] Product page returned {response.status}. Checking collection instead.")
            await page.goto(f"{BASE_URL}/collections/all-products", wait_until="networkidle")
            # Click first product link
            await page.locator("a[href*='/product/']").first.click()
            await page.wait_for_load_state("networkidle")

        # 1. ADD TO CART
        print("  Looking for Add to Basket button...")
        # Use a more generic selector to find the button
        atc_button = page.locator("button:has-text('Add to basket')").first
        if await atc_button.count() == 0:
             atc_button = page.locator("button:has-text('Add to Basket')").first
             
        await atc_button.click()
        print("  Clicked Add to Basket.")
        await asyncio.sleep(4) # Wait for cart success and drawer
        
        atc_events = [e for e in events if "add_to_cart" in str(e).lower() or "product_added_to_cart" in str(e).lower()]
        print(f"  [ATC] Events captured: {len(atc_events)}")
        
        # 2. BEGIN CHECKOUT
        print("  Looking for Secure Checkout button...")
        checkout_button = page.locator("button:has-text('Secure Checkout')").first
        if await checkout_button.count() == 0:
            # Maybe it's a link or button with different case
            checkout_button = page.locator("a:has-text('Secure Checkout')").first
            
        await checkout_button.click()
        print("  Clicked Secure Checkout.")
        await asyncio.sleep(4)
        
        checkout_events = [e for e in events if "begin_checkout" in str(e).lower() or "initiatecheckout" in str(e).lower()]
        print(f"  [CHECKOUT] Events captured: {len(checkout_events)}")
        
        # Validation
        success = True
        if len(atc_events) == 0:
            print("  [FAIL] No Add to Cart events captured.")
            success = False
        if len(checkout_events) == 0:
            print("  [FAIL] No Begin Checkout events captured.")
            success = False
            
        # Check for properties in the first PostHog ATC event
        ph_atc = next((e for e in atc_events if "posthog" in e['url']), None)
        if ph_atc and ph_atc.get('data'):
            data = json.loads(ph_atc['data'])
            props = data.get('properties', {})
            required = ['price', 'currency', 'quantity']
            missing = [p for p in required if p not in props]
            if missing:
                print(f"  [FAIL] PostHog ATC missing properties: {missing}")
                success = False
            else:
                print(f"  [PASS] PostHog ATC properties verified.")

        if success:
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
