import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface ExpiredRentalEmailProps {
  username: string;
  rentals: {
    settled: boolean;
    datePaid: string;
    businessId: string;
    rentalNumber: string;
    startDate: string;
    endDate: string;
    id: string;
    unit: string;
    totalAmount: string;
  }[];
  supportEmail: string;
}

const baseUrl = process.env.BASE_URL
  ? `https://${process.env.BASE_URL}`
  : "";

export const Email = ({
  username,
  rentals,
  supportEmail,
}: ExpiredRentalEmailProps) => {
  const previewText = `Your rental(s) have expired.`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px] text-center">
              <Img
                src={`${baseUrl}/rental.png`}
                width="60"
                height="57"
                alt="Company Logo"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Expired Rental Notification
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {username},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              The following rental(s) have expired. You can review the details
              and take action by clicking the buttons below:
            </Text>

            {rentals.map((rental, index) => (
              <Section key={index} className="border border-solid border-[#eaeaea] rounded p-[16px] mb-[16px]">
                <Heading className="text-black text-[18px] font-semibold mb-[5px]">
                  Rental {rental.rentalNumber}
                </Heading>
                <Text className="text-black text-[14px] leading-[24px]">
                  <strong>Unit:</strong> {rental.unit}
                </Text>
                <Text className="text-black text-[14px] leading-[24px]">
                  <strong>Start Date:</strong> {rental.startDate}
                </Text>
                <Text className="text-black text-[14px] leading-[24px]">
                  <strong>End Date:</strong> {rental.endDate}
                </Text>
                <Text className="text-black text-[14px] leading-[24px] mb-[10px]">
                  <strong>Total Amount:</strong> {rental.totalAmount}
                </Text>
                <Text className="text-black text-[14px] leading-[24px] mb-[10px]">
                  <strong>Payment Status:</strong> {rental.settled?"Settled":"Not Settled"}
                </Text>
                <Text className="text-black text-[14px] leading-[24px] mb-[10px]">
                  <strong>Date of Paid:</strong> {rental.datePaid}
                </Text>
                <Button
                  className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                  href={`${baseUrl}/${rental.businessId}/rentals/${rental.id}/view`}
                >
                  View Rental
                </Button>
              </Section>
            ))}

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-black text-[14px] leading-[24px]">
              If you have any questions or need further assistance, please feel
              free to{" "}
              <Link
                href={`mailto:${supportEmail}`}
                className="text-blue-600 no-underline"
              >
                contact us
              </Link>
              .
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Thank you for choosing our service!
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default Email;
