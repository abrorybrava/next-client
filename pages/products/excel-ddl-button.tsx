import React from "react";
import { Dropdown, ButtonGroup, Button } from "react-bootstrap";
import ExportToExcelButton from "./export-excel";  // Import tombol Export
import ExportToExcelTemplateButton from "./export-template";  // Import tombol Template
import ImportExcelButton from "./import-excel";

const ExcelDropdown = () => {
  return (
    <Dropdown as={ButtonGroup}>
      <Button variant="success">Excel</Button>
      <Dropdown.Toggle split variant="success" id="dropdown-custom-components" />

      <Dropdown.Menu>
        {/* Tombol Export Data */}
        <Dropdown.Item as="button">
          <ExportToExcelButton />
        </Dropdown.Item>
        
        {/* Tombol Export Template */}
        <Dropdown.Item as="button">
          <ExportToExcelTemplateButton />
        </Dropdown.Item>

        {/* Tombol Import Data */}
        <Dropdown.Item as="button">
          <ImportExcelButton />
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ExcelDropdown;