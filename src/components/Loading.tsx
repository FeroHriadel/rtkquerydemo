interface LoadingProps {
  className?: string;
  style?: React.CSSProperties;
}



const Loading = ({ className, style }: LoadingProps) => {
  return (
    <p className={className} style={style}>Loading...</p>
  )
}

export default Loading