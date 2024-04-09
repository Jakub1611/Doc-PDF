import React, { useState, useRef } from "react";
import mammoth from "mammoth";
import parse from "html-react-parser";
import html2pdf from "html2pdf.js";
import bgImage from "../../assets/bg.jpg";
import "./Home.css";

function Home() {
  const [docxContent, setDocxContent] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [plainText, setPlainText] = useState(null);
  const customTextRefs = useRef([]);


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
    //const linesWithSpaces = [];
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const elements = doc.querySelectorAll('*');

    elements.forEach((element) => {
        const text = element.textContent;
        const regex = /(.+?)\s*\.\.\./g;

      
        ;

        let match;
        while ((match = regex.exec(text)) !== null) {
            const keyword = match[1].trim();
            
            if (keyword !== "" && !extractedKeywords.some(item => item.word === keyword)) {
                extractedKeywords.push({ word: keyword, customText: "" });
            }
        }

        const regex2 = /(.+?\/[^\/]+\/?)(?:\s*\/|$)/g
        while ((match = regex2.exec(text)) !== null) {
          const keyword = match[1].trim(); // Użyj match[1], aby uzyskać dopasowaną frazę z grupy przechwytującej
          if (keyword !== "" && !extractedKeywords.some(item => item.word === keyword)) {
              extractedKeywords.push({ word: keyword, customText: "" });
          }
      }
      
      if (extractedKeywords.length === 0) {
          console.log("Nie znaleziono dopasowań.");
      }
       
       
      

    


    });

    console.log("Wyrazy przed znacznikiem '...':", extractedKeywords);
    setKeywords(extractedKeywords);
};

const handleCustomTextChanged = (index, event) => {
  const updatedKeywords = [...keywords];
  updatedKeywords[index].customText = event.target.value;
  setKeywords(updatedKeywords);
};
console.log("Content of docxContent:", keywords); 
  // Pobieramy zaktualizowany kod HTML
  
  
  
  
  const saveChanges = async () => {
    const keywordCustomTextMap = {};
    keywords.forEach(keyword => {
        keywordCustomTextMap[keyword.word] = keyword.customText;
    });

    const doc = new DOMParser().parseFromString(docxContent, 'text/html');
    console.log(doc);

    // Przetwarzamy cały tekst w dokumencie
    const textNodes = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null, false);
    let currentNode;
    while (currentNode = textNodes.nextNode()) {
      console.log("sprawdz1")
        Object.keys(keywordCustomTextMap).forEach(keyword => {
            //tutaj wybor sekwencji
         //  const regex = new RegExp(`?<=${keyword}\\s*\\.{3}`, 'gi');
           // const regex = new RegExp(`(?<=\\b${keyword}\\s*)\\.{3}`, 'gi');
           const regex = new RegExp(`(?<=<[^>]+>)(?:(?!<[^>]+>)(?:.|\\n))*?\\b${keyword}(?=\\s*\\.{3})|(?<=\\b${keyword}\\s*)\\.{3}`, 'gi');
           const regex2 = new RegExp(`(?<=<[^>]+>)(?:(?!<[^>]+>)(?:.|\\n))*?\\b${keyword}(?=\\s*[\/]{1})|(?<=\\b${keyword}\\s*)[\/]{1}`, 'gi');
            //Sprawdzamy, czy aktualny węzeł tekstowy zawiera sekwencję "..." po słowie kluczowym
            if (regex.test(currentNode.nodeValue)) {
                
                console.log("sprawdz2");
                currentNode.nodeValue = currentNode.nodeValue.replace(regex, keywordCustomTextMap[keyword]);
            }

            if (regex2.test(currentNode.nodeValue)) {
                
              console.log("sprawdz2");
              currentNode.nodeValue = currentNode.nodeValue.replace(regex2, keywordCustomTextMap[keyword]);
          }




        });
    }


    
    const updatedHtmlContent = doc.documentElement.outerHTML;
    console.log("Zaktualizowany dokument HTML:", updatedHtmlContent);

    const options = {
      margin: 10,
      filename: "document.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  html2pdf().from(updatedHtmlContent).set(options).save();

};

  return (
    <div>
      <img src={bgImage} alt="es" className="bg-img" />
      <div className="wszystko1">
        <input
          type="file"
          onChange={onFileUpload}
          name="docx-reader"
          className="inpu"
        />
        <div className="sw">
          {" "}
          {docxContent && (
            <div>
              <h2>
                <span className="koks">Wyświetlanie dokumentu DOCX:</span>
              </h2>
              <div className="cont">{parse(docxContent)}</div>
            </div>
          )}
          {keywords.length > 0 && (
            <div>
              <h2>
                <span className="koks">Wyrazy przed znacznikiem "..." :</span>
              </h2>
              <div className="znacz">
                {keywords.map((keyword, index) => (
                  <div key={index}>
                    {keyword.word}:{" "}
                    <input
                      className="in"
                      type="text"
                      ref={(ref) => (customTextRefs.current[index] = ref)}
                      defaultValue={keyword.customText}
                      onChange={(event) =>
                        handleCustomTextChanged(index, event)
                      }
                    />
                  </div>
                ))}
              </div>
              <button onClick={saveChanges} className="btnzap">
                Zapisz jako pdf
              </button>
            </div>
          )}{" "}
        </div>
      </div>
    </div>
  );
}

export default Home;
