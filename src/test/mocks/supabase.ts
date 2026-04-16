import { vi } from "vitest";

/* ──────────────────────────────────────────────
 * Chainable Supabase Query Builder Mock
 *
 * Usage in tests:
 *   const { mockSupabase } = createMockSupabase();
 *   mockSupabase.from("recipes").select.mockReturnValue(...)
 * ──────────────────────────────────────────────*/

type MockReturn = { data: unknown; error: unknown };

function createQueryBuilder() {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {};

  // Terminal methods (return data)
  builder.single = vi.fn(() => Promise.resolve({ data: null, error: null }));
  builder.maybeSingle = vi.fn(() =>
    Promise.resolve({ data: null, error: null }),
  );

  // Chainable methods – each returns the builder for chaining
  const chainableMethods = [
    "select",
    "insert",
    "update",
    "delete",
    "upsert",
    "eq",
    "neq",
    "gt",
    "gte",
    "lt",
    "lte",
    "like",
    "ilike",
    "in",
    "is",
    "order",
    "limit",
    "range",
    "match",
    "filter",
  ];

  for (const method of chainableMethods) {
    builder[method] = vi.fn(() => builder);
  }

  // Make terminal methods also return builder for chaining when not last
  builder.single = vi.fn(() => Promise.resolve({ data: null, error: null }));

  return builder;
}

export function createMockSupabase() {
  const queryBuilders: Record<string, ReturnType<typeof createQueryBuilder>> =
    {};

  const mockSupabase = {
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: null }, error: null }),
      ),
      signUp: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      signInWithPassword: vi.fn(() =>
        Promise.resolve({ data: {}, error: null }),
      ),
      signInWithOtp: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      signInWithOAuth: vi.fn(() =>
        Promise.resolve({ data: { url: null }, error: null }),
      ),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      updateUser: vi.fn(() => Promise.resolve({ data: {}, error: null })),
    },
    from: vi.fn((table: string) => {
      if (!queryBuilders[table]) {
        queryBuilders[table] = createQueryBuilder();
      }
      return queryBuilders[table];
    }),
    // Access query builders directly for assertions
    _queryBuilders: queryBuilders,
  };

  return { mockSupabase, queryBuilders };
}

/**
 * Helper: Configure mockSupabase.auth.getUser to return an authenticated user
 */
export function mockAuthenticatedUser(
  mockSupabase: ReturnType<typeof createMockSupabase>["mockSupabase"],
  user = {
    id: "test-user-id",
    email: "test@example.com",
    user_metadata: { full_name: "Test User" },
  },
) {
  mockSupabase.auth.getUser.mockResolvedValue({
    data: { user },
    error: null,
  });
  return user;
}

/**
 * Helper: Configure a from() query to return specific data
 */
export function mockQueryResult(
  builder: ReturnType<typeof createQueryBuilder>,
  result: MockReturn,
) {
  builder.single.mockResolvedValue(result);
  // Also make the builder itself resolve for non-.single() calls
  const promise = Promise.resolve(result);
  Object.assign(builder, { then: promise.then.bind(promise) });
}
