import { useState, useRef } from "react";
import * as XLSX from "xlsx";

/* ---------- Company Name ---------- */
const COMPANY_NAME = "ABC Technology Co., Ltd";

/* ---------- Excel Format Preview ---------- */
function ExcelFormatPreview() {
  const headers = [
    "EmployeeID",
    "Name",
    "Department",
    "Position",
    "JoinDate",
    "Days",
    "HalfShiftDuty",
    "Leave",
    "UnpaidLeave",
    "OvertimeRate",
    "OvertimeHour",
    "BasicSalary",
    "HalfShiftRate",
    "SalaryAddition",
    "OtherAddition",
    "Allowance",
    "SSB",
    "EPF",
    "Uniform",
    "OtherDeduction",
    "PayslipMonth",
    "PayslipDate",
  ];

  return (
    <div className="max-w-7xl mx-auto mb-6 bg-white border rounded-xl p-4 no-print">
      <h2 className="text-lg font-semibold mb-2">Excel Format (Required)</h2>
      <table className="w-full text-xs border">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((h) => (
              <th key={h} className="border px-2 py-1 text-left">
                {h}
              </th>
            ))}
          </tr>
        </thead>
      </table>
    </div>
  );
}

/* ---------- Small Row ---------- */
const Row = ({ label, value, negative }) => (
  <div className={`flex justify-between ${negative ? "text-red-600" : ""}`}>
    <span>{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

/* ---------- Payslip Card ---------- */
function Payslip({ emp, companyName }) {
  const dateFormatted = emp.PayslipDate
    ? new Date(emp.PayslipDate).toLocaleDateString("en-GB")
    : "";

  return (
    <div className="w-[320px] bg-white border border-black p-4 text-[13px]">
      <div className="text-center mb-2">
        <h2 className="font-bold uppercase text-sm">{companyName}</h2>
        <p className="text-xs text-gray-500">Payslip Date: {dateFormatted}</p>
      </div>

      <div className="text-center mb-2">
        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
          {emp.PayslipMonth}
        </span>
      </div>

      <div className="space-y-1 mb-2">
        <Row label="Name" value={emp.Name} />
        <Row label="Employee ID" value={emp.EmployeeID} />
        <Row label="Department" value={emp.Department} />
        <Row label="Position" value={emp.Position} />
        <Row label="Join Date" value={emp.JoinDate} />
      </div>

      <hr className="my-2" />

      <div className="font-semibold text-gray-700 mb-1">Attendance</div>
      <Row label="Working Days" value={emp.Days} />
      <Row label="Half Shift Duty" value={emp.HalfShiftDuty} />
      <Row label="Leave" value={emp.Leave} />
      <Row label="Unpaid Leave" value={emp.UnpaidLeave} />

      <hr className="my-2" />

      <div className="font-semibold text-gray-700 mb-1">Earnings</div>
      <Row label="Basic Salary" value={emp.BasicSalary} />
      <Row label="OT Pay" value={emp.otPay} />
      <Row label="Half Shift Pay" value={emp.HalfShiftRate} />
      <Row label="Salary Addition" value={emp.SalaryAddition} />
      <Row label="Other Addition" value={emp.OtherAddition} />
      <Row label="Allowance" value={emp.Allowance} />
      <Row label="Total Pay" value={emp.totalPay} />

      <hr className="my-2" />

      <div className="font-semibold text-gray-700 mb-1">Deductions</div>
      <Row label="SSB" value={emp.SSB} negative />
      <Row label="EPF" value={emp.EPF} negative />
      <Row label="Uniform" value={emp.Uniform} negative />
      <Row label="Other Deduction" value={emp.OtherDeduction} negative />
      <Row label="Total Deduction" value={emp.totalDeduction} negative />

      <hr className="my-2" />

      <div className="flex justify-between bg-emerald-600 text-white px-3 py-2 rounded font-bold">
        <span>Net Salary</span>
        <span>{emp.netSalary}</span>
      </div>
    </div>
  );
}

/* ---------- Button ---------- */
const Btn = ({ children, ...props }) => (
  <button
    {...props}
    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
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

    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = wb.Sheets[wb.SheetNames[0]];

      const raw = XLSX.utils.sheet_to_json(sheet, { defval: 0 });

      const cleaned = raw.map((r) => {
        const otPay = Number(r.OvertimeRate) * Number(r.OvertimeHour);

        const totalPay =
          Number(r.BasicSalary) +
          otPay +
          Number(r.HalfShiftRate) +
          Number(r.SalaryAddition) +
          Number(r.OtherAddition) +
          Number(r.Allowance);

        const totalDeduction =
          Number(r.SSB) +
          Number(r.EPF) +
          Number(r.Uniform) +
          Number(r.OtherDeduction);

        const netSalary = totalPay - totalDeduction;

        return {
          ...r,
          otPay,
          totalPay,
          totalDeduction,
          netSalary,
        };
      });

      setData(cleaned);
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
      <h1 className="text-3xl font-bold mb-2">Payslip Generator</h1>

      <ExcelFormatPreview />

      <input
        type="file"
        accept=".xls,.xlsx"
        onChange={handleFileUpload}
        className="mb-4"
      />

      {data.length > 0 && (
        <div className="flex justify-between mb-4">
          <Btn onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
            Prev
          </Btn>
          <span>
            {currentPage} / {totalPages}
          </span>
          <Btn
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
            }
          >
            Next
          </Btn>
          <Btn onClick={handlePrint}>Print All</Btn>
        </div>
      )}

      <div className="flex flex-wrap gap-6">
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
