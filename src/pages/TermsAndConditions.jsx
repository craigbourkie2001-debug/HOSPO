import React, { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Shield, AlertTriangle, Mail } from "lucide-react";

const sections = [
  {
    id: 1,
    title: "Introduction & Acceptance",
    content: `**Effective Date:** 1 March 2026

These Terms and Conditions ("Terms") govern your use of the Hospo platform ("Service"), operated by **Hospo Ltd**, a company registered in Ireland with its principal place of business in County Kildare, Ireland ("Hospo", "we", "us", "our").

**1.1** By creating an account, ticking the acceptance checkbox at signup, or otherwise using the Service, you agree to be legally bound by these Terms. If you do not agree, you must not use the Service.

**1.2** These Terms bind:
- **Business Admins** – hospitality businesses (cafés, restaurants, hotels, catering companies) that register and manage accounts on the platform.
- **Staff Users** – individual employees, contractors, or workers invited to use the platform by a Business Admin.

**1.3 Changes to Terms.** We may update these Terms from time to time. We will notify you by email or in-app notice at least **30 days** before material changes take effect. Continued use after that date constitutes acceptance. If you do not agree to the changes, you may terminate your account before the effective date.

**1.4** These Terms were last updated on **1 March 2026**.`
  },
  {
    id: 2,
    title: "Definitions",
    content: `The following capitalised terms have the meanings set out below:

- **"Account"** – the unique login created by or for a User to access the Service.
- **"Admin"** – a User with administrative privileges, typically the business owner, manager, or HR representative of a hospitality business.
- **"Business User"** – a company or sole trader that subscribes to Hospo to manage their workforce.
- **"GDPR"** – the General Data Protection Regulation (EU) 2016/679 as adopted into Irish law by the Data Protection Act 2018.
- **"Personal Data"** – any information relating to an identified or identifiable natural person, as defined under GDPR.
- **"Service"** – the Hospo web and mobile application, including all features such as shift scheduling, rostering, time tracking, availability management, notifications, and team communications.
- **"Shift"** – a defined period of work created, assigned, or managed through the Service.
- **"Staff User"** – an individual employee, contractor, or worker who uses the Service at the invitation of an Admin.
- **"Subscription"** – a paid plan granting access to the Service for a defined billing period.
- **"User"** – collectively, Admins and Staff Users.
- **"User Content"** – any data, schedules, messages, notes, or other content submitted to the Service by Users.`
  },
  {
    id: 3,
    title: "Description of Service",
    content: `**3.1 What Hospo Provides.** The Service enables hospitality businesses to:
- Create, manage, and publish employee Shifts and rosters.
- Allow staff to view schedules, declare availability, and receive notifications.
- Track working hours and generate scheduling reports.
- Facilitate team communications related to scheduling.
- Manage shift applications and approvals.

**3.2 What Hospo Does Not Provide.** The Service is a scheduling and communications tool only. Hospo does not:
- Process payroll or calculate wages, tax, PRSI, or USC obligations.
- Provide HR, employment law, or legal advice.
- Guarantee that shifts will be filled or that workers will attend.
- Act as an employment agency or employer of any Staff User.

**3.3** Business Users remain solely responsible for compliance with all applicable employment law, including the Organisation of Working Time Act 1997, the Employment (Miscellaneous Provisions) Act 2018, and all applicable Irish and EU labour regulations.

**3.4 Service Availability.** We aim for **99% uptime** but do not guarantee uninterrupted access. Planned maintenance will be notified in advance where reasonably practicable.`
  },
  {
    id: 4,
    title: "User Eligibility & Accounts",
    content: `**4.1 Age Requirement.** The Service is intended for users aged **18 or over**. By registering, you confirm you are at least 18 years old.

**4.2 Accurate Information.** You must provide accurate, current, and complete information when creating an Account and keep it up to date.

**4.3 Admin Responsibilities.** Business Admins are responsible for:
- Inviting Staff Users and ensuring they are eligible to use the Service.
- Ensuring all Shift data entered is accurate and compliant with applicable employment law.
- Managing and revoking Staff User access promptly when employment ends.
- All activity conducted under their Account.

**4.4 Password Security.** You are responsible for maintaining the confidentiality of your login credentials. You must notify us immediately at **hello@hospo.ie** if you suspect unauthorised access to your Account.

**4.5 One Account Per User.** Each individual may only hold one Account. Creating multiple accounts to circumvent restrictions is prohibited.`
  },
  {
    id: 5,
    title: "Licence & Acceptable Use",
    content: `**5.1 Licence Grant.** Subject to your compliance with these Terms, Hospo grants you a limited, non-exclusive, non-transferable, revocable licence to access and use the Service for your internal business or employment purposes.

**5.2 Prohibited Conduct.** You must not:
- Use the Service for any unlawful purpose or in breach of any applicable law or regulation.
- Reverse engineer, decompile, disassemble, or attempt to derive the source code of the Service.
- Scrape, harvest, or systematically extract data from the Service without our written consent.
- Make excessive automated API calls that degrade Service performance for other users.
- Upload malicious code, viruses, or any material designed to disrupt the Service.
- Impersonate any person or entity or misrepresent your identity.
- Sublicense, resell, or provide access to the Service to third parties outside your organisation.

**5.3 Shift Data Accuracy.** Users are responsible for ensuring that Shift information (hours, dates, roles, rates) is accurate. Hospo is not liable for losses arising from incorrect scheduling data entered by Users.

**5.4 Monitoring.** We reserve the right (but not the obligation) to monitor use of the Service to ensure compliance with these Terms.`
  },
  {
    id: 6,
    title: "Payments & Subscriptions",
    content: `**6.1 Subscription Plans.** Access to the full Service requires a paid Subscription. Current pricing is displayed on our pricing page and may include monthly and annual billing options. Prices are in **Euro (€)** and are exclusive of VAT unless stated otherwise.

**6.2 VAT.** Irish VAT will be applied to all Subscriptions at the applicable rate. Business Users with a valid EU VAT number may be eligible for reverse charge treatment.

**6.3 Billing.** Subscriptions are billed in advance. Payment is due on the billing date and is processed via our payment provider (Stripe). You authorise us to charge your payment method on each renewal date.

**6.4 Auto-Renewal.** Subscriptions renew automatically at the end of each billing period unless you cancel before the renewal date via your Account settings.

**6.5 Free Trial.** Where a free trial is offered, your payment method will be charged at the end of the trial period unless you cancel beforehand.

**6.6 Refunds & Cooling-Off Period.**
- **Consumers (Staff Users acting outside a business capacity):** Under the EU Consumer Rights Directive and the Irish Consumer Rights Act 2022, you have a **14-day right of withdrawal** from the date of purchase of a digital service, provided you have not begun using it. If you have begun using the Service, you expressly consent to immediate provision and acknowledge the withdrawal right is waived.
- **Business Users:** Subscription fees are non-refundable except where required by law or where Hospo has materially failed to provide the Service.

**6.7 Failed Payments.** If payment fails, we will notify you and may suspend access to the Service after a reasonable grace period.

**6.8 Price Changes.** We will give at least **30 days' notice** of any price increase. Continued use after the effective date constitutes acceptance.`
  },
  {
    id: 7,
    title: "Data Protection & GDPR",
    content: `**7.1 Data Controller.** For Personal Data processed in connection with your Account and use of the Service, **Hospo Ltd** acts as the **Data Controller** as defined under GDPR.

**7.2 Types of Personal Data Collected.** We collect and process the following categories of Personal Data:
- **Identity & Contact Data:** Full name, email address, phone number.
- **Employment & Scheduling Data:** Shift assignments, availability, working hours, role/position.
- **Account Data:** Login credentials, account preferences.
- **Device & Usage Data:** IP address, browser type, access logs.
- **Location Data:** Only where explicitly enabled by the User for scheduling purposes.

**7.3 Purposes & Legal Basis.** We process Personal Data to:
- Provide and operate the Service *(Legitimate interests / Contract performance)*.
- Send scheduling notifications and alerts *(Contract performance)*.
- Generate workforce analytics and reports *(Legitimate interests)*.
- Comply with legal obligations *(Legal obligation)*.
- Improve the Service *(Legitimate interests)*.

**7.4 Data Processors.** We use trusted third-party processors, including:
- **AWS Ireland** (cloud hosting — EU data residency).
- **Stripe** (payment processing).
- All processors are bound by GDPR-compliant data processing agreements.

**7.5 International Transfers.** Personal Data is stored and processed within the **European Economic Area (EEA)**. Where any transfer outside the EEA is required, we ensure adequate safeguards are in place (e.g., Standard Contractual Clauses).

**7.6 Your Rights.** Under GDPR, you have the right to:
- **Access** the Personal Data we hold about you.
- **Rectify** inaccurate or incomplete data.
- **Erase** your data ("right to be forgotten") in certain circumstances.
- **Restrict** or **object to** processing.
- **Data portability** — receive your data in a machine-readable format.
- **Withdraw consent** where processing is based on consent.

To exercise your rights, contact us at **privacy@hospo.ie**. We will respond within **30 days**.

**7.7 Retention.** We retain Personal Data for as long as your Account is active and for up to **3 years** thereafter, unless a longer period is required by law.

**7.8 Data Breach Notification.** In the event of a Personal Data breach likely to result in a risk to individuals' rights, we will notify the **Data Protection Commission (DPC)** within **72 hours** and affected individuals without undue delay, as required by GDPR Article 33.

**7.9 Privacy Policy.** Full details of our data practices are set out in our **Privacy Policy**, available at [hospo.ie/privacy]. In the event of conflict, the Privacy Policy supplements these Terms.

**7.10 DPC Complaints.** You have the right to lodge a complaint with the **Data Protection Commission** at [dataprotection.ie](https://www.dataprotection.ie).`
  },
  {
    id: 8,
    title: "User Content & Responsibilities",
    content: `**8.1 Ownership.** You retain ownership of all User Content you submit to the Service, including shift data, rosters, and communications.

**8.2 Licence to Hospo.** By submitting User Content, you grant Hospo a worldwide, royalty-free, non-exclusive licence to host, store, display, and process that content solely for the purpose of providing the Service to you.

**8.3 Accuracy.** You are solely responsible for the accuracy and legality of User Content. Hospo does not verify the accuracy of shift data, availability declarations, or communications.

**8.4 Indemnification.** You agree to indemnify, defend, and hold harmless Hospo and its directors, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from:
- Your breach of these Terms.
- Disputes between Business Users and Staff Users regarding Shifts, pay, or working conditions.
- Inaccurate or unlawful User Content submitted by you.

**8.5 Prohibited Content.** You must not submit content that is illegal, defamatory, discriminatory, harassing, or in breach of any third-party rights.`
  },
  {
    id: 9,
    title: "Intellectual Property",
    content: `**9.1 Hospo's IP.** All intellectual property rights in the Service — including the software, design, user interface, logos, trademarks, and documentation — are owned by or licensed to Hospo Ltd. All rights are reserved.

**9.2 No Transfer.** Nothing in these Terms transfers any intellectual property rights to you. Your licence to use the Service does not include any right to copy, modify, distribute, sell, or create derivative works from the Service or any part of it.

**9.3 Feedback.** If you provide feedback or suggestions about the Service, you grant Hospo the right to use that feedback without restriction or compensation to you.

**9.4 Third-Party Marks.** Any third-party trademarks used within the Service belong to their respective owners.`
  },
  {
    id: 10,
    title: "Confidentiality",
    content: `**10.1** Each party may have access to confidential information of the other party in connection with the Service, including business data, rosters, pricing, and technical information ("Confidential Information").

**10.2** Each party agrees to:
- Keep Confidential Information strictly confidential.
- Not disclose it to any third party without the other party's prior written consent.
- Use it only for the purposes of these Terms.

**10.3** This obligation does not apply to information that is or becomes publicly available through no fault of the receiving party, or that must be disclosed by law.

**10.4** This confidentiality obligation survives termination of these Terms for a period of **3 years**.`
  },
  {
    id: 11,
    title: "Warranties & Disclaimers",
    content: `**11.1** Hospo warrants that it will provide the Service with reasonable care and skill in accordance with the Supply of Services provisions of the **Sale of Goods and Supply of Services Act 1980**.

**11.2 "As Is" Basis.** Subject to clause 11.1, the Service is provided on an "as is" and "as available" basis. To the fullest extent permitted by law, Hospo disclaims all other warranties, express or implied, including:
- Fitness for a particular purpose.
- Uninterrupted or error-free operation.
- That the Service will meet all your requirements.

**11.3 Consumer Rights.** Nothing in these Terms limits your statutory rights as a consumer under the **Consumer Rights Act 2022** or any other applicable Irish consumer protection legislation.

**11.4 No Employment Warranty.** Hospo does not warrant that use of the Service will ensure compliance with employment law obligations. Business Users are solely responsible for such compliance.`
  },
  {
    id: 12,
    title: "Limitation of Liability",
    content: `**12.1 Liability Cap.** To the maximum extent permitted by applicable law, Hospo's total aggregate liability to you (whether in contract, tort, or otherwise) arising from or in connection with the Service shall not exceed the **total Subscription fees paid by you in the 12 months preceding the claim**.

**12.2 Excluded Losses.** Hospo shall not be liable for any:
- Loss of profits or revenue.
- Loss of business or contracts.
- Loss or corruption of data.
- Indirect, incidental, special, or consequential loss.
- Losses arising from errors in User-submitted shift data.

**12.3 GDPR Fines.** The limitation in clause 12.1 shall not apply to liability arising from Hospo's negligent or wilful breach of its obligations as Data Controller under GDPR.

**12.4 Exceptions.** Nothing in these Terms limits liability for:
- Death or personal injury caused by negligence.
- Fraud or fraudulent misrepresentation.
- Any other liability that cannot be excluded by Irish or EU law.`
  },
  {
    id: 13,
    title: "Termination & Suspension",
    content: `**13.1 Termination by You.** You may cancel your Account at any time via your Account settings. Cancellation takes effect at the end of the current billing period.

**13.2 Termination by Hospo.** We may suspend or terminate your Account immediately if:
- You materially breach these Terms and fail to remedy the breach within **14 days** of written notice.
- You use the Service in a way that poses a security risk or legal liability to Hospo or other users.
- You become insolvent or enter into any form of liquidation or administration.

**13.3 Effect of Termination.**
- Your access to the Service will cease on the termination date.
- You will have a **30-day window** following termination to export your data. After this period, we may delete your data in accordance with our data retention policy.
- Outstanding fees remain payable.

**13.4 Survival.** The following clauses survive termination: Definitions, Intellectual Property, Confidentiality, Limitation of Liability, Indemnification, and Governing Law.`
  },
  {
    id: 14,
    title: "Dispute Resolution",
    content: `**14.1 Complaints Process.** If you have a complaint, please contact us first at **hello@hospo.ie** with details of your complaint. We will acknowledge receipt within **5 business days** and aim to resolve the matter within **30 days**.

**14.2 Mediation.** If a dispute cannot be resolved informally, both parties agree to consider mediation before initiating legal proceedings. Mediators can be appointed through the **Mediators' Institute of Ireland** (mediatorsinstitute.ie).

**14.3 Governing Law.** These Terms are governed by and construed in accordance with the laws of **Ireland**.

**14.4 Jurisdiction.** Subject to clause 14.2, any dispute arising from or in connection with these Terms shall be subject to the **exclusive jurisdiction of the courts of Ireland**, with Dublin as the preferred venue.

**14.5 EU Online Dispute Resolution.** If you are an EU consumer, you may also use the **EU Online Dispute Resolution (ODR) platform** available at [ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr).`
  },
  {
    id: 15,
    title: "General Provisions",
    content: `**15.1 Force Majeure.** Neither party shall be liable for any failure or delay in performance caused by circumstances beyond their reasonable control, including but not limited to acts of God, government action, pandemic, war, cyberattacks, or failure of third-party infrastructure (e.g., internet outages). The affected party must notify the other promptly and use reasonable efforts to resume performance.

**15.2 Severability.** If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or removed to the minimum extent necessary, and the remaining Terms will continue in full force and effect.

**15.3 Assignment.** You may not assign or transfer your rights or obligations under these Terms without Hospo's prior written consent. Hospo may assign these Terms (in whole or in part) in connection with a merger, acquisition, or sale of assets, with notice to you.

**15.4 Entire Agreement.** These Terms, together with the Privacy Policy and any Subscription order form, constitute the entire agreement between the parties regarding the Service and supersede all prior agreements and understandings.

**15.5 Waiver.** Failure by Hospo to enforce any provision of these Terms shall not constitute a waiver of its right to do so in the future.

**15.6 Notices.** Notices under these Terms shall be sent by email to the address associated with your Account (for notices to you) or to **hello@hospo.ie** (for notices to Hospo).`
  },
  {
    id: 16,
    title: "Contact Information",
    content: `For any questions, complaints, or requests regarding these Terms or the Service, please contact us:

**Hospo Ltd**
County Kildare, Ireland

📧 **General Enquiries:** hello@hospo.ie
📧 **Data Protection / Privacy:** privacy@hospo.ie
📧 **Legal Notices:** legal@hospo.ie

**Data Protection Commission (Ireland)**
21 Fitzwilliam Square South, Dublin 2, D02 RD28
📞 +353 (0)76 110 4800
🌐 [dataprotection.ie](https://www.dataprotection.ie)

---

*These Terms and Conditions were last updated on **1 March 2026**.*

*Governing Law: Republic of Ireland*

---

> ⚠️ **Legal Disclaimer:** This document is a template prepared for guidance purposes only. It does not constitute legal advice. Hospo Ltd strongly recommends that you seek independent legal review from a qualified Irish solicitor before publishing or relying on these Terms in a live commercial context.`
  }
];

function Section({ section }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-2xl overflow-hidden transition-all duration-200" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-opacity-80 transition-colors"
        style={{ backgroundColor: open ? 'var(--sand)' : 'transparent' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-normal tracking-widest w-6" style={{ color: 'var(--terracotta)' }}>{String(section.id).padStart(2, '0')}</span>
          <span className="font-normal text-lg" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>{section.title}</span>
        </div>
        {open ? <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--clay)' }} /> : <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--clay)' }} />}
      </button>
      {open && (
        <div className="px-6 pb-6 pt-2">
          <div className="prose prose-sm max-w-none">
            {section.content.split('\n\n').map((para, i) => (
              <p key={i} className="text-sm leading-relaxed mb-3 last:mb-0 whitespace-pre-line" style={{ color: 'var(--earth)' }}>
                {para.replace(/\*\*(.*?)\*\*/g, (_, m) => m).split(/(\*\*.*?\*\*)/).map((part, j) =>
                  /^\*\*(.*)\*\*$/.test(part)
                    ? <strong key={j} style={{ color: 'var(--earth)', fontWeight: 600 }}>{part.replace(/\*\*/g, '')}</strong>
                    : part
                )}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TermsAndConditions() {
  const [allOpen, setAllOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  return (
    <div className="min-h-screen p-6 md:p-12" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--sand)' }}>
              <FileText className="w-6 h-6" style={{ color: 'var(--terracotta)' }} />
            </div>
            <div>
              <h1 className="text-4xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>Terms & Conditions</h1>
              <p className="text-sm" style={{ color: 'var(--clay)' }}>Hospo Ltd · Last updated: 1 March 2026 · Governing law: Ireland</p>
            </div>
          </div>

          {/* Legal disclaimer banner */}
          <div className="flex items-start gap-3 p-4 rounded-xl border" style={{ backgroundColor: '#FFF8F0', borderColor: 'var(--terracotta)' }}>
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--terracotta)' }} />
            <p className="text-sm" style={{ color: 'var(--earth)' }}>
              <strong>Legal Notice:</strong> This is a template document. Hospo Ltd recommends seeking independent legal review from a qualified Irish solicitor before relying on these Terms in a live commercial context.
            </p>
          </div>
        </div>

        {/* Quick summary cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Shield, label: 'GDPR Compliant', sub: 'EU data protection standards' },
            { icon: FileText, label: 'Irish Law', sub: 'Governed by Republic of Ireland' },
            { icon: Mail, label: 'Contact Us', sub: 'hello@hospo.ie' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="p-4 rounded-xl border" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
              <Icon className="w-5 h-5 mb-2" style={{ color: 'var(--terracotta)' }} />
              <p className="font-normal text-sm" style={{ color: 'var(--earth)' }}>{label}</p>
              <p className="text-xs" style={{ color: 'var(--clay)' }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {sections.map(section => (
            <Section key={section.id} section={section} />
          ))}
        </div>

        <div className="mt-10 p-6 rounded-2xl text-center" style={{ backgroundColor: 'var(--sand)' }}>
          <p className="text-sm font-light" style={{ color: 'var(--clay)' }}>
            Questions about these Terms? Email us at{' '}
            <a href="mailto:legal@hospo.ie" className="underline" style={{ color: 'var(--terracotta)' }}>legal@hospo.ie</a>
          </p>
        </div>
      </div>
    </div>
  );
}