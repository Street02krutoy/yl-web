type Props = {
    children: React.ReactElement;
};

const Container: React.FC<Props> = (props) => {
    return <div className="container mx-auto">{props.children}</div>;
};

export default Container;
