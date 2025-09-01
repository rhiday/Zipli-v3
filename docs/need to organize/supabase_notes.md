# Supabase Notes & Learnings

This file tracks specific issues encountered and lessons learned while working with Supabase for the Zipli project.

## RLS Debugging (May 2025)

**Issue:** Receiver feed (`/feed`) was empty despite available donations existing in the database.

**Root Cause:** Row-Level Security (RLS) policies on the `profiles` table prevented the necessary `INNER JOIN` from succeeding. The receiver user needed `SELECT` permission on the _donor's_ profile row to fetch donor details (like `organization_name`, `address`), but the existing RLS only allowed users to select their _own_ profile.

**Key Takeaways:**

1.  **Suspect RLS First:** When data exists in tables but doesn't appear in the UI for a specific role, RLS is the primary suspect.
2.  **Check RLS on _All_ Joined Tables:** RLS applies to every table in a query, including those brought in via `JOIN`. The user needs sufficient `SELECT` permissions on the relevant rows of _all_ joined tables.
3.  **`INNER JOIN` + RLS = Strict Filtering:** An `INNER JOIN` will filter out the entire result row if the user lacks permission to select the corresponding row in the _joined_ table. Consider `LEFT JOIN` if the joined data is optional and you still want the main row.
4.  **Broad `SELECT` Policies for Read-Heavy Views:** Views that aggregate data across different users (like a public feed) often require broader `SELECT` policies (e.g., `TO authenticated USING (true)`) on related tables (like `profiles`). Ensure `UPDATE`/`DELETE`/`INSERT` policies remain appropriately restrictive.
5.  **Test with `SET ROLE`:** Use the Supabase SQL Editor with `SET ROLE authenticated;` or `SET ROLE specific_role;` before running your application's queries to directly test how RLS affects data visibility for different roles.

**Resolution:** Added a broad `SELECT` policy on `profiles` for `authenticated` users, while ensuring `UPDATE` policies remained restricted to the user themselves (`auth.uid() = id`).
