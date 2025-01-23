"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import Swal from "sweetalert2";

// Dinamis loading untuk komponen Header, Sidebar, Footer, dan HeaderHref
const HeaderView = dynamic(() => import("./header"), { ssr: false });
const FooterView = dynamic(() => import("./footer"), { ssr: false });
const SidebarView = dynamic(() => import("./sidebar"), { ssr: false });
const HeaderHref = dynamic(() => import("./header-href"), { ssr: false });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Menandai bahwa layout telah selesai dimuat
    setIsLoaded(true);
  }, []);


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
    <div>
      {pathname === "/" || pathname === "/register" ? (
        <>
          <link
            rel="stylesheet"
            href="/mylibrary/assets/vendor/bootstrap/css/bootstrap.min.css"
          />
          <link
            rel="stylesheet"
            href="/mylibrary/assets/vendor/bootstrap-icons/bootstrap-icons.css"
          />
          <link
            rel="stylesheet"
            href="/mylibrary/assets/vendor/boxicons/css/boxicons.min.css"
          />
          <link
            rel="stylesheet"
            href="/mylibrary/assets/vendor/quill/quill.snow.css"
          />
          <link
            rel="stylesheet"
            href="/mylibrary/assets/vendor/quill/quill.bubble.css"
          />
          <link
            rel="stylesheet"
            href="/mylibrary/assets/vendor/remixicon/remixicon.css"
          />
          <link
            rel="stylesheet"
            href="/mylibrary/assets/vendor/simple-datatables/style.css"
          />
          <link rel="stylesheet" href="/mylibrary/assets/css/style.css" />
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
          />
          <main>{children}</main>
          <FooterView />
        </>
      ) : (
        <>
          <link
            rel="stylesheet"
            href="/mylibrary/assets/vendor/bootstrap/css/bootstrap.min.css"
          />
          <link
            rel="stylesheet"
            href="/mylibrary/assets/vendor/bootstrap-icons/bootstrap-icons.css"
          />
          <link
            rel="stylesheet"
            href="/mylibrary/assets/vendor/boxicons/css/boxicons.min.css"
          />
          <link
            rel="stylesheet"
            href="/mylibrary/assets/vendor/quill/quill.snow.css"
          />
          <link
            rel="stylesheet"
            href="/mylibrary/assets/vendor/quill/quill.bubble.css"
          />
          <link
            rel="stylesheet"
            href="/mylibrary/assets/vendor/remixicon/remixicon.css"
          />
          <link
            rel="stylesheet"
            href="/mylibrary/assets/vendor/simple-datatables/style.css"
          />
          <link rel="stylesheet" href="/mylibrary/assets/css/style.css" />
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
          />
          <header
            id="header"
            className="header fixed-top d-flex align-items-center"
          >
            <div className="d-flex align-items-center justify-content-between">
              <a href="#" className="logo d-flex align-items-center">
                <img
                  src="/mylibrary/assets/img/logo.png"
                  alt="NiceAdmin Logo"
                  className="logo-img"
                />
                <span className="d-none d-lg-block">NiceAdmin</span>
              </a>
              <i className="bi bi-list toggle-sidebar-btn"></i>
            </div>
          </header>
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
          <main id="main" className="main">
            {children}
          </main>
          <FooterView />
        </>
      )}
    </div>
  );
}
