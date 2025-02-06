"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getCookieValue } from "@/middleware";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { Formik, Field, Form, FieldArray, ErrorMessage } from "formik";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { formatDate } from "@/utils/helpers";
import ReactPaginate from "react-paginate";
import ExportPDFButton from "./export-pdf-orders";

interface Order {
  order_id: number;
  customer_name: string;
  order_date: Date;
  total_price: string;
}

interface OrderDetail {
  order_detail_id: number;
  product_name: string;
  quantity: number;
  price_per_unit: string;
}

interface Product {
  product_id: number;
  product_name: string;
  product_price: number;
}

interface Customer {
  customer_id: number;
  customer_name: string;
}

export default function OrdersViewResult() {
  const router = useRouter();
  const [dataOrders, setDataOrders] = useState<Order[]>([]);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showOrderDetailsModal, setShowOrderDetailsModal] =
    useState<boolean>(false);
  const [showCreateOrderModal, setShowCreateOrderModal] =
    useState<boolean>(false); // For Create Order Modal
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [customerId, setCustomerId] = useState("");
  const [orderDetailsInput, setOrderDetailsInput] = useState<
    { product_id: number; quantity: number }[]
  >([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [itemsPerPage] = useState<number>(5);

  const searchParams = useSearchParams();

  // Fetch customers and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, productsRes] = await Promise.all([
          fetch("http://localhost:2700/customers", {
            headers: {
              Authorization: `Bearer ${getCookieValue()}`,
            },
          }),
          fetch("http://localhost:2700/products", {
            headers: {
              Authorization: `Bearer ${getCookieValue()}`,
            },
          }),
        ]);

        if (!customersRes.ok || !productsRes.ok) {
          throw new Error("Failed to fetch customers or products");
        }

        const customersData = await customersRes.json();
        const productsData = await productsRes.json();

        setCustomers(customersData);
        setProducts(productsData);
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      }
    };

    fetchData();

    if (searchParams.get("success") === "true") {
      setSuccessMessage("Order created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  }, [searchParams]);

  const validationSchema = Yup.object().shape({
    customer_id: Yup.number()
      .required("Please select a customer")
      .typeError("Please select a valid customer"),
    orderDetails: Yup.array()
      .of(
        Yup.object().shape({
          product_id: Yup.number()
            .required("Please select a product")
            .typeError("Please select a valid product"),
          quantity: Yup.number()
            .min(1, "Quantity must be at least 1")
            .required("Quantity is required"),
        })
      )
      .min(1, "At least one product must be added"),
  });

  const handleSubmit = async (
    values: any,
    { setSubmitting, setStatus }: any
  ) => {
    try {
      const response = await fetch("http://localhost:2700/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookieValue()}`,
        },
        body: JSON.stringify({
          customer_id: values.customer_id,
          orderDetails: values.orderDetails,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }
      const respMessage = await response.json();
      setSuccessMessage(respMessage.message);
      setStatus("");
      window.location.reload();
    } catch (err: any) {
      setStatus(err.message || "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = getCookieValue();
      const res = await fetch("http://localhost:2700/orders", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch orders");
      const data: Order[] = await res.json();

      // Implement sorting and searching
      const filteredOrders = data.filter((order) =>
        order.customer_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );

      const sortedOrders = filteredOrders.sort((a, b) => {
        if (sortOrder === "asc") {
          return new Date(a.order_date).getTime() - new Date(b.order_date).getTime();
        } else {
          return new Date(b.order_date).getTime() - new Date(a.order_date).getTime();
        }
      });

      setDataOrders(sortedOrders);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, sortOrder, currentPage]);

  const fetchOrderDetails = async (orderId: number) => {
    try {
      const token = getCookieValue();
      const res = await fetch(`http://localhost:2700/orders/${orderId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch order details");

      const data: OrderDetail[] = await res.json();
      setOrderDetails(data || []);
    } catch (err: any) {
      setError("Failed to fetch order details");
    }
  };

  const handleOpenOrderDetailsModal = (orderId: number) => {
    setSelectedOrderId(orderId);
    fetchOrderDetails(orderId);
    setShowOrderDetailsModal(true);
  };

  const handleCloseOrderDetailsModal = () => {
    setShowOrderDetailsModal(false);
    setOrderDetails([]);
  };

  const formatRupiah = (price: string) => {
    const number = parseFloat(price);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(number);
  };

  const handlePageChange = (selectedPage: { selected: number }) => {
    setCurrentPage(selectedPage.selected);
  };

  // Paginated orders
  const paginatedOrders = dataOrders.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div className="row">
      <div className="col-lg-12">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="container mt-5">
                <div className="container mt-5">
                  {successMessage && (
                    <div className="alert alert-success">{successMessage}</div>
                  )}
                  <Button
                    variant="primary"
                    onClick={() => setShowCreateOrderModal(true)}
                  >
                    Add Order
                  </Button>

                  <div className="mt-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by Customer Name"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <h5 className="mt-3">Order List</h5>
                  <div>
                    <button
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      className="btn btn-secondary"
                    >
                      Sort by Date {sortOrder === "asc" ? "Asc" : "Desc"}
                    </button>
                    &nbsp;
                    <ExportPDFButton/>
                  </div>  

                  <table className="table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Customer Name</th>
                        <th>Order Date</th>
                        <th>Total Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedOrders.map((order, index) => (
                        <tr key={order.order_id}>
                          <td>{index + 1}</td>
                          <td>{order.customer_name}</td>
                          <td>{formatDate(order.order_date)}</td>
                          <td>{formatRupiah(order.total_price)}</td>
                          <td>
                            <Button
                              variant="success"
                              onClick={() =>
                                handleOpenOrderDetailsModal(order.order_id)
                              }
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <ReactPaginate
                    pageCount={Math.ceil(dataOrders.length / itemsPerPage)}
                    pageRangeDisplayed={5}
                    marginPagesDisplayed={2}
                    onPageChange={handlePageChange}
                    containerClassName="pagination"
                    activeClassName="active"
                    previousLabel={"«"}
                    nextLabel={"»"}
                    breakLabel={"..."}
                  />
                </div>

                <Modal
                  show={showOrderDetailsModal}
                  onHide={handleCloseOrderDetailsModal}
                >
                  <Modal.Header closeButton>
                    <Modal.Title>Order Details</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    {orderDetails.length > 0 ? (
                      <table className="table">
                        <thead>
                          <tr>
                            <th>No</th>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price/Unit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderDetails.map((data, index) => (
                            <tr key={data.order_detail_id}>
                              <td>{index + 1}</td>
                              <td>{data.product_name}</td>
                              <td>{data.quantity}</td>
                              <td>{formatRupiah(data.price_per_unit)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p>No details available for this order.</p>
                    )}
                  </Modal.Body>
                </Modal>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Create Order */}
      <Modal
        show={showCreateOrderModal}
        onHide={() => setShowCreateOrderModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{
              customer_id: "",
              orderDetails: [
                { product_id: "", quantity: 1, price_per_unit: 0 },
              ],
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, isSubmitting, setFieldValue, status }) => (
              <Form>
                {status && <div className="alert alert-danger">{status}</div>}

                <div className="mb-3">
                  <label htmlFor="customer_id" className="form-label">
                    Select Customer
                  </label>
                  <Field as="select" name="customer_id" className="form-select">
                    <option value="">-- Select a Customer --</option>
                    {customers.map((customer) => (
                      <option
                        key={customer.customer_id}
                        value={customer.customer_id}
                      >
                        {customer.customer_name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="customer_id"
                    component="div"
                    className="text-danger"
                  />
                </div>

                {/* Order Details */}
                <FieldArray
                  name="orderDetails"
                  render={(arrayHelpers) => (
                    <div>
                      <h4>Order Details</h4>
                      {values.orderDetails.map((_, index) => (
                        <div key={index} className="mb-3">
                          <div className="row">
                            <div className="col-md-5">
                              <label className="form-label">Product</label>
                              <Field
                                as="select"
                                name={`orderDetails.${index}.product_id`}
                                className="form-select"
                                onChange={(
                                  e: React.ChangeEvent<HTMLSelectElement>
                                ) => {
                                  const productId = parseInt(
                                    e.target.value,
                                    10
                                  );
                                  const product = products.find(
                                    (p) => p.product_id === productId
                                  );
                                  setFieldValue(
                                    `orderDetails.${index}.product_id`,
                                    productId
                                  );
                                  setFieldValue(
                                    `orderDetails.${index}.price_per_unit`,
                                    product ? product.product_price : 0
                                  );
                                }}
                              >
                                <option value="">-- Select a Product --</option>
                                {products.map((product) => (
                                  <option
                                    key={product.product_id}
                                    value={product.product_id}
                                  >
                                    {product.product_name} -{" "}
                                    {formatRupiah(
                                      product.product_price.toString()
                                    )}
                                  </option>
                                ))}
                              </Field>
                              <ErrorMessage
                                name={`orderDetails.${index}.product_id`}
                                component="div"
                                className="text-danger"
                              />
                            </div>

                            <div className="col-md-3">
                              <label className="form-label">Quantity</label>
                              <Field
                                type="number"
                                name={`orderDetails.${index}.quantity`}
                                className="form-control"
                                min="1"
                              />
                              <ErrorMessage
                                name={`orderDetails.${index}.quantity`}
                                component="div"
                                className="text-danger"
                              />
                            </div>

                            <div className="col-md-4">
                              <label className="form-label">Price</label>
                              <Field
                                type="text"
                                name={`orderDetails.${index}.price_per_unit`}
                                value={formatRupiah(
                                  (
                                    values.orderDetails[index].quantity *
                                    values.orderDetails[index].price_per_unit
                                  ).toString()
                                )}
                                className="form-control"
                                readOnly
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="secondary"
                        className="mt-3"
                        onClick={() =>
                          arrayHelpers.push({
                            product_id: "",
                            quantity: 1,
                            price_per_unit: 0,
                          })
                        }
                      >
                        Add More Product
                      </Button>
                    </div>
                  )}
                />

                <div className="mt-4">
                  <h4>
                    Total Price:{" "}
                    {formatRupiah(
                      values.orderDetails
                        .reduce(
                          (total, detail: any) =>
                            total + detail.quantity * detail.price_per_unit,
                          0
                        )
                        .toString()
                    )}
                  </h4>
                </div>

                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Order"}
                </Button>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </div>
  );
}
