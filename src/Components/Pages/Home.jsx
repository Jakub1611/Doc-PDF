import React, { useState } from "react";
import mammoth from "mammoth";
import parse from "html-react-parser";
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';

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

  // Funkcja znajdująca słowa
  const findKeywords = (text) => {
    const lines = text.split("\n");
    const extractedKeywords = [];
    // Dzielę na linie i szukam
    lines.forEach((line) => {
      const index = line.indexOf("...");
      if (index !== -1) {
        const keyword = line.substring(0, index).trim();
        if (keyword !== "") {
          extractedKeywords.push({ word: keyword, customText: "" });
        }
      }
    });

    console.log("Wyrazy przed znacznikiem '...':", extractedKeywords); // Sprawdzam w konsoli czy coś mam
    setKeywords(extractedKeywords);
  };

  // Funkcja obsługująca zmianę niestandardowego tekstu
  const handleCustomTextChanged = (index, event) => {
    const updatedKeywords = [...keywords];
    updatedKeywords[index].customText = event.target.value;
    setKeywords(updatedKeywords);
  };
  console.log("Content of docxContent:", keywords); 
  

  
  const saveChanges = () => {
    // Tworzymy obiekt, w którym kluczem będzie słowo kluczowe, a wartością wprowadzony przez użytkownika tekst
    const keywordCustomTextMap = {};
    keywords.forEach(keyword => {
        keywordCustomTextMap[keyword.word] = keyword.customText;
    });

    // Tworzymy zmienną przechowującą zaktualizowany dokument
    let updatedDocument = '';

    // Przechodzimy przez oryginalny tekst dokumentu, aby zachować jego strukturę
    const lines = plainText.split("\n");
    lines.forEach((line, lineIndex) => {
        let updatedLine = line;
        const indexOfEllipsis = line.indexOf("...");
        if (indexOfEllipsis !== -1) {
            const keyword = line.substring(0, indexOfEllipsis).trim();
            if (keyword !== "") {
                const customText = keywordCustomTextMap[keyword] || keyword;
                updatedLine = updatedLine.replace("...", customText);
            }
        }
        updatedDocument += updatedLine;
        if (lineIndex !== lines.length - 1) {
            updatedDocument += '\n';
        }
    });

    // Tutaj możesz dodać kod do zapisywania zaktualizowanego dokumentu, np. zapisanie do pliku lub wysłanie na serwer
    console.log("Zapisano zaktualizowany dokument:", updatedDocument);
};






  


  return (
    <div>
      <input type="file" onChange={onFileUpload} name="docx-reader" />
      {docxContent && (
        <div>
          <h2>Wyświetlanie dokumentu DOCX:</h2> 
          <div>{parse(docxContent)}</div>
        </div>
      )}
      {keywords.length > 0 && (
        <div>
          <h2>Wyrazy przed znacznikiem "..." :</h2>
          <div>
            {keywords.map((keyword, index) => (
              <div key={index}>
                {keyword.word}:{" "}
                <input
                  type="text"
                  value={keyword.customText}
                  onChange={(event) => handleCustomTextChanged(index, event)}
                />
              </div>
            ))}
          </div>
          <button onClick={saveChanges}>Zapisz</button>
        </div>
      )}
    </div>
  );
}

export default Home;
