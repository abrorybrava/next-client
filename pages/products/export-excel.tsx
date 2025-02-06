import { getCookieValue } from "@/middleware";
import React from "react";
import { Button } from "react-bootstrap";

const ExportToExcelButton = () => {
const handleExportToExcel = async () => {
  try {
    const token = getCookieValue(); // Ambil token jika diperlukan
    const response = await fetch("http://localhost:2700/exportexcelproducts", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to download Excel");
    }

    // Buat blob untuk file yang diunduh
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "daftar_produk.xlsx";
    link.click();
  } catch (err) {
    console.error("Error downloading Excel:", err);
    alert("Failed to export Excel. Please try again.");
  }
};

  return (
    <Button variant="success" onClick={handleExportToExcel}>
      Export Excel
    </Button>
  );
};

export default ExportToExcelButton;
