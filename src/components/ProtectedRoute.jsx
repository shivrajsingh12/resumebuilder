import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While checking authentication
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f7ff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              border: "4px solid #e7e3ff",
              borderTop: "4px solid #5b3df5",
              borderRadius: "50%",
              margin: "0 auto 15px",
              animation: "spin 0.8s linear infinite",
            }}
          />

          <p
            style={{
              margin: 0,
              color: "#555",
              fontSize: "14px",
            }}
          >
            Checking your account...
          </p>

          <style>
            {`
              @keyframes spin {
                from {
                  transform: rotate(0deg);
                }
                to {
                  transform: rotate(360deg);
                }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  // User isn't logged in
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // User is authenticated
  return children;
}