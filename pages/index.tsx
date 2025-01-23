"use client";

import React, { useState } from "react";
import { useRouter } from "next/router";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { loginSchema } from "@/utils/validationSchema";
import { NextRequest } from "next/server";

export default function RootLayout() {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (values: { email: string; password: string }) => {
    const { email, password } = values;

    setLoading(true);
    setErrorMessage(""); // Reset error message

    try {
      const response = await fetch("http://localhost:2700/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Pastikan cookies dikirim dan diterima
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      console.log("data ", data);

      console.log("Login successful, cookies set by server.");

      router.push("/dashboard"); // Redirect ke dashboard
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center">
            <div className="d-flex justify-content-center py-4">
              <a
                href="index.html"
                className="logo d-flex align-items-center w-auto"
              >
                <img src="assets/img/logo.png" alt="" />
                <span className="d-none d-lg-block">NiceAdmin</span>
              </a>
            </div>

            <div className="card mb-3">
              <div className="card-body">
                <div className="pt-4 pb-2">
                  <h5 className="card-title text-center pb-0 fs-4">
                    Login to Your Account
                  </h5>
                  <p className="text-center small">
                    Enter your email & password to login
                  </p>
                </div>

                <Formik
                  initialValues={{ email: "", password: "" }}
                  validationSchema={loginSchema}
                  onSubmit={handleLogin}
                >
                  {({ isSubmitting }) => (
                    <Form className="row g-3 needs-validation">
                      <div className="col-12">
                        <label className="form-label">Email</label>
                        <Field
                          type="text"
                          name="email"
                          className="form-control"
                          id="yourUsername"
                          autoComplete="off"
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
                          id="yourPassword"
                        />
                        <ErrorMessage
                          name="password"
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
                          {loading ? "Logging in..." : "Login"}
                        </button>
                      </div>
                      <div className="col-12">
                        <p className="small mb-0">
                          Don't have an account?{" "}
                          <a href="/register">Register</a>
                        </p>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
