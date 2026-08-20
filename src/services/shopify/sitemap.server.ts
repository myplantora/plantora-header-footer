import { storefrontFetch, STOREFRONT_CONTEXT } from "../../lib/shopify";

export async function getAllProductHandles(): Promise<string[]> {
  let allHandles: string[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const data = await storefrontFetch<any>(`
      query GetProductHandles($first: Int!, $after: String) ${STOREFRONT_CONTEXT} {
        products(first: $first, after: $after) {
          pageInfo { hasNextPage endCursor }
          edges { node { handle } }
        }
      }
    `, {
      first: 250,
      after: cursor
    });

    const products = data?.products;
    if (!products) break;

    allHandles = allHandles.concat(products.edges.map((e: any) => e.node.handle));
    hasNextPage = products.pageInfo.hasNextPage;
    cursor = products.pageInfo.endCursor;
  }

  return allHandles;
}

export async function getAllCollectionHandles(): Promise<string[]> {
  let allHandles: string[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const data = await storefrontFetch<any>(`
      query GetCollectionHandles($first: Int!, $after: String) ${STOREFRONT_CONTEXT} {
        collections(first: $first, after: $after) {
          pageInfo { hasNextPage endCursor }
          edges { node { handle } }
        }
      }
    `, {
      first: 250,
      after: cursor
    });

    const collections = data?.collections;
    if (!collections) break;

    allHandles = allHandles.concat(collections.edges.map((e: any) => e.node.handle));
    hasNextPage = collections.pageInfo.hasNextPage;
    cursor = collections.pageInfo.endCursor;
  }

  return allHandles;
}

