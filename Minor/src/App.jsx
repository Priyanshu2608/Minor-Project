import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./Pages/Dashboard";
import UEPage from "./Pages/UEPage";
import GNBPage from "./Pages/GNBPage";
import PDUPage from "./Pages/PDUPage";
import SubscribersPage from './Pages/SubscribersPage';
function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="ue" element={<UEPage />} />
          <Route path="pdu" element={<PDUPage />} />
          <Route path="gnb" element={<GNBPage />} />
          <Route path="subscribers" element={<SubscribersPage />} />
         
        </Route>
      </Routes>
    </Router>
  );
}

export default App;