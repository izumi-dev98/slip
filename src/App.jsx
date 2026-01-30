import { useState, useRef } from "react";
import * as XLSX from "xlsx";

/* ---------- Company Name ---------- */
const COMPANY_NAME = "ABC Technology Co., Ltd";

/* ---------- Excel Format Preview ---------- */
function ExcelFormatPreview() {
  return (
    <div className="max-w-7xl mx-auto mb-6 bg-white border rounded-xl shadow-sm p-4 no-print">
      <h2 className="text-lg font-semibold mb-2">Excel Format (Required)</h2>
      <p className="text-sm text-gray-500 mb-3">
        Excel file must contain the following columns
      </p>

      <table className="w-full text-sm border rounded overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            {[
              "Name",
              "EmployeeID",
              "Department",
              "PayslipMonth",
              "PayslipDate",
              "Basic",
              "HRA",
              "Allowance",
              "Deductions",
              "NetPay",
            ].map((h) => (
              <th key={h} className="border px-2 py-2 text-left">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-gray-600">
          <tr className="hover:bg-gray-50 transition">
            <td className="border px-2 py-1">Nay Myo Maung</td>
            <td className="border px-2 py-1">EMP001</td>
            <td className="border px-2 py-1">SSM</td>
            <td className="border px-2 py-1">November 2024</td>
            <td className="border px-2 py-1">2024-11-30</td>
            <td className="border px-2 py-1">280000</td>
            <td className="border px-2 py-1">0</td>
            <td className="border px-2 py-1">0</td>
            <td className="border px-2 py-1">5600</td>
            <td className="border px-2 py-1">274400</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Small Row ---------- */
const Row = ({ label, value, negative }) => (
  <div className={`flex justify-between ${negative ? "text-red-600" : ""}`}>
    <span>{label}</span>
    <span className="font-medium">{value ?? 0}</span>
  </div>
);

/* ---------- Payslip Card ---------- */
function Payslip({ emp, companyName }) {
  const dateFormatted = emp.PayslipDate
    ? new Date(emp.PayslipDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div
      className="
        w-[300px] bg-white border border-black p-4 text-[13px] 
        shadow-sm transition-all duration-300
        hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]
        print:shadow-none print:scale-100 print:translate-y-0
      "
    >
      {/* Company Name + Payslip Date */}
      <div className="text-center mb-2">
        <h2 className="text-base font-bold uppercase">{companyName}</h2>
        <p className="text-xs text-gray-500">Payslip Date: {dateFormatted}</p>
      </div>

      {/* Month Badge */}
      <div className="text-center mb-2">
        <span className="inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
          {emp.PayslipMonth}
        </span>
      </div>

      

      {/* Staff Info */}
      <div className="space-y-1 mb-2">
        <Row label="Staff Name" value={emp.Name} />
        <Row label="Employee ID" value={emp.EmployeeID} />
        <Row label="Department" value={emp.Department} />
      </div>

      <hr className="my-2" />

      {/* Earnings */}
      <div className="font-semibold mb-1 text-gray-700">Earnings</div>
      <div className="space-y-1">
        <Row label="Basic Salary" value={emp.Basic} />
        <Row label="HRA" value={emp.HRA} />
        <Row label="Allowance" value={emp.Allowance} />
      </div>

      <hr className="my-2" />

      {/* Deductions */}
      <div className="font-semibold mb-1 text-gray-700">Deductions</div>
      <Row label="Total Deduction" value={emp.Deductions} negative />

      <hr className="my-2" />

      {/* Net Salary */}
      <div className="flex justify-between items-center bg-gradient-to-r from-teal-600 to-emerald-500 text-white px-3 py-2 rounded-lg font-bold">
        <span>Net Salary</span>
        <span>{emp.NetPay}</span>
      </div>
    </div>
  );
}

/* ---------- Button Component ---------- */
const Btn = ({ children, ...props }) => (
  <button
    {...props}
    className="
      px-4 py-2 rounded-lg font-medium
      bg-blue-600 text-white
      hover:bg-blue-700
      active:scale-95
      transition-all duration-200
      disabled:opacity-40 disabled:cursor-not-allowed
    "
  >
    {children}
  </button>
);

/* ---------- Main App ---------- */
export default function App() {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const printRef = useRef();

  const handleFileUpload = (e) => {
    const reader = new FileReader();
    reader.readAsBinaryString(e.target.files[0]);
    reader.onload = (e) => {
      const wb = XLSX.read(e.target.result, { type: "binary" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      setData(XLSX.utils.sheet_to_json(sheet));
      setCurrentPage(1);
    };
  };

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(start, start + itemsPerPage);

  const handlePrint = () => {
    document.body.innerHTML = printRef.current.innerHTML;
    window.print();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto mb-4 no-print">
        <h1 className="text-3xl font-bold text-gray-800">Payslip Generator</h1>
        <p className="text-sm text-gray-500">
          Generate employee payslips directly from Excel
        </p>
      </div>

      <ExcelFormatPreview />

      <div className="max-w-7xl mx-auto mb-4 no-print">
        <input
          type="file"
          accept=".xls,.xlsx"
          onChange={handleFileUpload}
          className="
            block w-full text-sm bg-white border rounded-lg p-2
            file:mr-4 file:px-4 file:py-2
            file:border-0 file:bg-blue-600 file:text-white
            hover:file:bg-blue-700
          "
        />
      </div>

      {data.length > 0 && (
        <div className="max-w-7xl mx-auto flex justify-between items-center mb-4 no-print">
          <div className="flex gap-2">
            <Btn onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
              Prev
            </Btn>
            <span className="px-3 py-2 bg-white border rounded-lg">
              {currentPage} / {totalPages}
            </span>
            <Btn onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
              Next
            </Btn>
          </div>

          <Btn onClick={handlePrint}>Print All</Btn>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-wrap gap-6 no-print">
        {currentData.map((emp, i) => (
          <Payslip key={i} emp={emp} companyName={COMPANY_NAME} />
        ))}
      </div>

      <div ref={printRef} className="hidden">
        <div className="flex flex-wrap gap-6">
          {data.map((emp, i) => (
            <Payslip key={i} emp={emp} companyName={COMPANY_NAME} />
          ))}
        </div>
      </div>
    </div>
  );
}
