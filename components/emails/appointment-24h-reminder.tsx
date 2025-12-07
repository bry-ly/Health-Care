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

interface Appointment24hReminderProps {
  patientName: string;
  doctorName: string;
  appointmentDate: string; // Formatted date string
  appointmentTime: string; // Formatted time string
  appointmentType?: string;
}

export function Appointment24hReminder({
  patientName = "Patient",
  doctorName = "Doctor",
  appointmentDate = "Monday, December 9, 2024",
  appointmentTime = "10:00 AM",
  appointmentType,
}: Appointment24hReminderProps) {
  return (
    <Html>
      <Head />
      <Preview>Appointment Reminder - Tomorrow with Dr. {doctorName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Appointment Reminder</Heading>

          <Text style={text}>Hello {patientName},</Text>

          <Text style={text}>
            This is a friendly reminder that you have an appointment scheduled
            for <strong>tomorrow</strong>.
          </Text>

          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>Doctor:</strong> Dr. {doctorName}
            </Text>
            <Text style={infoText}>
              <strong>Date:</strong> {appointmentDate}
            </Text>
            <Text style={infoText}>
              <strong>Time:</strong> {appointmentTime}
            </Text>
            {appointmentType && (
              <Text style={infoText}>
                <strong>Type:</strong> {appointmentType}
              </Text>
            )}
          </Section>

          <Text style={text}>
            <strong>Important:</strong>
          </Text>
          <ul style={list}>
            <li style={listItem}>
              Please arrive 10-15 minutes before your scheduled time
            </li>
            <li style={listItem}>
              Bring any relevant medical documents or test results
            </li>
            <li style={listItem}>
              If you need to reschedule, please do so as soon as possible
            </li>
          </ul>

          <Text style={mutedText}>
            If you have any questions or need to make changes to your
            appointment, please contact us.
          </Text>

          <Text style={signoff}>
            Best regards,
            <br />
            Healthcare Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default Appointment24hReminder;

// Styles
const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px",
  maxWidth: "600px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "30px 0 20px",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "10px 0",
};

const infoBox = {
  backgroundColor: "#f4f4f4",
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
};

const infoText = {
  color: "#333",
  fontSize: "16px",
  margin: "5px 0",
};

const mutedText = {
  color: "#666",
  fontSize: "14px",
  margin: "20px 0",
};

const list = {
  margin: "10px 0",
  paddingLeft: "20px",
};

const listItem = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "5px 0",
};

const signoff = {
  color: "#333",
  fontSize: "16px",
  marginTop: "30px",
};
