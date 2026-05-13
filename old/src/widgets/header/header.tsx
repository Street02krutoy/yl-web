import { Link } from "@tanstack/react-router";

const Header: React.FC = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            <div className="bg-header border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        <Link to="/" aria-label="Home">
                            <img
                                src="logo.png"
                                alt="Chuvashi Republic logo"
                                className="h-8 sm:h-10"
                            />
                        </Link>

                        <nav
                            aria-label="Main navigation"
                            className="flex items-center gap-6"
                        >
                            <Link
                                to="/"
                                className="text-lg font-medium text-gray-800  hover:text-red-600  transition-colors"
                            >
                                Главная
                            </Link>
                            <Link
                                to="/#map"
                                className="text-lg font-medium text-gray-800  hover:text-red-600  transition-colors"
                            >
                                Карта
                            </Link>
                            <Link
                                to="/#quiz"
                                className="text-lg font-medium text-gray-800  hover:text-red-600  transition-colors"
                            >
                                Квиз
                            </Link>
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
