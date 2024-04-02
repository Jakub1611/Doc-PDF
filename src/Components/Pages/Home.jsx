import React, { useState, useRef } from "react";
import mammoth from "mammoth";
import parse from "html-react-parser";
import html2pdf from "html2pdf.js";
import bgImage from "../../assets/bg.jpg";
import "./Home.css";

function Home() {
  const [docxContent, setDocxContent] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const customTextRefs = useRef([]);

  const onFileUpload = (event) => {
    const reader = new FileReader();
    let file = event.target.files[0];

    reader.onload = (e) => {
      const content = e.target.result;
      mammoth
        .convertToHtml({ arrayBuffer: content })
        .then((result) => {
          setDocxContent(result.value);
          findKeywords(result.value);
        })
        .catch((err) => {
          console.error("Error converting DOCX to HTML:", err); // Zabezpieczenie
        });
    };

    reader.onerror = (err) => console.error(err);

    reader.readAsArrayBuffer(file);
  };
  // Funkcja znajdująca słowa
  const findKeywords = (html) => {
    const extractedKeywords = [];
    const doc = new DOMParser().parseFromString(html, "text/html");
    const elements = doc.querySelectorAll("*");

    elements.forEach((element) => {
      const text = element.textContent;
      const regex = /(.+?)\s*\.\.\./g;
      let match;
      while ((match = regex.exec(text)) !== null) {
        const keyword = match[1].trim();
        if (
          keyword !== "" &&
          !extractedKeywords.some((item) => item.word === keyword)
        ) {
          extractedKeywords.push({ word: keyword, customText: "" });
        }
      }
    });

    console.log("Wyrazy przed znacznikiem '...':", extractedKeywords); // Wyświetlenie wyrazów przed "..." w konsoli
    setKeywords(extractedKeywords);
  };

  const handleCustomTextChanged = (index, event) => {
    const updatedKeywords = [...keywords];
    updatedKeywords[index].customText = event.target.value;
    setKeywords(updatedKeywords);
  };
  // Pobieramy zaktualizowany kod HTML
  const saveChanges = () => {
    const updatedHtmlContent = applyCustomTextChanges(docxContent);
    generatePdf(updatedHtmlContent);
  };
  // Funkcja obsługująca zmianę niestandardowego tekstu
  const applyCustomTextChanges = (htmlContent) => {
    keywords.forEach((keyword, index) => {
      const regex = new RegExp(`${keyword.word}\\s*\\.{3}`, "g");
      htmlContent = htmlContent.replace(regex, keyword.customText);
    });
    return htmlContent;
  };

  const generatePdf = (htmlContent) => {
    const options = {
      margin: 10,
      filename: "document.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    const customTexts = keywords.map(
      (keyword, index) => customTextRefs.current[index].value
    );
    // Pobieramy zaktualizowany kod HTML
    const htmlWithCustomText = applyCustomTextToHTML(htmlContent, customTexts);

    html2pdf().from(htmlWithCustomText).set(options).save();
  };

  const applyCustomTextToHTML = (htmlContent, customTexts) => {
    keywords.forEach((keyword, index) => {
      const regex = new RegExp(`${keyword.word}\\s*\\.{3}`, "g");
      htmlContent = htmlContent.replace(regex, customTexts[index]);
    });
    return htmlContent;
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
