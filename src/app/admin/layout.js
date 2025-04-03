// app/admin/layout.jsx
export default function AdminLayout({ children }) {
    return (
      <div className="admin-layout">
        <div className="admin-content">
          {children}
        </div>
      </div>
    );
  }