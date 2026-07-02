import React from 'react';
import AdminSidebar from './AdminSidebar';

/**
 * Layout wrapper for all admin pages.
 * Renders the AdminSidebar on the left and the page content on the right.
 */
export default function AdminLayout({ children }) {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <AdminSidebar />
        <section className="space-y-8 min-w-0">
          {children}
        </section>
      </div>
    </div>
  );
}
