import React from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../helpers/authHelper";

const PrivateRoute = ({ children }) => {
  return isLoggedIn() ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
