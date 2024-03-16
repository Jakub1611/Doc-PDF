import "./Navbar.css";
import { Link, NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      <Link to="/" className="title">
        DocxToPdf
      </Link>
      <ul>
        <li>
          <div>
            <NavLink className="rainbow-2" to="/home">
              Start
            </NavLink>
          </div>
        </li>
        <li>
          <NavLink to="/help">Pomoc</NavLink>
        </li>
        <li>
          <NavLink to="/authors">Autorzy</NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
