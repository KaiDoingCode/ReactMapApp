import React, {useContext} from "react";
import { NavLink } from "react-router-dom";

import {AuthContext} from '../../context/auth-context'
import './NavLinks.css';


const NavLinks = props => {
    const auth = useContext(AuthContext);
    return(
        
        <ul className="nav-links">
            <li>
                <NavLink to="/" exact>ALL USERS</NavLink>
            </li>
            {auth.isLoggedIn && <li>
                <NavLink to={`/${auth.userId}/places`} exact>MY PLACES</NavLink>
            </li>}
            {auth.isLoggedIn && <li>
                <NavLink to="/places/new" exact>ADD PLACE</NavLink>
            </li>}
            {!auth.isLoggedIn && <li>
                <NavLink to="/auth" exact>AUTHENTICATE</NavLink>
            </li>}
            {auth.isLoggedIn && <li>
                <li>
                    <button onClick={auth.logout}>
                        LOGOUT
                    </button>
                </li>
            </li>}
        </ul>
    )
};

export default NavLinks;