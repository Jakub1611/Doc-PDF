import React, { useState } from "react";
import styles from "./Logika.module.css";

import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import PizZip from "pizzip";
import { PDFDocument, StandardFonts } from "pdf-lib";
function Logika() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileText, setFileText] = useState("");
  const [EdycjaText, UEditText] = useState("");

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target.result;
        const uint8Array = new Uint8Array(arrayBuffer);
        const zip = new PizZip(uint8Array);

        // Odczytaj plik "document.xml" z wewnątrz pliku ZIP
        const docXml = zip.file("word/document.xml").asText();

        // Tutaj możesz kontynuować przetwarzanie zawartości "document.xml"
        const text = extractTextFromXml(docXml);
        setFileText(text);
        UEditText(text);
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const extractTextFromXml = (xmlString) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const paragraphs = xmlDoc.getElementsByTagName("w:p");
    let text = "";
    for (let i = 0; i < paragraphs.length; i++) {
      const runs = paragraphs[i].getElementsByTagName("w:r");
      for (let j = 0; j < runs.length; j++) {
        const textNodes = runs[j].getElementsByTagName("w:t");
        for (let k = 0; k < textNodes.length; k++) {
          text += textNodes[k].textContent;
        }
        text += "\n";
      }
    }
    return text;
  };

  const handleEditableTextChange = (event) => {
    UEditText(event.target.value); //aktualizacja tekstu
  };

  //Zapis pliku do formatu doxc ()
  const Zapis_Pliku = async () => {
    if (!selectedFile) {
      // Dodaj tutaj logikę obsługi błędu, np. wyświetl komunikat o błędzie
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target.result;
      const uint8Array = new Uint8Array(arrayBuffer);
      const zip = new PizZip(uint8Array);

      // Aktualizuj zawartość dokumentu

      // Utwórz nowy obiekt Docxtemplater
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Ustaw zaktualizowane dane do szablonu
      // doc.setData({
      //   content: EdycjaText, // Twoja zaktualizowana zawartość
      // });

      // Renderuj dokument
      doc.render({ content: EdycjaText });

      // Pobierz bufor zaktualizowanego dokumentu
      const buffer = doc.getZip().generate({ type: "uint8array" });

      // Utwórz Blob z bufora
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      // Zapisz Blob jako plik DOCX
      saveAs(blob, "updated_document.docx");
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const Zapis_Pliku_PDF = async () => {
    if (!selectedFile) {
      // Dodaj tutaj logikę obsługi błędu, np. wyświetl komunikat o błędzie
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target.result;
      const uint8Array = new Uint8Array(arrayBuffer);

      // Utwórz nowy dokument PDF
      const pdfDoc = await PDFDocument.create();

      // Dodaj nową stronę do dokumentu PDF
      const page = pdfDoc.addPage();

      // Dodaj tekst do strony z użyciem czcionki standardowej Unicode
      page.drawText(EdycjaText, {
        x: 50,
        y: 500,
        font: await pdfDoc.embedFont(StandardFonts.Helvetica),
      });

      // Utwórz bufor dla zaktualizowanego dokumentu PDF
      const pdfBytes = await pdfDoc.save();

      // Utwórz Blob z bufora
      const blob = new Blob([pdfBytes], {
        type: "application/pdf",
      });

      // Zapisz Blob jako plik PDF
      saveAs(blob, "updated_document.pdf");
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  return (
    <div className="App">
      <header className="App-header">
        <input type="file" onChange={handleFileChange} accept=".docx" />
        <button onClick={handleUpload}>Załaduj</button>
        <div>
          <label>
            <textarea value={EdycjaText} onChange={handleEditableTextChange} />
          </label>
        </div>
        <button onClick={Zapis_Pliku}>Zapisz jako DOCX</button>
        <button onClick={Zapis_Pliku_PDF}>Zapisz jako PDF</button>
      </header>
    </div>
  );
}

export default Logika;
