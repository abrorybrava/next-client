import { useState } from "react";
import axios from "axios";
import { Button, Modal, Form } from "react-bootstrap";
import { getCookieValue } from "@/middleware";

const ExportPDFButton = () => {
  const [show, setShow] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExportPDF = async () => {
    if (!startDate || !endDate) {
      alert("Silakan pilih rentang tanggal terlebih dahulu.");
      return;
    }

    try {
      setLoading(true);
      const token = getCookieValue();
      const response = await axios.get(
        `http://localhost:2700/exportpdforders?startDate=${startDate}&endDate=${endDate}`,
        {
          responseType: "blob",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Buat URL untuk file PDF dan unduh
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `orders_${startDate}_${endDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);

      setShow(false); // Tutup modal setelah export
    } catch (error) {
      console.error("Gagal mengekspor PDF:", error);
      alert("Terjadi kesalahan saat mengekspor PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Tombol untuk membuka modal */}
      <Button variant="danger" onClick={() => setShow(true)}>
        Export PDF
      </Button>

      {/* Modal untuk memilih rentang tanggal */}
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Export Orders to PDF</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tanggal Mulai</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tanggal Akhir</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Batal
          </Button>
          <Button variant="danger" onClick={handleExportPDF} disabled={loading}>
            {loading ? "Memproses..." : "Export PDF"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ExportPDFButton;
