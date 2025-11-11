import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ContentArea from './ContentArea';
import './MainLayout.css';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="main-layout">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="main-layout-body">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <ContentArea sidebarOpen={sidebarOpen} />
      </div>
    </div>
  );
}

