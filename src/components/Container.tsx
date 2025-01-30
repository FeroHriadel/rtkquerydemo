interface ContainerProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}



const Container = ({ children, className, style }: ContainerProps) => {
  return (
    <div className={"max-w-[1000px] mx-auto p-4 " + className} style={style}>
      {children}
    </div>
  )
}

export default Container