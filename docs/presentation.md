# Presentation guide

## A five-minute demonstration

1. **Login as Admin.** Explain that this is a local application accessed in a browser. Laravel serves it; SQLite stores its data. GitHub contains the source.
2. **Overview.** Point out the actual product count, stock units, inventory value, low-stock list, and category distribution.
3. **Products.** Search by name or SKU, select a category, change sorting, and visit another page. Open a product.
4. **CRUD.** Add a product, choose a category and illustration, then edit its quantity below the low-stock threshold. Return to Overview to show the updated totals.
5. **Validation.** Try an existing SKU to show the server validation message. Explain that database constraints also protect relationships and unique values.
6. **Categories.** Add a spare category and a disposable product inside it. Show the delete dialog and its cascade warning. Confirm only if you want to remove those demo records.
7. **Roles.** Sign out, then sign in as User: view access remains, while edit and team controls disappear. A direct visit to an editing URL is also forbidden.
8. **Authentication.** Show registration and forgot-password screens. Explain that new accounts receive User, and local reset messages go to the log.
9. **Code.** Walk through one request using the files below.

## Explain one request

A user submits the product form in `resources/js/Pages/Products/ProductForm.jsx`. Inertia sends the request to the named resource endpoint in `routes/products.php`. Authentication and permission middleware run before `ProductController::store()`. The controller validates the fields and creates a Product through Eloquent. It redirects to the product detail page and sends a success message.

The model's fillable list controls mass assignment. The migration defines the table, unique SKU, timestamps, and category foreign key. The controller returns an Inertia page; React renders it within the shared layout.

## Terms worth knowing

- **MVC:** the model manages database records, the controller handles a request, and the view presents the result.
- **Inertia:** connects Laravel routes/controllers to React pages without a separate API server or React router.
- **Fortify:** supplies authentication and password-reset behavior; the project supplies its React screens.
- **Spatie permissions:** connects users to roles and permissions, which middleware checks on the server.
- **Migration:** a versioned definition of database structure.
- **Seeder:** creates initial roles and sample data. It does not overwrite edited inventory on repeat setup.
- **SQLite:** a relational database stored in a local file. It supports the project's tables, constraints, and relationships.
- **Capstone:** a larger culminating school project. The instructor's message distinguishes that future deployment requirement from this local final project.

## Before presenting

Run setup ahead of time while online. Start the app, check the Admin login, and close unnecessary windows. You do not need internet during the demonstration. Keep a private backup of the database and .env if your prepared data matters. Be ready to explain and modify the code yourself; the source and tests are the study material.
