import React from "react";

export default function HeaderView() {
  return (
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


    </>
  );
}
