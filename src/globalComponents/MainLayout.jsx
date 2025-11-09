import AppNavbar from './AppNavbar';
import SideMenu from './SideMenu';
import TutorialTour from '../pages/DashboardPage/components/TutorialTour';

export default function MainLayout({ children }) {
    return (
        <>
            <AppNavbar />
            <SideMenu />
            <TutorialTour />
            <main>{children}</main>
        </>
    );
}