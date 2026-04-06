import { jsPDF } from "jspdf";

export function generateUserGuide() {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageW = 210;
  const pageH = 297;
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = 0;

  const colors = {
    navy:    [29, 37, 67]   as [number, number, number],
    blue:    [17, 130, 227] as [number, number, number],
    dark:    [30, 30, 30]   as [number, number, number],
    mid:     [80, 80, 80]   as [number, number, number],
    light:   [120, 120, 120] as [number, number, number],
    border:  [220, 220, 220] as [number, number, number],
    bg:      [245, 245, 245] as [number, number, number],
    white:   [255, 255, 255] as [number, number, number],
  };

  function newPage() {
    doc.addPage();
    y = margin;
  }

  function checkSpace(needed: number) {
    if (y + needed > pageH - margin) newPage();
  }

  // ── Cover Page ──────────────────────────────────────────────────────────────
  doc.setFillColor(...colors.navy);
  doc.rect(0, 0, pageW, pageH, "F");

  // Title
  doc.setFontSize(32);
  doc.setTextColor(...colors.white);
  doc.text("User Guide", pageW / 2, 110, { align: "center" });

  doc.setFontSize(14);
  doc.setTextColor(180, 200, 240);
  doc.text("Complete Guide to Managing Your CPD Points", pageW / 2, 125, { align: "center" });

  // Divider
  doc.setDrawColor(...colors.blue);
  doc.setLineWidth(0.5);
  doc.line(margin, 138, pageW - margin, 138);

  // Version & date
  doc.setFontSize(10);
  doc.setTextColor(150, 170, 210);
  doc.text("Version 1.0  |  2026", pageW / 2, 148, { align: "center" });

  // Bottom tagline
  doc.setFontSize(11);
  doc.setTextColor(180, 200, 240);
  doc.text("Track, complete and report your professional development", pageW / 2, 260, { align: "center" });
  doc.text("with confidence using CPDcheck.", pageW / 2, 268, { align: "center" });

  // ── Page 2: Table of Contents ────────────────────────────────────────────────
  newPage();

  // Header bar
  doc.setFillColor(...colors.navy);
  doc.rect(0, 0, pageW, 18, "F");
  doc.setTextColor(...colors.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("CPDcheck  |  User Guide", margin, 12);

  y = 32;
  doc.setTextColor(...colors.navy);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Table of Contents", margin, y);
  y += 10;

  doc.setDrawColor(...colors.blue);
  doc.setLineWidth(0.8);
  doc.line(margin, y, margin + 50, y);
  y += 10;

  const toc = [
    { num: "1", title: "Getting Started",           page: "3" },
    { num: "2", title: "Dashboard",                 page: "4" },
    { num: "3", title: "CPD Library",               page: "5" },
    { num: "4", title: "Content & Quizzes",         page: "6" },
    { num: "5", title: "My Education",              page: "7" },
    { num: "6", title: "Import CPD Activity",        page: "8" },
    { num: "7", title: "Reports & Export",          page: "9" },
    { num: "8", title: "Account Settings",          page: "9" },
    { num: "9", title: "Frequently Asked Questions", page: "10" },
  ];

  toc.forEach((item, i) => {
    const rowY = y + i * 14;
    if (i % 2 === 0) {
      doc.setFillColor(...colors.bg);
      doc.roundedRect(margin, rowY - 5, contentW, 12, 2, 2, "F");
    }
    doc.setTextColor(...colors.blue);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(item.num + ".", margin + 4, rowY + 3);
    doc.setTextColor(...colors.dark);
    doc.setFont("helvetica", "normal");
    doc.text(item.title, margin + 14, rowY + 3);
    doc.setTextColor(...colors.light);
    doc.text("Page " + item.page, pageW - margin, rowY + 3, { align: "right" });

    // Dots
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.3);
    const textW = doc.getTextWidth(item.title) + 14;
    const dotsStart = margin + textW + 4;
    const dotsEnd = pageW - margin - doc.getTextWidth("Page " + item.page) - 2;
    for (let dx = dotsStart; dx < dotsEnd; dx += 3) {
      doc.circle(dx, rowY + 1.5, 0.3, "F");
    }
  });

  // ── Helper functions for content pages ──────────────────────────────────────
  function pageHeader(title: string) {
    doc.setFillColor(...colors.navy);
    doc.rect(0, 0, pageW, 18, "F");
    doc.setTextColor(...colors.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("CPDcheck  |  User Guide", margin, 12);
    doc.setTextColor(180, 200, 240);
    doc.text(title, pageW - margin, 12, { align: "right" });
    y = 32;
  }

  function sectionTitle(text: string) {
    checkSpace(20);
    doc.setFillColor(...colors.blue);
    doc.roundedRect(margin, y, 4, 10, 1, 1, "F");
    doc.setTextColor(...colors.navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(text, margin + 8, y + 8);
    y += 18;
  }

  function subTitle(text: string) {
    checkSpace(14);
    doc.setTextColor(...colors.blue);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(text, margin, y);
    y += 8;
  }

  function bodyText(text: string) {
    checkSpace(8);
    doc.setTextColor(...colors.mid);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(text, contentW);
    lines.forEach((line: string) => {
      checkSpace(6);
      doc.text(line, margin, y);
      y += 5.5;
    });
    y += 2;
  }

  function bullet(text: string) {
    checkSpace(8);
    doc.setFillColor(...colors.blue);
    doc.circle(margin + 2, y - 1.5, 1.2, "F");
    doc.setTextColor(...colors.mid);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(text, contentW - 10);
    lines.forEach((line: string, i: number) => {
      checkSpace(6);
      doc.text(line, margin + 7, i === 0 ? y : y);
      y += 5.5;
    });
  }

  function infoBox(text: string) {
    checkSpace(20);
    const lines = doc.splitTextToSize(text, contentW - 12);
    const boxH = lines.length * 5.5 + 8;
    doc.setFillColor(232, 244, 255);
    doc.setDrawColor(...colors.blue);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentW, boxH, 3, 3, "FD");
    doc.setFillColor(...colors.blue);
    doc.roundedRect(margin, y, 3, boxH, 1, 1, "F");
    doc.setTextColor(...colors.navy);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    lines.forEach((line: string, i: number) => {
      doc.text(line, margin + 8, y + 6 + i * 5.5);
    });
    y += boxH + 6;
  }

  function divider() {
    checkSpace(8);
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 6;
  }

  // ── Section 1: Getting Started ───────────────────────────────────────────────
  newPage();
  pageHeader("1. Getting Started");

  sectionTitle("1. Getting Started");
  bodyText("Welcome to CPDcheck -your all-in-one platform for tracking, completing, and reporting Continuing Professional Development (CPD) activities as a financial adviser.");

  infoBox("CPDcheck helps you meet your annual CPD obligations under Australian financial services legislation by providing structured learning content, automatic point tracking, and compliance reporting.");

  subTitle("Logging In");
  bodyText("Navigate to the CPDcheck application in your browser. Enter your registered email address and password, then click Sign In. Your session will be maintained until you log out.");

  subTitle("First-Time Setup");
  bullet("Go to Account Settings via the sidebar to update your full name and email.");
  bullet("Enter your License Name and License Number for compliance records.");
  bullet("Review your annual CPD target (default: 40 CPD points).");
  bullet("Enable or disable individual CPD categories based on your requirements.");

  subTitle("Navigation");
  bodyText("Use the left sidebar to navigate between the main sections of CPDcheck:");
  bullet("Dashboard -Overview of your CPD progress and completed education.");
  bullet("CPD Library -Browse and access all available learning content.");
  bullet("My Education -View your full completed education history.");
  bullet("Upload -Manually add externally completed CPD activities.");
  bullet("Profile -Manage your account settings.");

  // ── Section 2: Dashboard ─────────────────────────────────────────────────────
  newPage();
  pageHeader("2. Dashboard");

  sectionTitle("2. Dashboard");
  bodyText("The Dashboard is your central hub for monitoring CPD compliance. It provides an at-a-glance summary of your progress toward your annual CPD target.");

  subTitle("Annual Compliance Progress");
  bodyText("At the top of the Dashboard you will find the Annual Compliance Progress card, which shows:");
  bullet("Your total CPD points earned across all active categories.");
  bullet("Your annual CPD target (default 40 points).");
  bullet("A progress bar showing your completion percentage.");
  bullet("Your overall compliance percentage.");

  subTitle("Category Cards");
  bodyText("Below the progress section, six CPD category cards display your earned and required points for each category:");
  bullet("Technical Competence");
  bullet("Professionalism & Ethics");
  bullet("Client Care & Practice");
  bullet("Regulatory Compliance & Consumer Protection");
  bullet("General");
  bullet("Tax (Financial) Advice");

  bodyText("Each card shows the donut chart with your earned/target ratio, your status (Requirement met / pts to go / No requirement), and a toggle to enable or disable the category.");

  infoBox("Tip: If a category shows 'No requirement', it means there is no minimum CPD obligation for that category this year. You can disable it using the toggle to exclude it from your tracking.");

  subTitle("My Completed Education");
  bodyText("The bottom section of the Dashboard lists your recently completed CPD activities. Each item shows the content type icon, title, description, category badges, sub-category areas, and CPD points earned. Click any item to view the full content details.");

  divider();

  subTitle("Export & Import");
  bullet("Export Report -Click the Export Report button at the top right of the Dashboard to download a CSV file of your CPD activity summary.");
  bullet("Import CPD Points -Click Import CPD Points to open the import form. Complete all fields including activity details, date of completion, CPD areas, hours allocated, and attach a supporting PDF. Click Save and Submit to record the activity.");

  // ── Section 3: CPD Library ───────────────────────────────────────────────────
  newPage();
  pageHeader("3. CPD Library");

  sectionTitle("3. CPD Library");
  bodyText("The CPD Library contains all available learning content. Browse podcasts, videos, PDF guides, and articles -each accredited for CPD points.");

  subTitle("Filtering Content");
  bullet("Use the status tabs (All / Not Started / Completed) to filter by completion status.");
  bullet("Use the All Categories dropdown at the top right to filter by CPD category.");

  subTitle("Content Cards");
  bodyText("Each content card in the library displays:");
  bullet("A thumbnail with content type icon.");
  bullet("Title and description.");
  bullet("CPD category badges and point allocation.");
  bullet("Sub category areas with point breakdown.");
  bullet("Duration and content format (Podcast, Video, PDF, Article).");

  bodyText("Click a card to open the full content detail page.");

  infoBox("Content is accredited against specific CPD categories and sub-categories. Review the Accreditation Points Allocation on each card to understand how points are distributed across categories.");

  subTitle("Content Types Available");
  bullet("Podcast -Audio episodes from leading financial advice professionals.");
  bullet("Video -Masterclass sessions and educational webinars.");
  bullet("PDF -Compliance guides and reference documents.");
  bullet("Article -In-depth written analysis and case studies.");

  // ── Section 4: Content & Quizzes ─────────────────────────────────────────────
  newPage();
  pageHeader("4. Content & Quizzes");

  sectionTitle("4. Content & Quizzes");
  bodyText("Clicking a content card opens the full content detail page where you can consume the content and complete the associated quiz to earn CPD points.");

  subTitle("Content Detail Page");
  bodyText("The content detail page is split into two columns:");
  bullet("Left column -The main content area (audio player, video player, PDF viewer, or article text).");
  bullet("Right column -Course details, accreditation points allocation, and the quiz panel.");

  subTitle("Course Details Panel");
  bodyText("The Course Details panel on the right shows the provider, duration, total CPD points, format, and primary category for the content.");

  subTitle("Completing a Quiz");
  bodyText("After consuming the content, complete the quiz to earn your CPD points:");
  bullet("Click the Quiz button in the Complete the quiz panel.");
  bullet("Answer all multiple-choice questions carefully.");
  bullet("Submit your answers at the end of the quiz.");
  bullet("A passing score records the CPD points to your profile automatically.");
  bullet("Your results page shows your score and correct answers with explanations.");

  infoBox("You must complete the quiz to have CPD points recorded against your profile. Simply viewing the content without completing the quiz does not award points.");

  subTitle("PDF Content");
  bodyText("PDF content opens directly in the browser's built-in PDF viewer. Scroll through the document and then proceed to the quiz panel when ready.");

  // ── Section 5: My Education ──────────────────────────────────────────────────
  newPage();
  pageHeader("5. My Education");

  sectionTitle("5. My Education");
  bodyText("The My Education page provides a complete history of all CPD activities you have completed through CPDcheck, including both platform content and manually uploaded activities.");

  subTitle("Completed Activities List");
  bodyText("Each completed activity entry displays:");
  bullet("Content type icon and title.");
  bullet("Brief description.");
  bullet("CPD category badges (active categories highlighted).");
  bullet("Sub-category area badges.");
  bullet("CPD points earned.");

  subTitle("Reviewing Your History");
  bodyText("Click any completed activity to re-open the content detail page. You can review the material at any time without affecting your CPD point record.");

  infoBox("Your completed education history is important for compliance purposes. Ensure all activities are recorded accurately and retain any certificates or evidence of completion provided by external CPD providers.");

  // ── Section 6: Import CPD Activity ───────────────────────────────────────────
  newPage();
  pageHeader("6. Import CPD Activity");

  sectionTitle("6. Import CPD Activity");
  bodyText("The Import CPD Points feature allows you to record CPD activities completed outside of CPDcheck -such as industry conferences, external courses, webinars, or self-directed reading. Click the Import CPD Points button on the Dashboard to open the import form.");

  subTitle("Upload CPD Activity Details (Left Panel)");
  bullet("Activity Title -Enter the full name of the CPD activity.");
  bullet("Activity Type -Select from: Structured CPD, Unstructured CPD, Conference, Self-directed, or Relevant Qualification.");
  bullet("Facilitator/Provider -Enter the name of the organisation or individual who delivered the activity.");
  bullet("Brief Description (Optional) -Describe the learning format: live webinar, on demand, or in person.");
  bullet("Type of CPD Undertaken -Select one: Non-Ensemble Entity, Relevant Qualification, or Professional Reading (max 4 hours).");

  subTitle("Accreditation & Dates (Right Panel)");
  bullet("Date of Completion -Select the exact date the activity was completed using the date picker.");
  bullet("CPD Areas -Select the relevant CPD category from the dropdown (e.g. Technical Competence, Professionalism & Ethics).");
  bullet("Hours Allocated -Enter the number of hours allocated to the selected CPD category.");
  bullet("Add more -Click to add additional CPD area and hours rows if the activity spans multiple categories.");
  bullet("Total Accredited Hours (Mandatory) -Enter the total number of accredited CPD hours for the activity.");
  bullet("Extra Notes -Add any additional information relevant to the activity.");
  bullet("Upload PDF -Attach a supporting PDF document (certificate, completion record, or evidence).");

  subTitle("Submitting the Form");
  bullet("Click Save and Submit to record the activity to your CPD profile.");
  bullet("Click Discard Changes to close the form without saving.");

  infoBox("Keep copies of all supporting evidence for externally completed CPD activities (certificates, attendance records, invoices). Your licensee or ASIC may request evidence of CPD completion during compliance reviews.");

  subTitle("Supported Activity Types");
  bullet("Structured CPD -Formal courses, webinars, and workshops with a clear learning outcome.");
  bullet("Unstructured CPD -Reading, research, and informal learning activities.");
  bullet("Conference -Industry events and professional development days.");
  bullet("Self-directed -Personal study and research activities.");
  bullet("Relevant Qualification -Formal qualifications relevant to financial advice.");

  // ── Section 7 & 8 ────────────────────────────────────────────────────────────
  newPage();
  pageHeader("7. Reports & 8. Account Settings");

  sectionTitle("7. Reports & Export");
  bodyText("CPDcheck provides built-in reporting tools to help you demonstrate compliance to your licensee or for self-assessment purposes.");

  subTitle("Exporting a Report");
  bullet("Click the Export Report button on the Dashboard (top right).");
  bullet("A CSV file will be downloaded containing your full CPD activity summary.");
  bullet("The report includes activity titles, dates, points earned, and categories.");
  bullet("Use this report for your licensee CPD submissions or personal records.");

  divider();

  sectionTitle("8. Account Settings");
  bodyText("Access Account Settings by clicking your name or avatar in the sidebar, or navigating via the Profile menu.");

  subTitle("Personal Details");
  bullet("Full Name -Your registered name as it appears on compliance reports.");
  bullet("Email -Your login email address.");
  bullet("License Name -The name of your Australian Financial Services Licence holder.");
  bullet("License Number -Your individual Authorised Representative number.");

  bodyText("Click Save Changes after updating any details to ensure your records are kept current.");

  // ── Section 9: FAQ ───────────────────────────────────────────────────────────
  newPage();
  pageHeader("9. Frequently Asked Questions");

  sectionTitle("9. Frequently Asked Questions");

  const faqs = [
    {
      q: "How many CPD points do I need each year?",
      a: "The standard annual CPD requirement for Australian financial advisers is 40 CPD points. Your licensee may have specific requirements per category. CPDcheck defaults to 40 points total across all active categories.",
    },
    {
      q: "What happens if I don't pass a quiz?",
      a: "If you do not achieve a passing score, CPD points will not be recorded. You can review the content again and retake the quiz. There is no limit on quiz attempts.",
    },
    {
      q: "Can I disable a CPD category?",
      a: "Yes. On the Dashboard, use the toggle on each category card to disable categories that do not apply to your practice. Disabled categories are excluded from your compliance percentage calculation.",
    },
    {
      q: "How do I record CPD completed at a conference?",
      a: "Use the Upload page to manually enter externally completed CPD activities. Select 'Conference' as the activity type and provide the relevant details including provider, date, and points claimed.",
    },
    {
      q: "Is my CPD data secure?",
      a: "Yes. CPDcheck stores your data securely. Only you and your authorised licensee administrators can access your CPD records.",
    },
    {
      q: "Can I access CPDcheck on mobile?",
      a: "CPDcheck is a web-based application accessible from any modern browser on desktop, tablet, or mobile devices.",
    },
    {
      q: "How do I update my licence number?",
      a: "Go to Account Settings via the sidebar and update your License Name and License Number fields, then click Save Changes.",
    },
  ];

  faqs.forEach((faq) => {
    checkSpace(30);
    doc.setFillColor(...colors.bg);
    const qLines = doc.splitTextToSize(faq.q, contentW - 10);
    const aLines = doc.splitTextToSize(faq.a, contentW - 10);
    const boxH = (qLines.length + aLines.length) * 5.5 + 14;
    doc.roundedRect(margin, y, contentW, boxH, 3, 3, "F");

    doc.setTextColor(...colors.navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    qLines.forEach((line: string, i: number) => {
      doc.text("Q: " + (i === 0 ? line : "   " + line), margin + 5, y + 7 + i * 5.5);
    });

    const answerY = y + 7 + qLines.length * 5.5 + 2;
    doc.setTextColor(...colors.mid);
    doc.setFont("helvetica", "normal");
    aLines.forEach((line: string, i: number) => {
      doc.text(line, margin + 5, answerY + i * 5.5);
    });

    y += boxH + 4;
  });

  // ── Footer on all pages ──────────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(...colors.bg);
    doc.rect(0, pageH - 12, pageW, 12, "F");
    doc.setTextColor(...colors.light);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("CPDcheck User Guide  |  Confidential", margin, pageH - 4);
    doc.text(`Page ${i} of ${totalPages}`, pageW - margin, pageH - 4, { align: "right" });
  }

  doc.save("CPDcheck-User-Guide.pdf");
}
