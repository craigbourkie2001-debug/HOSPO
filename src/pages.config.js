import BrowseShifts from './pages/BrowseShifts';
import MyShifts from './pages/MyShifts';
import CoffeeShops from './pages/CoffeeShops';
import Roasters from './pages/Roasters';
import Profile from './pages/Profile';
import Marketplace from './pages/Marketplace';
import Events from './pages/Events';
import EmployerDashboard from './pages/EmployerDashboard';
import Restaurants from './pages/Restaurants';
import Jobs from './pages/Jobs';
import __Layout from './Layout.jsx';


export const PAGES = {
    "BrowseShifts": BrowseShifts,
    "MyShifts": MyShifts,
    "CoffeeShops": CoffeeShops,
    "Roasters": Roasters,
    "Profile": Profile,
    "Marketplace": Marketplace,
    "Events": Events,
    "EmployerDashboard": EmployerDashboard,
    "Restaurants": Restaurants,
    "Jobs": Jobs,
}

export const pagesConfig = {
    mainPage: "BrowseShifts",
    Pages: PAGES,
    Layout: __Layout,
};