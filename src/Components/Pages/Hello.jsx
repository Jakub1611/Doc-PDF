import bgImage from "../../assets/bg.jpg";
import "./Hello.css";
import { Link } from "react-router-dom";
function Hello() {
  return (
    <div>
      <img src={bgImage} alt="es" className="bg-img" />

      <div className="content">
        <div className="text">
          <p className="app-title"> Aplikacja do tworzenia pdf</p>
          <p className="app-opis">
            Prosty konwerter do zamieniania plików docx na pdf, pierwszy projekt
            na P-zpp
          </p>
          <div className="centerbutton">
            <Link to="/home" className="title">
              <button className="jazda">Start!</button>
            </Link>
          </div>
        </div>
        <div className="expamples">
          <ul className="table">
            <li className="one">./Tytuł &#10142; Warstwa ozonowa</li>
            <li className="one">./Imie i nazwisko &#10142; Amon Ra</li>
            <li className="one">./Data &#10142; 15.10.2010</li>
            <li className="one">./Typ &#10142; Praca licencjacka</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Hello;
