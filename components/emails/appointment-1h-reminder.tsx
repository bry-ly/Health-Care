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

interface Appointment1hReminderProps {
  patientName: string;
  doctorName: string;
  appointmentTime: string; // Formatted time string
}

export function Appointment1hReminder({
  patientName = "Patient",
  doctorName = "Doctor",
  appointmentTime = "10:00 AM",
}: Appointment1hReminderProps) {
  return (
    <Html>
      <Head />
      <Preview>⏰ Your Appointment is in 1 Hour - Dr. {doctorName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⏰ Your Appointment is in 1 Hour</Heading>

          <Text style={text}>Hello {patientName},</Text>

          <Text style={text}>
            This is a quick reminder that your appointment with{" "}
            <strong>Dr. {doctorName}</strong> is coming up in about 1 hour at{" "}
            <strong>{appointmentTime}</strong>.
          </Text>

          <Section style={alertBox}>
            <Text style={alertText}>
              Please make sure you&apos;re on your way or ready for your
              appointment!
            </Text>
          </Section>

          <Text style={mutedText}>We look forward to seeing you soon.</Text>

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

export default Appointment1hReminder;

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

const alertBox = {
  backgroundColor: "#e7f3ff",
  borderLeft: "4px solid #2196F3",
  borderRadius: "8px",
  padding: "15px",
  margin: "20px 0",
};

const alertText = {
  color: "#333",
  fontSize: "16px",
  margin: "0",
};

const mutedText = {
  color: "#666",
  fontSize: "14px",
  margin: "20px 0",
};

const signoff = {
  color: "#333",
  fontSize: "16px",
  marginTop: "30px",
};
