import { Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { OauthRedirect } from "./pages/OauthRedirect";
import { ProtectedRoute } from "./routes/ProtectedRoutes";
import { DashboardPage } from "./pages/DashboardPage";
import { WelcomePage } from "./pages/WelcomePage";
import { TransactionsPage } from "./pages/transactions/TransactionsPage";
import { HomePage } from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";
import { AppLayout } from "./layouts/AppLayout";
import { BudgetsPage } from "./pages/budgets/BudgetsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/oauth2/redirect" element={<OauthRedirect />} />
      <Route path="/welcome" element={<WelcomePage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/budgets" element={<BudgetsPage/>}/>
      </Route>
    </Routes>
  );
}

export default App;
