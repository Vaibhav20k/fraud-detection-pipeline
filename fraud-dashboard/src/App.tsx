import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import RiskQueue from "./pages/RiskQueue";
import Watchlists from "./pages/Watchlists";
import Reports from "./pages/Reports";
import NewInvestigation from "./pages/NewInvestigation";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/risk-queue" element={<RiskQueue />} />
          <Route path="/watchlists" element={<Watchlists />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/investigation/new" element={<NewInvestigation />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;