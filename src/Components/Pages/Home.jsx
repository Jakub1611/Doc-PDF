import React, { useState } from "react";
import mammoth from "mammoth";
import parse from "html-react-parser";
//import PizZip from 'pizzip';
//import { saveAs } from 'file-saver';
//import { PDFDocument } from 'pdf-lib';
//import { PDFViewer, Document, Page, Text, PDFDownloadLink  } from '@react-pdf/renderer';
//import HTMLtoDOCX from "html-to-docx";

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
            const regex = new RegExp(`(?<=\\b${keyword}\\s*)\\.{3}`, 'g');

            // Sprawdzamy, czy aktualny węzeł tekstowy zawiera sekwencję "..." po słowie kluczowym
            if (regex.test(currentNode.nodeValue)) {
                // Zamieniamy sekwencję "..." na niestandardowy tekst dla danego słowa kluczowego
                console.log("sprawdz2");
                currentNode.nodeValue = currentNode.nodeValue.replace(regex, keywordCustomTextMap[keyword]);
            }
        });
    }

    // Pobieramy zaktualizowany kod HTML
    const updatedHtmlContent = doc.documentElement.outerHTML;
    console.log("Zaktualizowany dokument HTML:", updatedHtmlContent);
   // setPdfDocument(updatedHtmlContent);
   //const content = updatedHtmlContent;

//const data = await HTMLtoDOCX(content);
   // saveAs(data, "hello.docx");


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
