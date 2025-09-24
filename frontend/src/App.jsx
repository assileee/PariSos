import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import LogInPage from "./pages/LogInPage";
import NotFoundPage from "./pages/NotFoundPage";
import SignUpPage from "./pages/SignUpPage";
import ChatbotPage from "./pages/ChatbotPage";
import ChecklistPage from "./pages/ChecklistPage";

// Components
import NavBar from "./components/NavBar";
import FooterComp from "./components/FooterComp";

const App = () => {
  return (
    <>
      <Router>
        <NavBar />
        <main
          style={{ minHeight: "calc(100vh - 180px)" }}
          className="container-fluid"
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LogInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="/checklist" element={<ChecklistPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <FooterComp />
      </Router>
    </>
  );
};

export default App;