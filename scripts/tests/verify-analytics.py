import asyncio
import os
import json
import sys
from pathlib import Path
from playwright.async_api import async_playwright

# Configuration for verification
BASE_URL = "http://localhost:8080"
PAGES_TO_TEST = [
    {"name": "home", "url": "/"},
    {"name": "collection", "url": "/collections/all-products"},
    {"name": "product", "url": "/product/philodendron-birkin"},
]

async def verify_page_analytics(browser, page_info):
    context = await browser.new_context(viewport={"width": 1280, "height": 1800})
    page = await context.new_page()
    
    # Store requests to verify later
    posthog_requests = []
    monorail_requests = []
    meta_requests = []
    
    def handle_request(request):
        url = request.url
        if "posthog.com" in url:
            posthog_requests.append(url)
        elif "monorail-edge.shopifysvc.com" in url:
            monorail_requests.append(url)
        elif "facebook.com/tr" in url:
            meta_requests.append(url)

    page.on("request", handle_request)
    
    print(f"Testing {page_info['name']} at {page_info['url']}...")
    try:
        await page.goto(f"{BASE_URL}{page_info['url']}", wait_until="networkidle", timeout=30000)
        # Wait extra time for PostHog's async init and session recording to kick in
        await asyncio.sleep(5)
        
        results = {
            "page": page_info['name'],
            "posthog": len(posthog_requests) > 0,
            "monorail": len(monorail_requests) > 0,
            "meta": len(meta_requests) > 0,
            "status": "PASS" if len(posthog_requests) > 0 else "FAIL"
        }
        
        # Test Cart Event if on Product page
        if page_info['name'] == "product":
            print("  Testing Add to Cart event...")
            add_button = page.get_by_role("button", name="Add to basket", exact=False).first
            if await add_button.count() > 0:
                await add_button.click()
                await asyncio.sleep(3)
                results["add_to_cart_fired"] = any("add_to_cart" in r or "product_added_to_cart" in r for r in posthog_requests)
    except Exception as e:
        print(f"  Error testing {page_info['name']}: {e}")
        results = {"page": page_info['name'], "status": "ERROR", "error": str(e)}

    await context.close()
    return results

async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        
        all_results = []
        for page_info in PAGES_TO_TEST:
            res = await verify_page_analytics(browser, page_info)
            all_results.append(res)
            print(f"  Result: {res['status']} (PostHog: {res.get('posthog')}, Monorail: {res.get('monorail')})")
        
        await browser.close()
        
        # Summary
        failed = [r for r in all_results if r['status'] != "PASS"]
        if failed:
            print("\nAnalytics verification FAILED for some pages.")
            sys.exit(1)
        else:
            print("\nAnalytics verification PASSED for all pages.")

if __name__ == "__main__":
    asyncio.run(main())
