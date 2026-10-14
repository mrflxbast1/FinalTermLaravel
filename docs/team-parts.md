# Three project responsibilities

Stockroom is one Laravel and React application. The repository has three areas of responsibility so a three-person team can divide implementation, review, and presentation work without splitting the application into separate deployments.

Project owner: **Basty Mirafelix**. Assign names to the areas below when the team has agreed on responsibilities. This map describes the code; it is not a claim about who wrote each file.

## 1. Backend

**Responsibility:** inventory data, business rules, database relationships, validation, and dashboard calculations.

| Files | Purpose |
| --- | --- |
| `app/Models/Product.php`, `ProductCategory.php` | Product/category fields, relationships, casts, and stock status |
| `app/Http/Controllers/ProductController.php` | Product CRUD, validation, search, filters, and pagination |
| `app/Http/Controllers/ProductCategoryController.php` | Category CRUD and product relationships |
| `app/Http/Controllers/DashboardController.php` | Inventory totals, low-stock data, and category breakdown |
| `database/migrations/2026_10_14_160000_create_inventory_tables.php` | Inventory tables and foreign key constraints |
| `database/seeders/DemoDataSeeder.php` | Sample inventory and first-install demo data |
| `routes/products.php`, `routes/product-categories.php`, `routes/web.php` | Inventory and dashboard routes |
| `tests/Feature/InventoryTest.php`, `DashboardTest.php`, `SeedingTest.php` | Data behavior and safe seeding checks |

**Suggested demonstration:** add a category, create and edit a product, filter low stock, explain validation, and show how the dashboard changes with real database values.

## 2. Frontend

**Responsibility:** page layouts, forms, tables, navigation, visual design, responsive behavior, and restrained animation.

| Files | Purpose |
| --- | --- |
| `resources/js/app.jsx` | React/Inertia entry point and page resolution |
| `resources/js/Layouts/` | Application and authentication layouts |
| `resources/js/Pages/Dashboard/`, `Products/`, `Categories/` | Inventory screens and forms |
| `resources/js/Components/` | Buttons, fields, table, dialogs, illustrations, and effects |
| `resources/css/app.css`, `workspace.css` | Base layout, visual theme, mobile styles, and motion |
| `resources/views/app.blade.php` | Blade shell connecting Laravel, Inertia, and Vite |
| `vite.config.js`, `package.json` | Frontend build configuration |

**Suggested demonstration:** navigate the app, use search and filters, show form errors, demonstrate a narrow screen, and explain that React receives real backend data through Inertia.

## 3. Authentication and access control

**Responsibility:** user accounts, login/logout, password resets, roles, permissions, and server-side enforcement.

| Files | Purpose |
| --- | --- |
| `app/Models/User.php` | User fields, password hashing, and Spatie roles |
| `app/Actions/Fortify/` | Registration validation and password reset actions |
| `app/Providers/FortifyServiceProvider.php` | Authentication views and login throttling |
| `config/fortify.php`, `config/permission.php` | Fortify and Spatie configuration |
| `database/seeders/RolesAndPermissionsSeeder.php` | Admin, Manager, and User permissions |
| `app/Http/Controllers/TeamController.php`, `routes/team.php` | Admin-only role changes and self/last-admin protection |
| `app/Http/Middleware/HandleInertiaRequests.php` | Shares the signed-in user and permissions with React |
| `bootstrap/app.php` | Registers authentication/permission middleware aliases |
| `resources/js/Pages/Auth/`, `resources/js/Pages/Team/` | Authentication and team-management screens |
| `tests/Feature/AuthenticationTest.php`, `PermissionsTest.php`, `TeamTest.php` | Authentication and authorization tests |

**Suggested demonstration:** register a User account, log in as each demo role, show role-specific controls, try a restricted URL, and use Admin to change another user's role.

## Working together on GitHub

Use one repository named `FinalTermLaravel`, with one main branch containing the complete working project. Assign a team member to each of the three areas above. Add their names to the responsibility table once the team has agreed on assignments.

| Part | Assigned member |
| --- | --- |
| Backend | To be assigned by the team |
| Frontend | To be assigned by the team |
| Auth & access control | To be assigned by the team |

Members can create branches such as `backend`, `frontend`, and `auth-access` for their actual changes, then open pull requests into main. Each branch contains the complete application so everyone can run and test their work.

Some files cross boundaries: inventory controllers enforce permissions, auth screens share frontend components, and demo seeding creates users. Agree on changes to these shared files and review them together. Moving Laravel's files into arbitrary top-level folders would break framework conventions, so this guide maps the existing folders instead.

Every member should be able to explain the complete request flow: browser → route/middleware → controller → model/database → Inertia → React. Run the full test suite before merging changes.
