import { FitnessProvider } from "./context/FitnessContext";
import MainLayout from "./components/MainLayout";
import ThemeProvider from "./components/ThemeProvider";
import { BrowserRouter as Router } from "react-router-dom";

function App() {
    return (
        <ThemeProvider>
            <Router>
                <FitnessProvider>
                    <MainLayout />
                </FitnessProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;
