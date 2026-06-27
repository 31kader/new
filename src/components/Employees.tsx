import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, Phone, Mail, UserCog, TrendingUp, Trash2, Lock, Printer, Camera, FileText, Image, CheckSquare
} from 'lucide-react';
import { format } from 'date-fns';
import bcrypt from 'bcryptjs';
import { supabase } from '../supabase';
import { auth, handleDatabaseError, OperationType, convertKeysToSnake } from '../database';
import { 
  Employee, Transaction, AttendanceRecord, AdvanceRecord, 
  CompanySettings, UserProfile
} from '../types';
import { Card, ConfirmDialog, SortableHeader } from './ui';
import { cn } from '../lib/utils';
import { getApiUrl } from '../lib/api';

// Import modular employee sub-tabs and components
import { AttendanceTab } from './employees/AttendanceTab';
import { AdvancesTab } from './employees/AdvancesTab';
import { TeamManagement } from './employees/TeamManagement';
import { PerformanceSummary } from './employees/PerformanceSummary';
import { EmployeeCard } from './employees/EmployeeCard';
import { RecruitmentModal } from './employees/RecruitmentModal';


export { TeamManagement };
import { useEmployeesLogic, EmployeesProps } from './useEmployeesLogic';

export const Employees = memo(function Employees(props: EmployeesProps) {
  const { 
    employees, 
    transactions, 
    attendance, 
    advances, 
    settings, 
    users, 
    setIsAddUserModalOpen 
  } = props;

  const {
    handleSubmit,
    isModalOpen,
    setIsModalOpen,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    employeeToDelete,
    setEmployeeToDelete,
    editingEmployee,
    setEditingEmployee,
    hrTab,
    setHrTab,
    formData,
    setFormData,
    recruitmentTab,
    setRecruitmentTab,
    cameraActiveSection,
    setCameraActiveSection,
    isSignDrawing,
    setIsSignDrawing,
    signatureSaved,
    setSignatureSaved,
    sortConfig,
    setSortConfig,
    requestSort,
    sortedEmployeesPerformance,
    employeePerformance,
    handleDeleteEmployee,
    handlePrintDossier,
    confirmDelete,
    stopCamera,
    startCamera,
    takePhoto,
    videoRef,
    handleFileUpload,
    clearCanvas,
    canvasRef,
    startDrawing,
    drawSign,
    endDrawing,
    saveSignature
  } = useEmployeesLogic(props);

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
            Personnel<span className="text-indigo-500">.nexus</span>
          </h2>
          <p className="text-[10px] font-black text-white/30 tracking-[0.2em] uppercase mt-1">Management & Access Control</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-white/5 p-1.5 rounded-[1.5rem] border border-white/10 backdrop-blur-md overflow-x-auto">
            {[
              { id: 'info', label: 'EMPLOYÉS' },
              { id: 'team', label: 'COMPTES' },
              { id: 'permissions', label: 'RÔLES' },
              { id: 'attendance', label: 'POINTAGE' },
              { id: 'advances', label: 'ACOMPTES' }
            ].map(tab => (
              <button 
                key={tab.id}
                type="button"
                onClick={() => setHrTab(tab.id as any)} 
                className={cn(
                  "px-6 py-2.5 rounded-[1.2rem] text-[10px] font-black tracking-widest transition-all whitespace-nowrap", 
                  hrTab === tab.id ? "bg-indigo-600 text-white shadow-neon-indigo" : "text-white/40 hover:text-white/70 hover:bg-white/5"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button 
            type="button"
            onClick={() => { setEditingEmployee(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] hover:bg-indigo-500 hover:text-white transition-all shadow-xl active:scale-95 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" /> 
            NOUVEL EMPLOYÉ
          </button>
        </div>
      </div>

      {hrTab === 'info' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Performance Summary Section */}
          <PerformanceSummary
            sortedEmployeesPerformance={sortedEmployeesPerformance}
            employeePerformance={employeePerformance}
            sortConfig={sortConfig}
            requestSort={requestSort}
            settings={settings}
          />

          {/* Grid of employees */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {employees.map((employee: Employee, idx: number) => {
              const perf = employeePerformance[employee.id] || { totalSales: 0, transactionCount: 0 };
              return (
                <EmployeeCard
                  key={`emp-card-${employee.id}`}
                  employee={employee}
                  perf={perf}
                  settings={settings}
                  idx={idx}
                  handleDeleteEmployee={handleDeleteEmployee}
                  handlePrintDossier={handlePrintDossier}
                  setEditingEmployee={setEditingEmployee}
                  setIsModalOpen={setIsModalOpen}
                />
              );
            })}
          </div>
        </motion.div>
      )}

      {hrTab === 'attendance' && <AttendanceTab attendance={attendance} employees={employees} users={users} advances={advances} settings={settings} />}
      {hrTab === 'advances' && <AdvancesTab advances={advances} employees={employees} settings={settings} />}
      {hrTab === 'team' && <TeamManagement users={users} employees={employees} settings={settings} setIsAddUserModalOpen={setIsAddUserModalOpen} defaultSubTab="users" />}
      {hrTab === 'permissions' && <TeamManagement users={users} employees={employees} settings={settings} setIsAddUserModalOpen={setIsAddUserModalOpen} defaultSubTab="permissions" />}

      <ConfirmDialog 
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Supprimer l'employé"
        message={`Êtes-vous sûr de vouloir supprimer ${employeeToDelete?.name} ? Cette action supprimera son profil employé mais pas son compte d'accès s'il en a un.`}
      />

      <RecruitmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingEmployee={editingEmployee}
        handleSubmit={handleSubmit}
        recruitmentTab={recruitmentTab}
        setRecruitmentTab={setRecruitmentTab}
        formData={formData}
        setFormData={setFormData}
        settings={settings}
        cameraActiveSection={cameraActiveSection}
        startCamera={startCamera}
        stopCamera={stopCamera}
        takePhoto={takePhoto}
        videoRef={videoRef}
        handleFileUpload={handleFileUpload}
        clearCanvas={clearCanvas}
        canvasRef={canvasRef}
        startDrawing={startDrawing}
        drawSign={drawSign}
        endDrawing={endDrawing}
        saveSignature={saveSignature}
      />
    </div>
  );
});

