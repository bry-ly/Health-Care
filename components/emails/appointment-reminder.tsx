import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { format } from "date-fns";

interface AppointmentReminderEmailProps {
  patientName: string;
  doctorName: string;
  appointmentDate: Date;
  timeSlot: string;
}

export const AppointmentReminderEmail = ({
  patientName,
  doctorName,
  appointmentDate,
  timeSlot,
}: AppointmentReminderEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reminder: You have an upcoming appointment</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Appointment Reminder</Heading>
          <Text style={text}>Dear {patientName},</Text>
          <Text style={text}>This is a reminder that you have an upcoming appointment.</Text>
          
          <Section style={box}>
            <Text style={label}>Doctor:</Text>
            <Text style={value}>{doctorName}</Text>
            
            <Text style={label}>Date:</Text>
            <Text style={value}>{format(appointmentDate, "EEEE, MMMM d, yyyy")}</Text>
            
            <Text style={label}>Time:</Text>
            <Text style={value}>{timeSlot}</Text>
          </Section>

          <Text style={text}>
            Please arrive 10 minutes before your scheduled appointment time.
          </Text>
          <Text style={text}>
            If you need to reschedule or cancel, please contact us as soon as possible.
          </Text>
          
          <Text style={footer}>
            Best regards,<br />
            Healthcare Appointment System
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const h1 = {
  color: "#f59e0b",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.25",
  marginBottom: "16px",
};

const text = {
  color: "#333333",
  fontSize: "16px",
  lineHeight: "1.6",
  marginBottom: "16px",
};

const box = {
  backgroundColor: "#fef3c7",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  borderLeft: "4px solid #f59e0b",
};

const label = {
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: "600",
  marginBottom: "4px",
  marginTop: "12px",
};

const value = {
  color: "#111827",
  fontSize: "16px",
  marginBottom: "8px",
};

const footer = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "1.6",
  marginTop: "24px",
};

