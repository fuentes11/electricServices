// MantenimientoReporte.js
import React from 'react';
import {Mantenimiento }from './Mantenimiento';
import {MantenimientoGaleria} from './MantenimientoGaleria ';
import MaintenanceReviews from './MaintenanceReviews';
import Contactar from './MaintenanceContact';

import Reporte from './Reporte';
import styled from 'styled-components';
import tw from 'twin.macro';

const FullWidthContainer = styled.div`
  ${tw`w-full min-h-screen bg-[#fff]`} /* Fondo que cubre toda la pantalla */
`;

const ContentContainer = tw.div`py-16 lg:py-20 min-h-screen mx-auto`;

function MantenimientoReporte() {
  return (
    <FullWidthContainer>
      <ContentContainer>
        <Mantenimiento />
        <MantenimientoGaleria />
        <MaintenanceReviews />
        <Contactar />
        <Reporte />
      </ContentContainer>
    </FullWidthContainer>
  );
}

export default MantenimientoReporte;
