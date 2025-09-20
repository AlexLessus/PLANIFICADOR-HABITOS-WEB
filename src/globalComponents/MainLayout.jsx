import AppNavbar from './AppNavbar';
import SideMenu from './SideMenu';

export default function MainLayout({ children }) {
    return (
        <>
            <AppNavbar />
            <SideMenu />
            <main>{children}</main>
        </>
    );
}