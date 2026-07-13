# Connection Integration Checklist

- `[x]` Install `axios` in frontend project
- `[x]` Update `backend/models/Lead.js` (add `value` field)
- `[x]` Create `backend/controllers/leadController.js` (implement backend lead logic)
- `[x]` Update `backend/routes/leadRoutes.js` (protect and route backend endpoints)
- `[x]` Create frontend `src/services/api.js` (Axios custom instance with interceptors)
- `[x]` Create frontend `src/services/authService.js` (auth API integration functions)
- `[x]` Create frontend `src/services/leadService.js` (leads API integration functions)
- `[x]` Create frontend `src/context/AuthContext.jsx` (state, token validation, login/register/logout wrapper)
- `[x]` Update frontend `src/context/LeadContext.jsx` (replace localStorage with database operations)
- `[x]` Update frontend `src/App.jsx` (wrap layout with `AuthProvider`)
- `[x]` Create frontend `src/pages/Login.jsx` (login form and redirect logic)
- `[x]` Create frontend `src/pages/Register.jsx` (registration form and password check)
- `[x]` Update frontend `src/routes/index.jsx` (ProtectedRoute implementation, login/register routes)
- `[x]` Create frontend env files (`.env` and `src/.env` configuration)
- `[x]` Update frontend `src/components/common/Sidebar.jsx` (inject dynamic auth details & logout button)
- `[x]` Verify application functionality (linting and system checks)
