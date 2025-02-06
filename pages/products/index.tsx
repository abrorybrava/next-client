"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Modal, Button, Form } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { Formik, Field, Form as FormikForm, ErrorMessage } from "formik";
import "select2/dist/css/select2.min.css";
import "select2/dist/js/select2.min.js";
import { getCookieValue } from "@/middleware";
import { productSchema } from "@/utils/validationSchema";
import Select from "react-select";
import { formatRupiah } from "@/utils/helpers";
import ExportToPDFButton from "./export-pdf";
import ExcelDropdown from "./excel-ddl-button";

interface Product {
  product_id: string;
  product_name: string;
  price: number;
  product_qty: number;
  category: string;
  product_status: number;
  product_price: number;
  categories: Category[];
  images:[];
  category_name: string
}

interface Category {
  category_id: string;
  category_name: string;
}

export default function ProductsViewResult() {
  const [dataProd, setDataProd] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;
  const [successMessage, setSuccessMessage] = useState<string>("");
  const searchParams = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [product_name, setProductName] = useState<string>("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<keyof Product | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const router = useRouter();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = getCookieValue();
      const res = await fetch("http://localhost:2700/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.status}`);
      }
      const data: Product[] = await res.json();
      console.log(data);
      setDataProd(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = getCookieValue();
      const res = await fetch("http://localhost:2700/categories", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch categories: ${res.status}`);
      }
      const data: Category[] = await res.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    if (searchParams && searchParams.get("success") === "true") {
      setSuccessMessage("Product created successfully!");
    }
  }, [searchParams]);

  const handleCreateProduct = async (values: {
    product_name: string;
    product_price: number;
    product_qty: number;
    product_status: number;
    categories: number[];
    images?: File[];
  }) => {
    try {
      const token = getCookieValue(); // Ambil token dari cookie
      const formData = new FormData();

      // Tambahkan data produk ke FormData
      formData.append("product_name", values.product_name);
      formData.append("product_price", values.product_price.toString());
      formData.append("product_qty", values.product_qty.toString());
      formData.append("product_status", values.product_status.toString());
      values.categories.forEach((categoryId) =>
        formData.append("categories[]", categoryId.toString())
      );

      // Tambahkan file gambar jika ada
      if (values.images) {
        values.images.forEach((image) => {
          formData.append("product_img", image);
        });
      }

      // Kirim request ke backend
      const res = await fetch("http://localhost:2700/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Tambahkan token
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to create product");
      }

      const newProduct = await res.json();
      setDataProd((prev) => [...prev, newProduct.data]);
      setSuccessMessage("Product created successfully!");
      setShowCreateModal(false);
      await fetchProducts();
    } catch (err: any) {
      setError(err.message || "Failed to create product");
    }
  };

  const handleEditProduct = async (values: {
    product_name: string;
    product_price: number;
    product_qty: number;
    product_status: number;
    categories: number[];
    product_img?:File[];
  }) => {
    if (!editingProduct) return;
  
    try {
      const token = getCookieValue(); // Pastikan fungsi ini bekerja dengan benar untuk mendapatkan token
      const formData = new FormData();

      // Tambahkan data produk ke FormData
      formData.append("product_name", values.product_name);
      formData.append("product_price", values.product_price.toString());
      formData.append("product_qty", values.product_qty.toString());
      formData.append("product_status", values.product_status.toString());
      values.categories.forEach((categoryId) =>
        formData.append("categories[]", categoryId.toString())
      );

      // Tambahkan file gambar jika ada
      if (values.product_img) {
        values.product_img.forEach((image) => {
          formData.append("product_img", image);
        });
      }
      const res = await fetch(
        `http://localhost:2700/products/${editingProduct.product_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body:
            formData,
        }
      );
  
      if (!res.ok) {
        throw new Error("Failed to edit product");
      }
      console.log(categories)
  
      const updatedProduct: Product = await res.json();
      setDataProd((prev) =>
        prev.map((prod) =>
          prod.product_id === updatedProduct.product_id ? updatedProduct : prod
        )
      );
      setSuccessMessage("Product updated successfully!");
      setShowEditModal(false);
      await fetchProducts();
      await fetchCategories(); // Pastikan fungsi ini tersedia untuk memperbarui kategori
    } catch (err: any) {
      setError(err.message || "Failed to edit product");
    }
  };
  

  const handleCreateCategory = async (values: { category_name: string }) => {
    try {
      const token = getCookieValue();

      // Cek apakah token tersedia
      if (!token) {
        throw new Error("Authentication token is missing");
      }

      const res = await fetch("http://localhost:2700/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category_name: values.category_name }),
      });

      // Cek apakah respons berhasil
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create category");
      }

      // Parse respons JSON dan pastikan tipe data sesuai
      const newCategory: Category = await res.json();

      // Periksa apakah prev adalah array sebelum mencoba untuk menyebarkannya
      setCategories((prev) => {
        if (Array.isArray(prev)) {
          return [...prev, newCategory]; // Jika prev adalah array, tambahkan kategori baru
        }
        return [newCategory]; // Jika prev bukan array, buat array baru dengan kategori
      });

      setSuccessMessage("Category created successfully!");
      setShowCategoryModal(false);
      fetchProducts();
    } catch (err: any) {
      // Tangani error secara lebih detail
      setError(
        err.message || "An unknown error occurred while creating the category"
      );
    }
  };

  const deleteCustomer = async () => {
    if (!productToDelete) return;
    try {
      const token = getCookieValue();
      const res = await fetch(
        `http://localhost:2700/products/${productToDelete}`,
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
      setDataProd((prev) =>
        prev.filter((prod) => prod.product_id !== productToDelete)
      );
      setSuccessMessage("Customer deleted successfully!");
    } catch (err) {
      setError("Failed to delete customer. Please try again.");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleDeleteClick = (product_id: string, product_name: string) => {
    setProductToDelete(product_id);
    setProductName(product_name);
    setShowDeleteModal(true);
  };

  const changePage = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset ke halaman pertama
  };

  // Handle sort column dan order
  const handleSort = (column: keyof Product) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  // Filter dan sort data
  const filteredData = dataProd
    .filter((product) => {
      const query = searchQuery.toLowerCase();
      return (
        product.product_name.toLowerCase().includes(query) ||
        product.categories.some((category) => // Pencarian di nama kategori
        category.category_name.toLowerCase().includes(query)) ||
        product.product_price?.toString().includes(query) || 
        product.product_qty?.toString().includes(query)
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

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: any) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setFieldValue("images", files);

    // Generate preview URLs
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);

  };

  useEffect(() => {
    if (!showCreateModal && !showEditModal) {
      // Reset previews when both modals are closed
      setImagePreviews([]);
    }
  }, [showCreateModal, showEditModal]);
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
                <div style={{ marginBottom: "20px" }}>
                  <Button
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                  >
                    Tambah Data Produk
                  </Button>
                  &nbsp;
                  <Button
                    className="btn btn-secondary"
                    onClick={() => setShowCategoryModal(true)}
                  >
                    Tambah Kategori
                  </Button>
                  &nbsp;
                  <ExportToPDFButton/>
                  &nbsp;
                  <ExcelDropdown />
                </div>
                <div className="col-md-6" style={{ marginBottom: "20px" }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name, price, or category"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
                <h5>Product List</h5>
                <table className="table table-datatable">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th
                        onClick={() => handleSort("product_name")}
                        style={{ cursor: "pointer" }}
                      >
                        Name{" "}
                        {sortColumn === "product_name" &&
                          (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        onClick={() => handleSort("category")}
                        style={{ cursor: "pointer" }}
                      >
                        Category{" "}
                        {sortColumn === "category" &&
                          (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        onClick={() => handleSort("product_price")}
                        style={{ cursor: "pointer" }}
                      >
                        Price{" "}
                        {sortColumn === "product_price" &&
                          (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        onClick={() => handleSort("product_qty")}
                        style={{ cursor: "pointer" }}
                      >
                        Quantity{" "}
                        {sortColumn === "product_qty" &&
                          (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((product, index) => (
                      <tr key={product.product_id}>
                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td>{product.product_name}</td>
                        <td>
                          {product.categories &&
                            product.categories
                              .map((category) => category.category_name)
                              .join(", ")}
                        </td>
                        <td>{formatRupiah(product.product_price.toString())}</td>
                        <td>{product.product_qty}</td>
                        <td>{product.product_status === 1 ? "Active" : "Inactive"}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              setEditingProduct(product);
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
                                product.product_id,
                                product.product_name
                              )
                            }
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
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

      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Create Product</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Formik
          initialValues={{
            product_name: "",
            product_price: 0,
            product_qty: 0,
            product_status: 1,
            categories: [],
            images: [],
          }}
          validationSchema={productSchema}
          onSubmit={handleCreateProduct}
        >
          {({ touched, errors, isSubmitting, setFieldValue }) => (
            <FormikForm>
              {/* Nama Produk */}
              <Form.Group className="mb-3">
                <Form.Label>
                  Name<span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Field
                  type="text"
                  name="product_name"
                  className={`form-control ${
                    touched.product_name && errors.product_name
                      ? "is-invalid"
                      : ""
                  }`}
                />
                <ErrorMessage
                  name="product_name"
                  component="div"
                  className="text-danger"
                />
              </Form.Group>

              {/* Harga Produk */}
              <Form.Group className="mb-3">
                <Form.Label>
                  Price<span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Field
                  type="number"
                  name="product_price"
                  className={`form-control ${
                    touched.product_price && errors.product_price
                      ? "is-invalid"
                      : ""
                  }`}
                />
                <ErrorMessage
                  name="product_price"
                  component="div"
                  className="text-danger"
                />
              </Form.Group>

              {/* Kuantitas Produk */}
              <Form.Group className="mb-3">
                <Form.Label>
                  Quantity<span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Field
                  type="number"
                  name="product_qty"
                  className={`form-control ${
                    touched.product_qty && errors.product_qty
                      ? "is-invalid"
                      : ""
                  }`}
                />
                <ErrorMessage
                  name="product_qty"
                  component="div"
                  className="text-danger"
                />
              </Form.Group>

              {/* Kategori Produk */}
              <Form.Group className="mb-3">
                <Form.Label>
                  Category<span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Select
                  isMulti
                  options={categories.map((cat) => ({
                    value: cat.category_id,
                    label: cat.category_name,
                  }))}
                  className="react-select"
                  classNamePrefix="react-select"
                  onChange={(selectedOptions) =>
                    setFieldValue(
                      "categories",
                      selectedOptions.map((option) => option.value)
                    )
                  }
                />
                <ErrorMessage
                  name="categories"
                  component="div"
                  className="text-danger"
                />
              </Form.Group>

              {/* Gambar Produk */}
              <Form.Group className="mb-3">
                <Form.Label>Product Images</Form.Label>
                <input
                  type="file"
                  multiple
                  className="form-control"
                  onChange={(e) => handleImageChange(e, setFieldValue)}
                />
              </Form.Group>

              {/* Preview Gambar */}
              {imagePreviews.length > 0 && (
                <div className="mb-3">
                  <Form.Label>Preview Images:</Form.Label>
                  <div className="d-flex flex-wrap gap-2">
                    {imagePreviews.map((preview, index) => (
                      <img
                        key={index}
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid #ddd",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Tombol Aksi */}
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

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingProduct && (
          <Formik
            initialValues={{
              product_name: editingProduct.product_name || "",
              product_price: editingProduct.product_price || 0,
              product_qty: editingProduct.product_qty || 0,
              product_status: editingProduct.product_status || 1,
              categories: [],
              images: [], // tidak perlu menyertakan gambar lama karena gambar baru akan di-upload
            }}
            validationSchema={productSchema}
            onSubmit={handleEditProduct}
          >
            {({ touched, errors, isSubmitting, setFieldValue }) => (
              <FormikForm>
                {/* Nama Produk */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    Name<span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Field
                    type="text"
                    name="product_name"
                    className={`form-control ${
                      touched.product_name && errors.product_name
                        ? "is-invalid"
                        : ""
                    }`}
                  />
                  <ErrorMessage
                    name="product_name"
                    component="div"
                    className="text-danger"
                  />
                </Form.Group>

                {/* Harga Produk */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    Price<span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Field
                    type="number"
                    name="product_price"
                    className={`form-control ${
                      touched.product_price && errors.product_price
                        ? "is-invalid"
                        : ""
                    }`}
                  />
                  <ErrorMessage
                    name="product_price"
                    component="div"
                    className="text-danger"
                  />
                </Form.Group>

                {/* Kuantitas Produk */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    Quantity<span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Field
                    type="number"
                    name="product_qty"
                    className={`form-control ${
                      touched.product_qty && errors.product_qty
                        ? "is-invalid"
                        : ""
                    }`}
                  />
                  <ErrorMessage
                    name="product_qty"
                    component="div"
                    className="text-danger"
                  />
                </Form.Group>

                {/* Status Produk */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    Status<span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Field
                    as="select"
                    name="product_status"
                    className={`form-control ${
                      touched.product_status && errors.product_status
                        ? "is-invalid"
                        : ""
                    }`}
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </Field>
                  <ErrorMessage
                    name="product_status"
                    component="div"
                    className="text-danger"
                  />
                </Form.Group>

                {/* Kategori Produk */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    Category<span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Select
                    isMulti
                    options={categories.map((cat) => ({
                      value: cat.category_id,
                      label: cat.category_name,
                    }))}
                    className="react-select"
                    classNamePrefix="react-select"
                    onChange={(selectedOptions) =>
                      setFieldValue(
                        "categories",
                        selectedOptions.map((option) => option.value)
                      )
                    }
                  />
                  <ErrorMessage
                    name="categories"
                    component="div"
                    className="text-danger"
                  />
                </Form.Group>

                {/* Gambar Produk */}
                <Form.Group className="mb-3">
                  <Form.Label>Product Images</Form.Label>
                  <input
                    type="file"
                    multiple
                    className="form-control"
                    onChange={(e) => handleImageChange(e, setFieldValue)}
                  />
                </Form.Group>

              {/* Preview Gambar */}
              {imagePreviews.length > 0 && (
                <div className="mb-3">
                  <Form.Label>Preview Images:</Form.Label>
                  <div className="d-flex flex-wrap gap-2">
                    {imagePreviews.map((preview, index) => (
                      <img
                        key={index}
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid #ddd",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

                {/* Tombol Aksi */}
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
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </Modal.Footer>
              </FormikForm>
            )}
          </Formik>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal Add Category */}
      <Modal
        show={showCategoryModal}
        onHide={() => setShowCategoryModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{
              category_name: "",
            }}
            onSubmit={handleCreateCategory}
          >
            {({ touched, errors, isSubmitting }) => (
              <FormikForm>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Category Name<span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Field
                    type="text"
                    name="category_name"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="category_name"
                    component="div"
                    className="text-danger"
                  />
                </Form.Group>
                <Modal.Footer>
                  <Button
                    variant="secondary"
                    onClick={() => setShowCategoryModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding..." : "Add"}
                  </Button>
                </Modal.Footer>
              </FormikForm>
            )}
          </Formik>
        </Modal.Body>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{product_name}</strong>?
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
