import { getCookieValue } from "@/middleware";
import React from "react";
import { Button } from "react-bootstrap";

const ExportToExcelTemplateButton = () => {
  const handleExportTemplate = async () => {
    try {
      const token = getCookieValue();
      const response = await fetch(
        "http://localhost:2700/exportexcelproductstemplate",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download template");
      }

      // Buat blob untuk file yang diunduh
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "template_import_produk.xlsx";
      link.click();
    } catch (err) {
      console.error("Error downloading template:", err);
      alert("Failed to download template. Please try again.");
    }
  };

  return (
    <Button variant="danger" onClick={handleExportTemplate}>
      Download Template Excel
    </Button>
  );
};

export default ExportToExcelTemplateButton;
