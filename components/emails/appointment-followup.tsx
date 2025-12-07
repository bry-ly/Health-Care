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

interface AppointmentFollowupProps {
  patientName: string;
  doctorName: string;
  appointmentDate: string; // Formatted date string
}

export function AppointmentFollowup({
  patientName = "Patient",
  doctorName = "Doctor",
  appointmentDate = "December 8, 2024",
}: AppointmentFollowupProps) {
  return (
    <Html>
      <Head />
      <Preview>Thank You for Your Visit - Dr. {doctorName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Thank You for Your Visit</Heading>

          <Text style={text}>Hello {patientName},</Text>

          <Text style={text}>
            Thank you for visiting Dr. {doctorName} on {appointmentDate}. We
            hope your appointment went well!
          </Text>

          <Section style={feedbackBox}>
            <Text style={feedbackTitle}>
              <strong>How was your experience?</strong>
            </Text>
            <Text style={feedbackText}>
              Your feedback helps us improve our services. Please don&apos;t
              hesitate to share any comments with us.
            </Text>
          </Section>

          <Text style={text}>
            <strong>Important Reminders:</strong>
          </Text>
          <ul style={list}>
            <li style={listItem}>
              Follow any instructions or treatment plans provided by your doctor
            </li>
            <li style={listItem}>
              Take any prescribed medications as directed
            </li>
            <li style={listItem}>
              Schedule any recommended follow-up appointments
            </li>
            <li style={listItem}>
              Contact us if you have any questions or concerns
            </li>
          </ul>

          <Text style={mutedText}>
            If you need to book a follow-up appointment, you can do so through
            our online portal.
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

export default AppointmentFollowup;

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

const feedbackBox = {
  backgroundColor: "#f0fff0",
  borderLeft: "4px solid #4CAF50",
  borderRadius: "8px",
  padding: "15px",
  margin: "20px 0",
};

const feedbackTitle = {
  color: "#333",
  fontSize: "16px",
  margin: "0 0 10px 0",
};

const feedbackText = {
  color: "#333",
  fontSize: "16px",
  margin: "0",
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
