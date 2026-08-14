# PostHog Integration Plan

The goal is to update the PostHog integration with the provided token and ensure it covers Web Analytics, Product Analytics, and Session Replay as requested.

## Proposed Changes

### Configuration Update
- Update `config/globalconf.json` with the new PostHog API key: `phc_tqmKxGXtW8NJZQsZkUR7nC3XCNbuHEwtAtpSvoR3uroi`.

### Analytics Service Enhancements
- Update `src/lib/analytics/posthog.ts` to:
  - Enable `autocapture: true` to match the standard PostHog setup.
  - Enable `capture_pageview: true` (or handle it via the router if preferred, but usually PostHog's built-in handling is robust enough for simple SPAs if initialized correctly). Actually, for TanStack Router, we'll keep manual pageview tracking or use a listener in the provider.
  - Ensure session recording is fully active.

### Root Component Integration
- Add a `PostHogProvider` component to `src/routes/__root.tsx` that:
  - Initializes the service on the client.
  - Tracks page views on route changes using TanStack Router's `useRouter` or `useEffect` on the path.

### Verification
- Check that `trackCollectionViewed` and `trackProductViewed` are being called correctly in their respective routes.

## Technical Details

### `config/globalconf.json`
```json
"posthog": {
  "enabled": true,
  "apiKey": "phc_tqmKxGXtW8NJZQsZkUR7nC3XCNbuHEwtAtpSvoR3uroi",
  "apiHost": "https://us.i.posthog.com"
}
```

### `src/routes/__root.tsx`
- Import `posthogService`.
- Use a `useEffect` inside `RootComponent` to track page views whenever the location changes.
