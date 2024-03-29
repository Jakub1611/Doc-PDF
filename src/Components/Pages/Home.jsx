import React, { useState } from "react";
import mammoth from "mammoth";
import parse from "html-react-parser";
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import { PDFDocument } from 'pdf-lib';


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
  const findKeywords = (html) => {
    const extractedKeywords = [];
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const elements = doc.querySelectorAll('*');

    elements.forEach((element) => {
        const text = element.textContent;
        const regex = /(.+?)\s*\.\.\./g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            const keyword = match[1].trim();
            if (keyword !== "" && !extractedKeywords.some(item => item.word === keyword)) {
                extractedKeywords.push({ word: keyword, customText: "" });
            }
        }
    });

    console.log("Wyrazy przed znacznikiem '...':", extractedKeywords);
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
    const keywordCustomTextMap = {};
    keywords.forEach(keyword => {
        keywordCustomTextMap[keyword.word] = keyword.customText;
    });

    
    const doc = new DOMParser().parseFromString(docxContent, 'text/html');

   
    doc.querySelectorAll('*').forEach(element => {
        
        element.childNodes.forEach(node => {
         
            if (node.nodeType === Node.TEXT_NODE && node.nodeValue.includes("...")) {
              
                Object.keys(keywordCustomTextMap).forEach(keyword => {
                    node.nodeValue = node.nodeValue.replace(new RegExp(keyword + "\\.{3}", "g"), keywordCustomTextMap[keyword]);
                    console.log("Znaleziony tekst:", node.nodeValue);
console.log("Zaktualizowany tekst:", node.nodeValue.replace(new RegExp(keyword + "\\.{3}", "g"), keywordCustomTextMap[keyword]));

                });
            }
        });
    });

    // Pobieramy zaktualizowany kod HTML
    const updatedHtmlContent = doc.documentElement.outerHTML;
    console.log("Zaktualizowany dokument HTML:", updatedHtmlContent);


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
