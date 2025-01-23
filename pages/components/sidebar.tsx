"use client";
import React from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";

export default function SidebarView() {
  const router = useRouter();

  const deleteCookie = (name: string) => {
    // Set cookie with an expiration date in the past to delete it
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  };

  const getCookieValue = (name: string): string | null => {
    // Retrieve all cookies as a string
    const cookieString = document.cookie;

    // Split cookies by ';' to get individual cookies
    const cookies = cookieString.split(";");

    // Search for the cookie that matches the provided name
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + "=")) {
        // Extract the token value by slicing the string after '='
        return cookie.substring(name.length + 1); // Return token value
      }
    }

    // If cookie is not found, return null
    return null;
  };

  // Function to handle logout
  const handleLogout = () => {
    const token = getCookieValue("token");
    deleteCookie("token");
    router.push("/");
  };

  // Function to show SweetAlert confirmation
  const showLogoutConfirmation = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your session!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        handleLogout(); // Perform logout
        Swal.fire("Logged Out!", "Your session has been ended.", "success");
      }
    });
  };

  return (
    <aside id="sidebar" className="sidebar">
      <ul className="sidebar-nav" id="sidebar-nav">
        <li className="nav-item">
          <a className="nav-link collapsed" href="/dashboard">
            <i className="bi bi-house"></i>
            <span>Home</span>
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link collapsed" href="/products">
            <i className="bi bi-book"></i>
            <span>Product</span>
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link collapsed" href="/customers">
            <i className="bi bi-person"></i>
            <span>Customers</span>
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link collapsed" href="/order-view">
            <i className="bi bi-bag"></i>
            <span>Order</span>
          </a>
        </li>
      </ul>
      <ul className="sidebar-nav" id="sidebar-nav">
        <li className="nav-item" style={{ cursor: "pointer" }}>
          <a
            className="nav-link collapsed"
            onClick={showLogoutConfirmation} // Show SweetAlert when clicked
          >
            <i className="bi bi-box-arrow-left"></i>
            <span>Logout</span>
          </a>
        </li>
      </ul>
    </aside>
  );
}
