import React, { useState, useEffect } from "react";
import { db } from "../DB/DB";
import { collection, getDocs } from "firebase/firestore";
import * as XLSX from "xlsx";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import "../Reporte.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Reporte() {
  const [clicks, setClicks] = useState([]);
  const [filteredClicks, setFilteredClicks] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const clicksCollection = collection(db, "Clicks");
      const clicksSnapshot = await getDocs(clicksCollection);
      const clicksData = clicksSnapshot.docs.map((doc) => doc.data());
      setClicks(clicksData);
      setFilteredClicks(clicksData);
    };

    fetchData();
  }, []);

  const handleDateFilter = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (startDate) {
      // Convert start date to UTC
      start.setUTCHours(0, 0, 0, 0);
    }

    if (endDate) {
      // Convert end date to UTC and set to end of day
      end.setUTCHours(23, 59, 59, 999);
    }

    const filtered = clicks.filter((click) => {
      const clickDate = click.clickDate.toDate(); // Asumiendo que clickDate es un Timestamp de Firestore
      return (!startDate || clickDate >= start) && (!endDate || clickDate <= end);
    });

    setFilteredClicks(filtered);
  };

  const downloadExcel = async (includeFilters) => {
    // Verificar si las fechas están vacías para ajustar el nombre del archivo
    const fileName = includeFilters
      ? (startDate || endDate)
        ? `Reporte_de_visitas_${startDate ? startDate.replace(/-/g, "") : "start"}_a_${endDate ? endDate.replace(/-/g, "") : "end"}.xlsx`
        : "Reporte_de_visitas_Historico.xlsx"
      : "Reporte_de_visitas_Historico.xlsx";

    // Si no se incluyen filtros, usar todos los clics
    const dataToExport = includeFilters ? filteredClicks : clicks;

    // Transformar los datos para incluir solo el nombre del servicio y el número de clicks
    const groupedClicks = dataToExport.reduce((acc, click) => {
      acc[click.serviceName] = (acc[click.serviceName] || 0) + 1;
      return acc;
    }, {});

    const formattedData = Object.keys(groupedClicks).map(serviceName => ({
      "Nombre del Servicio": serviceName,
      "Número de visitas": groupedClicks[serviceName]
    }));

    // Crear un archivo Excel con ExcelJS
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Reporte de visitas");

    // Agregar encabezados
    worksheet.addRow(["Nombre del Servicio", "Número de visitas"]);

    // Agregar datos
    formattedData.forEach((data) => {
      worksheet.addRow([data["Nombre del Servicio"], data["Número de visitas"]]);
    });

    // Estilos básicos
    worksheet.getCell('A1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'aae0ac' }
    };
    worksheet.getCell('B1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'aae0ac' }
    };

    // Descargar el archivo Excel
    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(new Blob([buffer]), fileName);
    });
  };

  const groupedClicks = filteredClicks.reduce((acc, click) => {
    acc[click.serviceName] = (acc[click.serviceName] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(groupedClicks),
    datasets: [
      {
        label: "Número de Clicks",
        data: Object.values(groupedClicks),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="reporte">
      <h2 className="reporte-title">Reporte de visitas</h2>
      <div className="date-filters">
        <div className="date-filter">
          <label>Fecha Inicio</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="date-filter">
          <label>Fecha Fin</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button className="filter-button" onClick={handleDateFilter}>
          Filtrar
        </button>
      </div>
      <div className="chart-container">
        <Bar data={chartData} />
      </div>
      <table className="report-table">
        <thead>
          <tr>
            <th>Nombre del Servicio</th>
            <th>Número de visitas</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(groupedClicks).map((serviceName) => (
            <tr key={serviceName}>
              <td>{serviceName}</td>
              <td>{groupedClicks[serviceName]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="buttons-container">
        <button className="download-button" onClick={() => downloadExcel(true)}>
          Descargar Reporte
        </button>
        <button className="download-button" onClick={() => downloadExcel(false)}>
          Descargar Histórico
        </button>
      </div>
    </div>
  );
}

export default Reporte;
