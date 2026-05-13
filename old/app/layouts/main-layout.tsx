import { Header } from "@/widgets/header";

type Props = {
    children: React.ReactNode;
};

const MainLayout: React.FC<Props> = (props) => {
    return (
        <>
            <Header />
            <div className="pt-25">{props.children}</div>
        </>
    );
};

export default MainLayout;
