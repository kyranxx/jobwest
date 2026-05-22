import type { Database, Tables } from "../lib/database.types"

type Expect<T extends true> = T
type IsNever<T> = [T] extends [never] ? true : false
type HasKey<T, K extends PropertyKey> = K extends keyof T ? true : false
type IsNullable<T> = null extends T ? true : false

type PublicTables = keyof Database["public"]["Tables"]
type UsersRow = Tables<"users">
type JobsRow = Tables<"jobs">

type _NoLegacyAuthTables = Expect<
  IsNever<Extract<PublicTables, "accounts" | "sessions" | "verification_tokens">>
>

type _UsersHasCreatedAt = Expect<HasKey<UsersRow, "created_at">>
type _UsersHasUpdatedAt = Expect<HasKey<UsersRow, "updated_at">>
type _UsersDoesNotExposeNextAuthEmailVerified = Expect<
  IsNever<Extract<keyof UsersRow, "emailVerified">>
>
type _UsersRoleIsNotNullable = Expect<IsNullable<UsersRow["role"]> extends false ? true : false>

type _JobsHasUpdatedAt = Expect<HasKey<JobsRow, "updated_at">>
type _JobsHighlightTierIsNotNullable = Expect<
  IsNullable<JobsRow["highlight_tier"]> extends false ? true : false
>
type _JobsPortalCodeIsNotNullable = Expect<
  IsNullable<JobsRow["portal_code"]> extends false ? true : false
>
type _JobsPortalDomainIsNotNullable = Expect<
  IsNullable<JobsRow["portal_domain"]> extends false ? true : false
>
