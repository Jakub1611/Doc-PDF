import React, { useState } from "react";
import mammoth from "mammoth";
import parse from "html-react-parser";

function Home() {
  const [docxContent, setDocxContent] = useState(null);
  const [plainText, setPlainText] = useState(null);
  const [keywords, setKeywords] = useState([]);

  const onFileUpload = (event) => {
    console.log("File selected");
    const reader = new FileReader();
    let file = event.target.files[0];

    reader.onload = (e) => {
      console.log("File loaded");
      const content = e.target.result;
      mammoth.convertToHtml({ arrayBuffer: content })
        .then((result) => {
          setDocxContent(result.value);
        })
        .catch((err) => {
          console.error("Error converting DOCX to HTML:", err); // zabezpieczenie
        });

      mammoth.extractRawText({ arrayBuffer: content })
        .then((result) => {
          console.log("Text extracted");
          setPlainText(result.value);
          findKeywords(result.value);
        })
        .catch((err) => {
          console.error("Error extracting plain text from DOCX:", err);
        });
    };

    reader.onerror = (err) => console.error(err);

    reader.readAsArrayBuffer(file);
  };
//funkcja znajdująca słowa
  const findKeywords = (text) => {
    const lines = text.split("\n");
    const extractedKeywords = [];
//dziele na linie i szukam 
    lines.forEach((line) => {
      const index = line.indexOf("...");
      if (index !== -1) {
        const keyword = line.substring(0, index).trim();
        if (keyword !== "") {
          extractedKeywords.push(keyword);
        }
      }
    });

    console.log("Wyrazy przed znacznikiem '...':", extractedKeywords); //Sprawdzam w konsoli czy cos mam
    setKeywords(extractedKeywords);
  };
//Troche format do poprawy
  return (
    <div>
      <input type="file" onChange={onFileUpload} name="docx-reader" />
      {docxContent && (
        <div>
          <h2>Wyświetlanie dokumentu DOCX:</h2> 
          <div>{parse(docxContent)}</div>
        </div>
      )}
    {/*{plainText && ( // opcja sprawdzenia jak sobie radzi zamiana na tekst
        <div>
          <h2>Przekonwertowany tekst z pliku DOCX:</h2>
          <pre>{plainText}</pre>
            </div>
      )}*/}
      {keywords.length > 0 && (
        <div>
          <h2>Wyrazy przed znacznikiem "..." :</h2>
          <div>
            {keywords.map((keyword, index) => (
              <div key={index}>{keyword}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
