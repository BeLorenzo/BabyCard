'use client';
import PinGate from '../components/admin/PinGate';
import AdminVouchers from '../components/admin/AdminVouchers';
import AdminLibreria from '../components/admin/AdminLibreria';

export default function AdminPanel() {
  return (
    <PinGate>
      <div className="p-8 max-w-4xl mx-auto min-h-screen space-y-12">
        <h1 className="text-3xl font-bold">Pannello di Controllo Segreto 🕵️‍♂️</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <AdminVouchers />
          <AdminLibreria />
        </div>
      </div>
    </PinGate>
  );
}
