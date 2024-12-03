// Reporte.js
import React, { useState, useEffect } from "react";
import { db } from "../../data/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Bar } from "react-chartjs-2";

import styled from "styled-components";
import { SectionHeading } from "../misc/Headings";

import tw from "twin.macro";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
const Heading = styled(SectionHeading)`
  ${tw`z-20`}/* Asegúrate de que el encabezado tenga un z-index adecuado */
`;

const ReporteContainer = tw.div`py-8 lg:py-12 max-w-screen-lg mx-auto flex flex-col gap-8 `;

const DateFilters = tw.div`flex flex-col sm:flex-row sm:justify-between items-center mb-6 gap-4`;
const DateFilter = tw.div`flex flex-col`;
const DateInput = tw.input`border border-gray-300 rounded-lg p-2 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#fdb86a] focus:border-transparent transition-colors duration-300`;
const FilterButton = tw.button`bg-[#fdb86a] text-[#333] py-2 px-6 rounded-lg transition-colors hover:bg-[#f8a940] focus:outline-none focus:ring-2 focus:ring-[#f8a940] focus:ring-opacity-50 font-bold`;

const ChartContainer = styled.div`
  ${tw`relative`}
  canvas {
    width: 100% !important;
    max-width: 750px;
    height: 350px;
  }
`;

const Table = tw.table`min-w-full bg-white border border-gray-200 mt-6`;
const TableHeader = tw.thead`bg-[#fdb86a] text-[#333] font-bold`;
const TableBody = tw.tbody`text-gray-800`;

const TableHeaderCell = tw.th`py-2 px-4 text-left border-b border-gray-200 font-semibold`;
const TableDataCell = tw.td`py-2 px-4 border-b border-gray-200`;

const ButtonsContainer = tw.div`flex justify-center gap-4 mt-8`;

function Reporte() {
  const [clicks, setClicks] = useState([]);
  const [filteredClicks, setFilteredClicks] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const clicksCollection = collection(db, "Clicks");
      const q = query(clicksCollection, where("activo", "==", 1));
      const clicksSnapshot = await getDocs(q);
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
      start.setUTCHours(0, 0, 0, 0);
    }

    if (endDate) {
      end.setUTCHours(23, 59, 59, 999);
    }

    const filtered = clicks.filter((click) => {
      const clickDate = click.clickDate.toDate();
      const isDateInRange =
        (!startDate || clickDate >= start) && (!endDate || clickDate <= end);
      return isDateInRange && click.activo === 1;
    });

    setFilteredClicks(filtered);
  };

  const downloadExcel = async (includeFilters) => {
    const fileName = includeFilters
      ? startDate || endDate
        ? `Reporte_de_visitas_${
            startDate ? startDate.replace(/-/g, "") : "start"
          }_a_${endDate ? endDate.replace(/-/g, "") : "end"}.xlsx`
        : "Reporte_de_visitas_Historico.xlsx"
      : "Reporte_de_visitas_Historico.xlsx";

    const dataToExport = includeFilters ? filteredClicks : clicks;

    const groupedClicks = dataToExport.reduce((acc, click) => {
      acc[click.serviceName] = (acc[click.serviceName] || 0) + 1;
      return acc;
    }, {});

    const formattedData = Object.keys(groupedClicks).map((serviceName) => ({
      "Nombre del Servicio": serviceName,
      "Número de visitas": groupedClicks[serviceName],
    }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Reporte de visitas");

    worksheet.addRow(["Nombre del Servicio", "Número de visitas"]);
    formattedData.forEach((data) => {
      worksheet.addRow([
        data["Nombre del Servicio"],
        data["Número de visitas"],
      ]);
    });
    worksheet.columns = [
      { key: "A", width: 25 },
      { key: "B", width: 20 },
    ];

    worksheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFB300" },
    };
    worksheet.getCell("B1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFB300" },
    };

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
        label: "Número de visitas",
        data: Object.values(groupedClicks),
        backgroundColor: "#FFC107",
        borderColor: "#FF9800",
        borderWidth: 1,
      },
    ],
  };

  return (
    <ReporteContainer>
      <Heading>Reporte de visitas</Heading>
      <DateFilters>
        <DateFilter>
          <label>Fecha Inicio</label>
          <DateInput
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </DateFilter>
        <DateFilter>
          <label>Fecha Fin</label>
          <DateInput
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </DateFilter>
        <FilterButton onClick={handleDateFilter}>Filtrar</FilterButton>
      </DateFilters>
      <ChartContainer>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { position: "top" } },
          }}
        />
      </ChartContainer>
      <Table>
        <TableHeader>
          <tr>
            <TableHeaderCell>Nombre del Servicio</TableHeaderCell>
            <TableHeaderCell>Número de visitas</TableHeaderCell>
          </tr>
        </TableHeader>
        <TableBody>
          {Object.entries(groupedClicks).map(([serviceName, count]) => (
            <tr key={serviceName}>
              <TableDataCell>{serviceName}</TableDataCell>
              <TableDataCell>{count}</TableDataCell>
            </tr>
          ))}
        </TableBody>
      </Table>
      <ButtonsContainer>
        <FilterButton onClick={() => downloadExcel(true)}>
          Descargar Reporte
        </FilterButton>
        <FilterButton onClick={() => downloadExcel(false)}>
          Descargar Histórico
        </FilterButton>
      </ButtonsContainer>
    </ReporteContainer>
  );
}

export default Reporte;
