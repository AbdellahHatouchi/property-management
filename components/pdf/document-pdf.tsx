/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/no-unescaped-entities */
import { Page, Text, View, Document, Font, Image } from '@react-pdf/renderer'
import { createTw } from 'react-pdf-tailwind'
import Feiled from './Feild'
import { format } from 'date-fns'
import { Property, RentalProperty, Tenant, Unit } from '@prisma/client'
import LawsPage from './LawsPage'

// Register the fonts from the public directory
Font.register({
  family: 'ui-sans-serif',
  fonts: [
    { src: '/font/OpenSans_Condensed-Regular.ttf' },
    { src: '/font/OpenSans_Condensed-Bold.ttf', fontWeight: 'bold' }
  ]
})
interface DocumentPDFProps {
  rentalData: RentalProperty & {
    tenant: Tenant;
    property: Property & {
      units: Unit[];
    };
    business: {
      name: string;
    }
  };
}

export const tw = createTw({
  theme: {
    extend: {
      colors: {
        custom: '#bada55'
      }
    }
  }
})

const DocumentPDF: React.FC<DocumentPDFProps> = ({ rentalData }) => {
  const { tenant, property } = rentalData;

  // Assume that `startDate` and `endDate` exist and calculate rental duration
  const rentalDurationDays = (new Date(rentalData.endDate).getTime() - new Date(rentalData.startDate).getTime()) / (1000 * 3600 * 24);

  return (
    <Document>
      <Page style={tw('p-12 font-sans')} size={'A4'}>
        {/* Header Section */}
        <View style={tw('flex flex-row justify-between items-center')}>
          <Image src={'/img.png'} style={tw('w-32 h-32')} />
          <View style={tw('flex flex-col justify-center items-center')}>
            <Text style={tw('font-bold text-4xl uppercase leading-5 m-0')}>{rentalData.business.name}</Text>
            <Text style={tw('font-semibold uppercase text-base m-0')}>Property Management</Text>
            <Text style={tw('font-normal uppercase m-0 text-xl')}>
              Rental Contract
            </Text>
            <Text style={tw('text-lg uppercase m-0')}>Property Management</Text>
          </View>
          <Image src={'/img.png'} style={tw('w-32 h-32')} />
        </View>

        {/* Rental Details Section */}
        <View style={tw('flex justify-between mt-5 mb-2')}>
          <Text style={tw('text-center text-sm flex-1')}>Contract No: {rentalData.rentalNumber}</Text>
          <Text style={tw('text-right text-sm')}>Date: {format(rentalData.createdAt, 'dd / MM / yyyy')}</Text>
        </View>

        {/* Tenant Details */}
        <View style={tw('flex flex-row gap-2')}>
          <View style={tw('flex-1 bg-gray-100')}>
            <Text style={tw('text-center text-xl border border-black rounded-md bg-gray-200')}>Tenant</Text>
            <View style={tw('p-4')}>
              <Feiled label="Name: " value={tenant.name} />
              <Feiled label="CIN/Passport: " value={tenant.cinOrPassport} />
              <Feiled label="Phone: " value={tenant.phoneNumber} />
              <Feiled label="Email: " value={tenant.email} />
              <Feiled label="Address: " value={tenant.address} />
              <Feiled label="Date of Birth: " value={format(tenant.dateOfBirth, 'dd / MM / yyyy')} />
            </View>
          </View>

          {/* Property Details */}
          <View style={tw('flex-1 bg-gray-100')}>
            <Text style={tw('text-center text-xl border border-black rounded-md bg-gray-200')}>Property</Text>
            <View style={tw('p-4')}>
              <Feiled label="Name: " value={property.name} />
              <Feiled label="Address: " value={property.address} />
              <Feiled label="Type: " value={property.type} />
              <Feiled label="Rental Unit: " value={rentalData.unit} />
              <Feiled label="Rental Period: " value={`${format(rentalData.startDate, 'dd / MM / yyyy')} - ${format(rentalData.endDate, 'dd / MM / yyyy')}`} />
              <Feiled label="Duration: " value={`${rentalDurationDays} Day(s)`} />
              <Feiled label="Rental Cost: " value={`${rentalData.rentalCost} MAD`} />
              <Feiled label="Total Amount: " value={`${rentalData.totalAmount} MAD`} />
            </View>
          </View>
        </View>
        {/* Payment Details */}
        <View style={tw('flex flex-grow flex-row gap-2')}>
          <View style={tw('flex-1 bg-gray-100')}>
            <Text style={tw('text-center text-xl border border-black rounded-md bg-gray-200')}>Payment</Text>
            <View style={tw('p-4')}>
              <Feiled label="Payment Status: " value={rentalData.settled ? 'Settled' : 'Not Settled'} />
              <Feiled label="Date of Paid: " value={rentalData.datePaid ? format(rentalData.datePaid, 'dd / MM / yyyy') : '------'} />
            </View>
          </View>
        </View>

        {/* Additional Sections like Fees, Signatures, etc. */}
        <View style={tw('flex flex-row gap-2 mt-2')}>
          <View style={[tw('flex-1 p-4 bg-gray-100 border border-black rounded-md'), { height: 70 }]}>
            <Text style={tw('text-sm')}>I acknowledge having read the general rental conditions and agree to comply with them.</Text>
          </View>
          <View style={[tw('flex-1 p-4 bg-gray-100 border border-black rounded-md'), { height: 70 }]}>
            <Text style={tw('text-sm font-semibold')}>
              Remarks: <Text style={tw('text-sm font-normal')}>-----</Text>
            </Text>
          </View>
        </View>

        <View style={tw('flex flex-row gap-2 my-2')}>
          <View style={tw('flex-1 p-1 bg-gray-100 border border-black rounded-md')}>
            <View style={tw('flex flex-row')}>
              <View style={[tw('flex-1 border-r border-black'), { height: 70 }]}>
                <Text style={tw('text-sm p-1 font-semibold')}>Tenant Signature:</Text>
              </View>
              <View style={[tw('flex-1'), { height: 70 }]}>
                <Text style={tw('text-sm p-1 font-semibold')}>Agency Signature:</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer Section */}
        <View style={tw('flex flex-row justify-center items-center w-full py-1 bg-black-200 rounded')}>
          <Text style={tw('text-white text-base')}>Business Address | Tel: Your Contact Info</Text>
        </View>
        <View style={tw('flex justify-between mt-5')}>
          <Text style={tw('text-center text-base')} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
          <Text style={tw('text-right text-sm')}>Generated by Your Management System</Text>
        </View>
      </Page>
      <LawsPage/>
    </Document>
  );
};


export default DocumentPDF
