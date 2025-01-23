import * as yup from "yup";

export const customerSchema = yup.object().shape({
  customer_name: yup.string().required("Customer name is required"),
  customer_email: yup
    .string()
    .email("Invalid email format")
    .required("Customer email is required"),
  customer_phone: yup.string().nullable(),
});

export const productSchema = yup.object().shape({
  product_name: yup.string().required("Product name is required"),
  product_price: yup
    .number()
    .positive("Product price must be a positive number")
    .required("Product price is required"),
  product_qty: yup
    .number()
    .integer("Product quantity must be integer")
    .positive("Product quantity must be positive")
    .required("Product quantity is required"),
});

export const registerSchema = yup.object().shape({
  name: yup.string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must not exceed 50 characters")
    .required("Name is required"),
  email: yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required("Confirm Password is required"),
});

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .min(3, "Email must be at least 3 characters")
    .max(20, "Email must not exceed 20 characters")
    .email("Invalid email format!")
    .required("Email is required"),
  password: yup
    .string()
    .required("Password is required"),
});
