"use client";

import React, { useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { registerSchema } from "@/utils/validationSchema";

export default function Register() {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (values: {
    email: string;
    password: string;
    name: string;
    role: string;
  }) => {
    const { email, password, name, role } = values;
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:2700/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      window.location.href = "/"; // Redirect to login after successful registration
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="container">
        <div className="row">
          <div className="col-lg-12 col-md-6 d-flex flex-column align-items-center ">
            <div className="card mb-3">
              <div className="card-body">
                <div className="pt-4 pb-2">
                  <h5 className="card-title text-center pb-0 fs-4">
                    Create Your Account
                  </h5>
                  <p className="text-center small">
                    Enter your details to register
                  </p>
                </div>

                <Formik
                  initialValues={{
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    role: "admin",
                  }}
                  validationSchema={registerSchema}
                  onSubmit={handleRegister}
                >
                  {({ isSubmitting }) => (
                    <Form className="row g-3 needs-validation">
                      <div className="col-12">
                        <label className="form-label">Name</label>
                        <Field
                          type="text"
                          name="name"
                          className="form-control"
                        />
                        <ErrorMessage
                          name="name"
                          component="div"
                          className="alert alert-danger"
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">Email</label>
                        <Field
                          type="text"
                          name="email"
                          className="form-control"
                        />
                        <ErrorMessage
                          name="email"
                          component="div"
                          className="alert alert-danger"
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">Password</label>
                        <Field
                          type="password"
                          name="password"
                          className="form-control"
                        />
                        <ErrorMessage
                          name="password"
                          component="div"
                          className="alert alert-danger"
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">Confirm Password</label>
                        <Field
                          type="password"
                          name="confirmPassword"
                          className="form-control"
                        />
                        <ErrorMessage
                          name="confirmPassword"
                          component="div"
                          className="alert alert-danger"
                        />
                      </div>

                      {errorMessage && (
                        <div className="col-12">
                          <div className="alert alert-danger">
                            {errorMessage}
                          </div>
                        </div>
                      )}

                      <div className="col-12">
                        <button
                          className="btn btn-primary w-100"
                          type="submit"
                          disabled={isSubmitting || loading}
                        >
                          {loading ? "Registering..." : "Register"}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
