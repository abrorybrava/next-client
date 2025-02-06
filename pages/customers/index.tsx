"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Modal, Button, Form } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { Formik, Field, Form as FormikForm, ErrorMessage } from "formik";
import { getCookieValue } from "@/middleware";
import { customerSchema } from "@/utils/validationSchema";
import axios from "axios";
import useAuth from "@/utils/useAuth";

interface Customer {
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: number;
}

export default function CustomersViewResult() {
  const [dataCust, setDataCust] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;
  const [successMessage, setSuccessMessage] = useState<string>("");
  const searchParams = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [customer_name, setCustomerName] = useState<string>("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<keyof Customer | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { user } = useAuth();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = getCookieValue();
      const res = await fetch("http://localhost:2700/customers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch customers: ${res.status}`);
      }
      const data: Customer[] = await res.json();
      setDataCust(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    if (searchParams && searchParams.get("success") === "true") {
      setSuccessMessage("Customer created successfully!");
    }
  }, [searchParams]);

  const handleCreateCustomer = async (values: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
  }) => {
    try {
      const token = getCookieValue();
      const res = await fetch("http://localhost:2700/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_name: values.customer_name,
          customer_email: values.customer_email,
          customer_phone: values.customer_phone,
          customer_status: 1,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create customer");
      }

      const newCustomer: Customer = await res.json();
      setDataCust((prev) => [...prev, newCustomer]);
      setSuccessMessage("Customer created successfully!");
      setShowCreateModal(false);
      await fetchCustomers();
    } catch (err: any) {
      setError(err.message || "Failed to create customer");
    }
  };

  const handleEditCustomer = async (values: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
  }) => {
    if (!editingCustomer) return;

    try {
      const token = getCookieValue();
      const res = await fetch(
        `http://localhost:2700/customers/${editingCustomer.customer_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            customer_name: values.customer_name,
            customer_email: values.customer_email,
            customer_phone: values.customer_phone,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to edit customer");
      }

      const updatedCustomer: Customer = await res.json();
      setDataCust((prev) =>
        prev.map((cust) =>
          cust.customer_id === updatedCustomer.customer_id
            ? updatedCustomer
            : cust
        )
      );
      setSuccessMessage("Customer updated successfully!");
      setShowEditModal(false);
      await fetchCustomers();
    } catch (err: any) {
      setError(err.message || "Failed to edit customer");
    }
  };

  const deleteCustomer = async () => {
    if (!customerToDelete) return;
    try {
      const token = getCookieValue();
      const res = await fetch(
        `http://localhost:2700/customers/${customerToDelete}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        throw new Error("Failed to delete customer");
      }
      setDataCust((prev) =>
        prev.filter((cust) => cust.customer_id !== customerToDelete)
      );
      setSuccessMessage("Customer deleted successfully!");
    } catch (err) {
      setError("Failed to delete customer. Please try again.");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleDeleteClick = (customerId: string, customer_name: string) => {
    setCustomerToDelete(customerId);
    setCustomerName(customer_name);
    setShowDeleteModal(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const changePage = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset ke halaman pertama
  };

  // Handle sort column dan order
  const handleSort = (column: keyof Customer) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  // Filter dan sort data
  const filteredData = dataCust
    .filter((customer) => {
      const query = searchQuery.toLowerCase();
      return (
        customer.customer_name.toLowerCase().includes(query) ||
        customer.customer_email.toLowerCase().includes(query) ||
        customer.customer_phone.includes(searchQuery)
      );
    })
    .sort((a, b) => {
      if (!sortColumn) return 0; // Tidak ada sorting jika kolom tidak dipilih
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      if (typeof valA === "string" && typeof valB === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }

      return 0; // Default jika tipe tidak cocok
    });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="row">
      <div className="col-lg-12">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="container mt-5">
                {successMessage && (
                  <div className="alert alert-success">{successMessage}</div>
                )}
                {user?.role === "admin" && (
                  <div style={{ marginBottom: "20px" }}>
                    <Button
                      className="btn btn-primary"
                      onClick={() => setShowCreateModal(true)}
                    >
                      Tambah Data Customer
                    </Button>
                  </div>
                )}
                <div className="col-md-6" style={{ marginBottom: "20px" }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name, email, or phone"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
                <h5>Customer List</h5>
                <table className="table table-datatable">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th
                        onClick={() => handleSort("customer_name")}
                        style={{ cursor: "pointer" }}
                      >
                        Name{" "}
                        {sortColumn === "customer_name" &&
                          (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        onClick={() => handleSort("customer_email")}
                        style={{ cursor: "pointer" }}
                      >
                        Email{" "}
                        {sortColumn === "customer_email" &&
                          (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        onClick={() => handleSort("customer_phone")}
                        style={{ cursor: "pointer" }}
                      >
                        Phone{" "}
                        {sortColumn === "customer_phone" &&
                          (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th>Status</th>
                      {user?.role === "admin" && <th>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((customer, index) => (
                      <tr key={customer.customer_id}>
                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td>{customer.customer_name}</td>
                        <td>{customer.customer_email}</td>
                        <td>
                          {user?.role !== "admin"
                            ? "*".repeat(customer.customer_phone.length) 
                            : customer.customer_phone}{" "}
                        </td>
                        <td>{customer.status === 1 ? "Inactive" : "Active"}</td>
                        {user?.role === "admin" && (
                          <td>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => {
                                setEditingCustomer(customer);
                                setShowEditModal(true);
                              }}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            &nbsp;
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() =>
                                handleDeleteClick(
                                  customer.customer_id,
                                  customer.customer_name
                                )
                              }
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="pagination mt-3">
                  <nav>
                    <ul className="pagination">
                      {[...Array(totalPages).keys()].map((page) => (
                        <li
                          key={page}
                          className={`page-item ${
                            page + 1 === currentPage ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => changePage(page + 1)}
                          >
                            {page + 1}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Create Customer */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{
              customer_name: "",
              customer_email: "",
              customer_phone: "",
            }}
            validationSchema={customerSchema}
            onSubmit={handleCreateCustomer}
          >
            {({ touched, errors, isSubmitting }) => (
              <FormikForm>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Name<span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Field
                    type="text"
                    name="customer_name"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="customer_name"
                    component="div"
                    className="text-danger"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Email<span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Field
                    type="email"
                    name="customer_email"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="customer_email"
                    component="div"
                    className="text-danger"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Phone<span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Field
                    type="text"
                    name="customer_phone"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="customer_phone"
                    component="div"
                    className="text-danger"
                  />
                </Form.Group>
                <Modal.Footer>
                  <Button
                    variant="secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create"}
                  </Button>
                </Modal.Footer>
              </FormikForm>
            )}
          </Formik>
        </Modal.Body>
      </Modal>

      {/* Modal Edit Customer */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingCustomer && (
            <Formik
              initialValues={{
                customer_name: editingCustomer.customer_name,
                customer_email: editingCustomer.customer_email,
                customer_phone: editingCustomer.customer_phone,
              }}
              validationSchema={customerSchema}
              onSubmit={handleEditCustomer}
            >
              {({ touched, errors, isSubmitting }) => (
                <FormikForm>
                  <Form.Group className="mb-3">
                    <Form.Label>Name </Form.Label>
                    <Field
                      type="text"
                      name="customer_name"
                      className="form-control"
                    />
                    <ErrorMessage
                      name="customer_name"
                      component="div"
                      className="text-danger"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Field
                      type="email"
                      name="customer_email"
                      className="form-control"
                    />
                    <ErrorMessage
                      name="customer_email"
                      component="div"
                      className="text-danger"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Field
                      type="text"
                      name="customer_phone"
                      className="form-control"
                    />
                    <ErrorMessage
                      name="customer_phone"
                      component="div"
                      className="text-danger"
                    />
                  </Form.Group>
                  <Modal.Footer>
                    <Button
                      variant="secondary"
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Updating..." : "Update"}
                    </Button>
                  </Modal.Footer>
                </FormikForm>
              )}
            </Formik>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal Konfirmasi Delete */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{customer_name}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button onClick={deleteCustomer}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
