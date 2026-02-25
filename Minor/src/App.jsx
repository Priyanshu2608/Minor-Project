import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./Pages/Dashboard";
import UEPage from "./Pages/UEPage";
import GNBPage from "./Pages/GNBPage";
import PDUPage from "./Pages/PDUPage";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ue" element={<UEPage />} />
          <Route path="/pdu" element={<PDUPage />} />
          <Route path="/gnb" element={<GNBPage />} />
         
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;