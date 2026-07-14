import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";


import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Player from "./pages/Player";



export default function App() {


    return (

        <BrowserRouter>

            <Routes>


                <Route

                    path="/"

                    element={<Home />}

                />


                <Route

                    path="/admin"

                    element={<Admin />}

                />


                <Route

                    path="/player"

                    element={<Player />}

                />


            </Routes>

        </BrowserRouter>

    );

}