import React from 'react';

interface NavbarProps {
    active: string;
    handler: React.Dispatch<React.SetStateAction<string>>;
}

function Navbar(props: NavbarProps): JSX.Element {
  return (
    <ul className="navbar">
        <li><NavbarButton title="About" icon="abouticon" active={(props.active === 'About')} onClick={props.handler} /></li>
        <li><NavbarButton title="Preferences" icon="preferencesicon" active={(props.active === 'Preferences')} onClick={props.handler} /></li>
        <li><NavbarButton title="Folders" icon="foldersicon" active={(props.active === 'Folders')} onClick={props.handler} /></li>
        <li><NavbarButton title="Transfers" icon="transfersicon" active={(props.active === 'Transfers')} onClick={props.handler} /></li>
    </ul>
  );
}

interface NavbarButtonProps {
    title: string;
    icon: string;
    active: boolean;
    onClick: React.Dispatch<React.SetStateAction<string>>;
}

export function NavbarButton(props: NavbarButtonProps): JSX.Element {
    return (
        <button className={"navbar-button" + (props.active ? "active": "")} onClick={() => props.onClick(props.title)}>
            <h4>{props.title}</h4>
            <p>{props.icon}</p>
        </button>
    );
}

export default Navbar;
