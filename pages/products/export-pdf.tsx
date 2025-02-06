import { getCookieValue } from "@/middleware";
import React from "react";
import { Button } from "react-bootstrap";

const ExportToPDFButton = () => {
  const handleExportToPDFPreview = async () => {
    try {
      const token = getCookieValue();
      const response = await fetch("http://localhost:2700/exportpdfproducts", {
        method: "GET",
        headers: {
          "Content-Type": "application/pdf",
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to download PDF. Status: ${response.status}`);
      }
  
  
      // Ubah respons menjadi Blob
      const pdfBlob = await response.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);
  
      // Tampilkan PDF di tab baru
      window.open(pdfUrl, "_blank");
    } catch (err) {
      console.error("Error downloading PDF:", err);
      alert("Failed to export PDF. Please try again.");
    }
  };

  return (
    <Button variant="danger" onClick={handleExportToPDFPreview}>
      Preview PDF
    </Button>
  );
};

export default ExportToPDFButton;