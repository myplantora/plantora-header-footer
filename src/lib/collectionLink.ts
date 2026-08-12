/**
 * Some collections have a dedicated static route file. Linking to them via the
 * dynamic "/collections/$handle" template resolves to the same URL and triggers
 * a router warning, so map those handles to their static route instead.
 */
const STATIC_COLLECTION_ROUTES = {
  "big-savings-combos": "/collections/big-savings-combos",
} as const;

type StaticHandle = keyof typeof STATIC_COLLECTION_ROUTES;

export function collectionLinkProps(handle: string) {
  if (handle in STATIC_COLLECTION_ROUTES) {
    return { to: STATIC_COLLECTION_ROUTES[handle as StaticHandle] } as const;
  }
  return { to: "/collections/$handle", params: { handle } } as const;
}
