import React, { useState } from "react";
import { Button, Form, Modal, Alert, Spinner } from "react-bootstrap";
import { getCookieValue } from "@/middleware"; // Fungsi untuk mengambil token

const ImportExcelButton = () => {
  const [showModal, setShowModal] = useState(false); // State untuk mengontrol modal
  const [file, setFile] = useState<File | null>(null); // File yang dipilih
  const [error, setError] = useState(""); // Pesan error
  const [isLoading, setIsLoading] = useState(false); // Indikator loading
  const [message, setMessage] = useState<string | null>(null); // Pesan sukses
  const [isFileValid, setIsFileValid] = useState(false); // Status validasi file
  const [validationErrors, setValidationErrors] = useState<
    { row: number; message: string }[]
  >([]); // Untuk menampilkan error validasi

  // Fungsi untuk menampilkan modal
  const handleShowModal = () => setShowModal(true);

  // Fungsi untuk menutup modal
  const handleCloseModal = () => {
    setShowModal(false);
    setError(""); // Reset error saat modal ditutup
    setMessage(null); // Reset pesan sukses
    setValidationErrors([]); // Reset error validasi
    setIsFileValid(false); // Reset status validasi
  };

  // Fungsi ketika file dipilih
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    setFile(selectedFile);
    setError(selectedFile ? "" : "Please select an Excel file.");
    setMessage(null); // Reset success message
    setIsFileValid(false); // Reset validasi file
    setValidationErrors([]); // Reset error validasi
  };

  // Fungsi untuk validasi file sebelum upload
  const validateFile = async () => {
    if (!file) {
      setError("Please select an Excel file to validate.");
      return;
    }

    const formData = new FormData();
    formData.append("excel_file", file);

    try {
      setIsLoading(true);
      const token = getCookieValue(); // Mendapatkan token untuk otorisasi

      const response = await fetch("http://localhost:2700/validate-import", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to validate file.");
        setValidationErrors(errorData.errors || []);
        setIsFileValid(false);
      } else {
        setMessage("File is valid for import!");
        setValidationErrors([]);
        setIsFileValid(true); // Aktifkan tombol upload jika validasi berhasil
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError("Error validating file. Please try again.");
      console.error("Error validating file:", err);
    }
  };

  // Fungsi untuk mengupload file setelah validasi berhasil
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFileValid) {
      setError("Please validate the file before uploading.");
      return;
    }

    if (!file) {
      setError("Please select an Excel file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("excel_file", file);

    try {
      setIsLoading(true);
      const token = getCookieValue(); // Mendapatkan token untuk otorisasi

      const response = await fetch("http://localhost:2700/products-import", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();
      setIsLoading(false);
      setMessage(data.message || "File uploaded successfully!");
      setFile(null); // Hapus file input setelah berhasil
      handleCloseModal(); // Tutup modal setelah upload berhasil
      window.location.reload();
    } catch (err) {
      setIsLoading(false);
      setError("Error uploading file. Please try again.");
      console.error("Error uploading file:", err);
    }
  };

  return (
    <>
      <Button variant="primary" onClick={handleShowModal}>
        Import Produk by Excel
      </Button>

      {/* Modal untuk upload Excel */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Import Produk dari Excel</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpload}>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Choose Excel file</Form.Label>
              <Form.Control
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                isInvalid={!!error} // Menampilkan border merah jika error
              />
              {error && <Form.Text className="text-danger">{error}</Form.Text>}
            </Form.Group>

            {/* Menampilkan pesan error validasi jika ada */}
            {validationErrors.length > 0 && (
              <div className="text-danger">
                <ul>
                  {validationErrors.map((err, index) => (
                    <li key={index}>
                      Row {err.row}: {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {message && <Alert variant="success">{message}</Alert>}

            {/* Tombol untuk upload jika file valid */}
            <Button
              variant="primary"
              type="submit"
              disabled={isLoading || !isFileValid}
            >
              {isLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Upload File"
              )}
            </Button>
            &nbsp;

            {/* Tombol untuk validasi */}
            <Button
              variant="secondary"
              onClick={validateFile}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Validate File"
              )}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ImportExcelButton;
