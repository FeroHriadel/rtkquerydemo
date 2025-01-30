interface ListProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface ListLineProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}


export const List = ({ children, className, style }: ListProps) => {
  return (
    <ul className={"w-[100%] flex flex-col border border-gray-300 last:border-b-0 rounded " + className} style={style}>
      {children}
    </ul>
  )
}

export const ListLine = ({ children, className, style }: ListLineProps) => {
  return (
    <li className={"w-[100%] border-b border-gray-300 hover:bg-gray-300 p-4 " + className} style={style}>
      {children}
    </li>
  )
}

