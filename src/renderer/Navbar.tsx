import React from 'react';
import { HiOutlineQuestionMarkCircle, HiOutlineCog6Tooth } from "react-icons/hi2";
import { MdOutlineFolderCopy } from "react-icons/md";
import { IoCloudUploadOutline } from "react-icons/io5";

interface NavbarProps {
    active: string;
    handler: React.Dispatch<React.SetStateAction<string>>;
}

function Navbar(props: NavbarProps): JSX.Element {
  return (
    <div className="navbar">
        <NavbarButton title="About" active={(props.active === 'About')} onClick={props.handler} />
        <NavbarButton title="Preferences" active={(props.active === 'Preferences')} onClick={props.handler} />
        <NavbarButton title="Folders" active={(props.active === 'Folders')} onClick={props.handler} />
        <NavbarButton title="Transfers" active={(props.active === 'Transfers')} onClick={props.handler} />
    </div>
  );
}

interface NavbarButtonProps {
    title: string;
    active: boolean;
    onClick: React.Dispatch<React.SetStateAction<string>>;
}

export function NavbarButton(props: NavbarButtonProps): JSX.Element {
    let icon;
    if (props.title === 'About')
        icon = <HiOutlineQuestionMarkCircle />;
    else if (props.title === 'Preferences')
        icon = <HiOutlineCog6Tooth />;
    else if (props.title === 'Folders')
        icon = <MdOutlineFolderCopy />;
    else if (props.title === 'Transfers')
        icon = <IoCloudUploadOutline />
    
    const active = props.active ? "navbar-active" : "";
    const classes = `navbar-button ${active}`;

    return (
        <button className={classes} onClick={() => props.onClick(props.title)}>
            <span className="navbar-icon">{icon}</span>
            <span>{props.title}</span>
        </button>
    );
}

export default Navbar;
