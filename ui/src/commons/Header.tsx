interface HeaderProps {
  title: string;
}

function Header({ title }: HeaderProps): React.JSX.Element {
  return (
    <header className="flex h-14 shrink-0 items-center border-b border-neutral-800 bg-neutral-950 px-6">
      <h1 className="text-lg font-semibold text-neutral-100">{title}</h1>
    </header>
  );
}

export default Header;
