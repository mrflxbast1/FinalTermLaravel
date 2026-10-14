# Assignment-to-code map

The application is titled Stockroom in the interface. Its coursework/project identity is FinalTermLaravel.

| Assignment requirement | Implementation |
| --- | --- |
| Laravel MVC | Eloquent models in `app/Models`, resource controllers in `app/Http/Controllers`, React views in `resources/js/Pages` |
| Normalized category/product tables | `database/migrations/2026_10_14_160000_create_inventory_tables.php` |
| Foreign key with cascading deletion | `products.product_category_id` references `product_categories.id` with `cascadeOnDelete()` |
| Timestamps | Both table definitions use `timestamps()` |
| Fillable properties | Explicit `$fillable` on ProductCategory, Product and User |
| Eloquent relationships | ProductCategory::products() is hasMany; Product::category() is belongsTo |
| Seven resource methods | ProductController and ProductCategoryController each implement index/create/store/show/edit/update/destroy |
| Request validation | Controller `$request->validate()` rules constrain IDs, unique SKU/name, prices, quantities, filters and role names |
| Modular route files | `routes/web.php` loads `routes/products.php`, `product-categories.php` and `team.php`; named routes and auth/permission groups |
| React JSX and Vite | `resources/js/app.jsx`, `vite.config.js`, page and shared component directories |
| Inertia integration | `createInertiaApp`, `resolvePageComponent`, server `Inertia::render`, and registered HandleInertiaRequests middleware |
| Blade entry directives | `resources/views/app.blade.php`: @viteReactRefresh, @vite, @inertiaHead, @inertia |
| Fortify auth | FortifyServiceProvider, Fortify actions, `config/fortify.php`, and custom Auth JSX screens |
| Register/login/password reset | Fortify endpoints with validation, throttled login, hashed passwords, single-use reset tokens, local log mailer |
| Spatie roles and permissions | User uses HasRoles; published permission migration and config; RolesAndPermissionsSeeder |
| Admin/Manager/User | Seeder declares explicit permission matrix; new registrations can only receive User |
| Protected requests | Auth middleware, permission middleware per resource action, Admin/permission guard on team routes |
| Conditional UI | Shared Inertia permissions determine visible create/edit/delete/team actions |
| Code quality | Shared forms/components, server validation, lockfiles, PHP/JS format checks, feature tests, setup documentation |

## Role matrix

| Action | Admin | Manager | User |
| --- | :---: | :---: | :---: |
| View inventory/dashboard | Yes | Yes | Yes |
| Create/edit/delete products | Yes | Yes | No |
| Create/edit categories | Yes | Yes | No |
| Delete categories and their products | Yes | No | No |
| View team and assign roles | Yes | No | No |

Hiding buttons is a convenience; the backend rejects unauthorized requests independently. Registration input cannot grant Admin access. Team updates validate role names and prevent self-demotion.

## Data behavior

A category contains many products; a product belongs to one category. Deleting a category cascades to its products and requires a confirmation showing the number affected. Low-stock alerts include active products with quantity at or below their threshold, including zero. Inventory value is the current unit price multiplied by quantity, not revenue.

## Verification

Feature tests live in `tests/Feature`. Run the commands in README.md. Setup has also been exercised in an isolated Windows folder containing spaces, without existing dependencies, environment, database, or built assets. Repeat-setup preservation and failure handling are checked separately from the Laravel test suite.
