import Link from "next/link";

const SCHOOL = {
  name: "The VIP School of Excellence",
  fullName: "Visionary Institute of Piety",
  tagline: "Where modern academics meet timeless spiritual foundation.",
  phones: ["99123 88801", "99123 88806"],
  address: "Bodhan Road, near Fruit Market, Nizamabad, Telangana 503001",
};

const NAV = [
  { href: "#about", label: "About" },
  { href: "#academics", label: "Academics" },
  { href: "#admissions", label: "Admissions" },
  { href: "#contact", label: "Contact" },
];

const PORTALS = [
  { label: "Student", href: "/login?role=student", icon: "GraduationCap" },
  { label: "Parent", href: "/login?role=parent", icon: "Users" },
  { label: "Teacher", href: "/login?role=teacher", icon: "BookOpen" },
  { label: "Staff", href: "/login?role=staff", icon: "ShieldCheck" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-vip-cream text-vip-ink">
      <SiteNav />
      <Hero />
      <Stats />
      <About />
      <Pillars />
      <Academics />
      <Voices />
      <Admissions />
      <Faq />
      <Contact />
      <Footer />
    </main>
  );
}

function Pillars() {
  const pillars = [
    { letter: "T", title: "Tarbiyah", body: "Character first — every lesson shapes adab, manners, and discipline alongside academics." },
    { letter: "T", title: "Ta'leem", body: "Rigorous, joyful learning. CBSE-aligned curriculum delivered through digital boards and small-group attention." },
    { letter: "T", title: "Taqwa", body: "Quran Shareef Taleem is woven into the day — not an afterthought, but a foundation." },
    { letter: "T", title: "Tahzeeb", body: "Cultured, respectful, articulate. We graduate children, not just students." },
    { letter: "T", title: "Tahafuz", body: "A safe, capped class size, AC environment. Every parent's trust is sacred." },
  ];
  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="Our 5 Pillars"
          title="Why parents choose VIP."
          subtitle="The five principles every classroom, teacher, and decision is held against."
        />
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="group relative rounded-2xl bg-vip-cream border border-vip-emerald/10 p-6 hover:border-vip-gold/40 hover:bg-white transition"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-vip-emerald text-vip-gold font-bold text-lg">
                {p.letter}
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-2 text-sm text-vip-muted leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Voices() {
  return (
    <section className="py-24 sm:py-32 bg-vip-emeraldDark text-white relative overflow-hidden">
      <div className="absolute inset-0 vip-pattern" />
      <div className="relative mx-auto max-w-4xl px-6 lg:px-10 text-center">
        <div className="text-xs uppercase tracking-[0.22em] text-vip-goldSoft">From the families we serve</div>
        <blockquote className="mt-8 text-2xl sm:text-3xl font-medium leading-relaxed">
          &ldquo;My daughter actually <em className="text-vip-goldSoft not-italic">looks forward</em> to school. She knows her teachers by name, she recites her surahs at home, and her English has transformed in one term. This is what we hoped for.&rdquo;
        </blockquote>
        <div className="mt-8 text-sm text-white/70">
          A parent of Class 3 · Nizamabad
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const items = [
    {
      q: "When do admissions open and how do I apply?",
      a: "Admissions for the 2026–27 academic year are open now. Seats are limited per class (max 30). Call us on 99123 88801 or 99123 88806, or walk in to the campus on Bodhan Road to collect the application form and schedule the scholarship exam.",
    },
    {
      q: "How is the fee structure?",
      a: "Our fees are deliberately reasonable for the quality offered. We also run a scholarship exam — select students qualify for fee concessions. Full structure is shared on enquiry at the office.",
    },
    {
      q: "How is the Quran Taleem integrated?",
      a: "Quran Shareef, Arabic basics, Islamic studies, and Akhlaq are scheduled as full subjects alongside English, Maths, Science, Social Studies, and Computer — not as a separate add-on class.",
    },
    {
      q: "Do you offer transport?",
      a: "Not at this time. Most students live within easy reach of the Bodhan Road campus.",
    },
    {
      q: "Will my child use a parent portal?",
      a: "Yes. Parents get a dedicated portal to follow attendance, fees, homework, results, and announcements — all in one place, with WhatsApp + email updates.",
    },
  ];
  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <SectionHeading eyebrow="Questions" title="Things parents ask us." />
        <div className="mt-12 divide-y divide-vip-emerald/10">
          {items.map((it) => (
            <details key={it.q} className="group py-5">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-semibold text-vip-ink">
                <span>{it.q}</span>
                <span className="h-6 w-6 flex items-center justify-center rounded-full border border-vip-emerald/30 text-vip-emerald transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-vip-muted leading-relaxed">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function SiteNav() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-vip-cream/85 border-b border-vip-emerald/10">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Logo />
          <div className="leading-tight">
            <div className="font-semibold tracking-tight">VIP School</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-vip-emerald/70">
              of Excellence
            </div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-vip-ink/80 hover:text-vip-emerald transition-colors"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex text-sm font-medium text-vip-emerald hover:text-vip-emeraldDark"
          >
            Portal Login
          </Link>
          <a
            href="#admissions"
            className="inline-flex items-center rounded-full bg-vip-emerald text-white text-sm font-semibold px-5 py-2.5 shadow-soft hover:bg-vip-emeraldDark transition"
          >
            Apply Now
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-vip-hero text-white">
      <div className="absolute inset-0 vip-pattern" />
      <div className="absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full bg-vip-gold/15 blur-3xl" />
      <div className="absolute top-40 -left-40 h-[420px] w-[420px] rounded-full bg-vip-emeraldMid/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-20 pb-28 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-vip-gold/40 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-vip-goldSoft">
            <span className="h-1.5 w-1.5 rounded-full bg-vip-gold animate-pulse" />
            Admissions Open · Limited Seats
          </div>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
            The VIP School{" "}
            <span className="text-vip-goldSoft">of Excellence</span>
          </h1>
          <p className="mt-3 text-sm uppercase tracking-[0.22em] text-white/60">
            {SCHOOL.fullName}
          </p>
          <p className="mt-8 text-lg sm:text-xl text-white/80 max-w-2xl leading-relaxed">
            A premium primary school in Nizamabad blending CBSE-aligned
            academics with Quran Shareef Taleem. Air-conditioned classrooms,
            digital learning, and a class size capped at 30 — so every child is
            seen, heard, and inspired.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#admissions"
              className="inline-flex items-center gap-2 rounded-full bg-vip-gold text-vip-emeraldDark font-semibold px-7 py-3.5 shadow-gold hover:bg-vip-goldSoft transition"
            >
              Apply for Admission
              <Arrow />
            </a>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 text-white font-medium px-7 py-3.5 hover:bg-white/10 transition"
            >
              Portal Login
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-4 gap-2 max-w-xl">
            {PORTALS.map((p) => (
              <Link
                key={p.label}
                href={p.href}
                className="group rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-vip-gold/40 transition p-3 text-center"
              >
                <PortalIcon name={p.icon} />
                <div className="mt-1.5 text-xs font-medium text-white/85 group-hover:text-vip-goldSoft">
                  {p.label}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="relative mx-auto max-w-md">
            <div className="absolute -inset-4 rounded-3xl bg-vip-gold/20 blur-2xl" />
            <div className="relative rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-widest text-vip-goldSoft">
                  Snapshot
                </div>
                <CrescentBook />
              </div>
              <div className="mt-6 space-y-4">
                <FactRow label="Classes" value="1st – 5th" />
                <FactRow label="Max Class Size" value="30 Students" />
                <FactRow label="Infrastructure" value="AC + Digital Boards" />
                <FactRow label="Curriculum" value="Academics + Quran" />
              </div>
              <div className="mt-7 pt-5 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/50">
                    Scholarship Exam
                  </div>
                  <div className="text-sm font-semibold text-white">
                    Reasonable Fee Structure
                  </div>
                </div>
                <a
                  href="#admissions"
                  className="text-vip-gold text-sm font-semibold hover:text-vip-goldSoft"
                >
                  Details →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-3">
      <span className="text-xs uppercase tracking-wider text-white/55">
        {label}
      </span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

function Stats() {
  const items = [
    { v: "1–5", l: "Classes Offered" },
    { v: "30", l: "Max per Class" },
    { v: "AC", l: "Classrooms" },
    { v: "Digital", l: "Learning" },
  ];
  return (
    <section className="border-y border-vip-emerald/10 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid grid-cols-2 md:grid-cols-4">
        {items.map((s, i) => (
          <div
            key={s.l}
            className={`py-8 md:py-10 text-center ${
              i !== items.length - 1 ? "md:border-r border-vip-emerald/10" : ""
            }`}
          >
            <div className="text-3xl md:text-4xl font-bold text-vip-emerald tracking-tight">
              {s.v}
            </div>
            <div className="mt-1 text-xs uppercase tracking-[0.18em] text-vip-muted">
              {s.l}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function About() {
  const cards = [
    {
      title: "Premium Infrastructure",
      body: "Every classroom is air-conditioned and equipped with smart digital boards, creating a comfortable, focused learning space for every child.",
      icon: <Building />,
    },
    {
      title: "Holistic Curriculum",
      body: "Standard academics blended with structured Quran Shareef Taleem — nurturing both intellect and character from day one.",
      icon: <CrescentBook />,
    },
    {
      title: "Capped Class Size",
      body: "Maximum 30 students per class. Every child gets attention, mentorship, and the time they deserve from highly qualified teachers.",
      icon: <Users />,
    },
  ];
  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="Why VIP School"
          title="A premium primary school, built on values."
          subtitle="Nizamabad's choice for families who want their children to excel academically, spiritually, and personally — all under one trusted roof."
        />
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {cards.map((c) => (
            <article
              key={c.title}
              className="group relative rounded-2xl bg-white border border-vip-emerald/10 p-8 shadow-soft hover:shadow-lg hover:-translate-y-1 transition"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-vip-emerald/10 text-vip-emerald">
                {c.icon}
              </div>
              <h3 className="mt-6 text-xl font-semibold tracking-tight">
                {c.title}
              </h3>
              <p className="mt-3 text-vip-muted leading-relaxed">{c.body}</p>
              <div className="mt-6 h-px bg-gradient-to-r from-vip-gold/40 via-vip-gold/10 to-transparent" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Academics() {
  const modern = ["English", "Mathematics", "Science", "Social Studies", "Computer", "Hindi"];
  const islamic = ["Quran Shareef Taleem", "Arabic Basics", "Islamic Studies", "Akhlaq & Adab"];
  return (
    <section id="academics" className="py-24 sm:py-32 bg-gradient-to-b from-white to-vip-cream">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="Curriculum"
          title="Two streams, one strong foundation."
          subtitle="Academics and Quran Taleem are taught side by side — not as add-ons, but as equal pillars of every child's education."
        />
        <div className="mt-16 grid md:grid-cols-2 gap-6">
          <SubjectCard title="Modern Academics" subtitle="CBSE-aligned" items={modern} accent="emerald" />
          <SubjectCard title="Quran Shareef Taleem" subtitle="Foundational Deen" items={islamic} accent="gold" />
        </div>
      </div>
    </section>
  );
}

function SubjectCard({
  title,
  subtitle,
  items,
  accent,
}: {
  title: string;
  subtitle: string;
  items: string[];
  accent: "emerald" | "gold";
}) {
  const isGold = accent === "gold";
  return (
    <div
      className={`rounded-3xl p-10 shadow-soft border ${
        isGold ? "bg-vip-emerald text-white border-vip-gold/30" : "bg-white border-vip-emerald/10"
      }`}
    >
      <div className={`text-xs uppercase tracking-[0.22em] ${isGold ? "text-vip-goldSoft" : "text-vip-emerald/70"}`}>
        {subtitle}
      </div>
      <h3 className={`mt-2 text-3xl font-bold tracking-tight ${isGold ? "text-white" : "text-vip-ink"}`}>
        {title}
      </h3>
      <ul className="mt-8 grid grid-cols-2 gap-3">
        {items.map((s) => (
          <li
            key={s}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
              isGold ? "bg-white/10 text-white" : "bg-vip-emerald/5 text-vip-ink"
            }`}
          >
            <Dot gold={isGold} />
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Admissions() {
  return (
    <section id="admissions" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-3xl bg-vip-emerald text-white p-10 sm:p-16 shadow-2xl">
          <div className="absolute -right-32 -top-32 h-[360px] w-[360px] rounded-full bg-vip-gold/15 blur-3xl" />
          <div className="absolute -left-20 bottom-0 h-[260px] w-[260px] rounded-full bg-vip-emeraldMid/40 blur-3xl" />
          <div className="relative grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-vip-gold/40 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-vip-goldSoft">
                Admissions 2026–27
              </div>
              <h2 className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                Scholarship Exam.{" "}
                <span className="text-vip-goldSoft">Reasonable Fee Structure.</span>
              </h2>
              <p className="mt-5 text-white/80 leading-relaxed max-w-lg">
                Select students qualify for our scholarship programme. Walk in or call us to schedule the entrance assessment. Limited seats per class — admissions close once full.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href={`tel:+91${SCHOOL.phones[0].replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 rounded-full bg-vip-gold text-vip-emeraldDark font-semibold px-7 py-3.5 shadow-gold hover:bg-vip-goldSoft transition"
                >
                  Call to Apply <Arrow />
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 font-medium px-7 py-3.5 hover:bg-white/10 transition"
                >
                  Visit Campus
                </a>
              </div>
            </div>
            <ul className="space-y-4">
              {[
                "Classes 1 to 5 — limited seats per grade",
                "Max 30 students per classroom",
                "Scholarship exam for select students",
                "Highly qualified faculty in academics & Deen",
                "AC classrooms with digital boards",
              ].map((b) => (
                <li key={b} className="flex items-start gap-3 rounded-xl bg-white/10 border border-white/10 px-5 py-4">
                  <Check />
                  <span className="text-white/90">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid md:grid-cols-2 gap-12 items-start">
        <div>
          <SectionHeading
            eyebrow="Visit Us"
            title="Come see the campus for yourself."
            subtitle="We welcome walk-ins. Meet our principal, tour the AC classrooms, and ask anything about admissions, curriculum, or fees."
            align="left"
          />
        </div>
        <div className="rounded-3xl border border-vip-emerald/10 p-8 sm:p-10 shadow-soft bg-vip-cream">
          <div className="space-y-6">
            <ContactRow label="Address" value={SCHOOL.address} icon={<MapPin />} />
            <ContactRow
              label="Call Us"
              value={
                <div className="space-y-1">
                  {SCHOOL.phones.map((p) => (
                    <a key={p} href={`tel:+91${p.replace(/\s/g, "")}`} className="block hover:text-vip-emerald transition">
                      +91 {p}
                    </a>
                  ))}
                </div>
              }
              icon={<Phone />}
            />
            <ContactRow label="Hours" value="Mon – Sat · 9:00 AM – 4:00 PM" icon={<Clock />} />
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SCHOOL.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-vip-emerald hover:text-vip-emeraldDark"
          >
            Open in Google Maps <Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}

function ContactRow({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-vip-emerald/10 text-vip-emerald">
        {icon}
      </div>
      <div>
        <div className="text-xs uppercase tracking-[0.18em] text-vip-muted">{label}</div>
        <div className="mt-1 text-vip-ink font-medium">{value}</div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-vip-emeraldDark text-white/70">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-14 grid md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-3 text-white">
            <Logo />
            <span className="font-semibold tracking-tight">VIP School of Excellence</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed max-w-sm">
            {SCHOOL.fullName} — A premium primary school in Nizamabad blending academics with Quran Shareef Taleem.
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-vip-goldSoft">Explore</div>
          <ul className="mt-4 space-y-2 text-sm">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="hover:text-white">
                  {n.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/login" className="hover:text-white">
                Portal Login
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-vip-goldSoft">Contact</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li>{SCHOOL.address}</li>
            {SCHOOL.phones.map((p) => (
              <li key={p}>
                <a href={`tel:+91${p.replace(/\s/g, "")}`} className="hover:text-white">
                  +91 {p}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-6 text-xs flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} The VIP School of Excellence. All rights reserved.</span>
          <span>Nizamabad, Telangana · India</span>
        </div>
      </div>
    </footer>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "max-w-3xl mx-auto text-center" : ""}>
      <div className="text-xs uppercase tracking-[0.22em] text-vip-emerald/70">{eyebrow}</div>
      <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">{title}</h2>
      {subtitle && <p className="mt-5 text-lg text-vip-muted leading-relaxed">{subtitle}</p>}
    </div>
  );
}

function Logo() {
  return (
    <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-vip-emerald text-vip-gold shadow-soft">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3 3 7v10l9 4 9-4V7l-9-4Z" />
        <path d="M7 11.5c2 2 8 2 10 0" strokeLinecap="round" />
      </svg>
    </span>
  );
}
function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Check() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 flex-shrink-0 text-vip-gold" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Dot({ gold = false }: { gold?: boolean }) {
  return <span className={`h-1.5 w-1.5 rounded-full ${gold ? "bg-vip-gold" : "bg-vip-emerald"}`} />;
}
function MapPin() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s-7-6.5-7-12a7 7 0 1 1 14 0c0 5.5-7 12-7 12Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function Phone() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 5c0-1 1-2 2-2h2l2 5-2 2a14 14 0 0 0 6 6l2-2 5 2v2c0 1-1 2-2 2A18 18 0 0 1 4 5Z" />
    </svg>
  );
}
function Clock() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" />
    </svg>
  );
}
function Building() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21V7l9-4 9 4v14" />
      <path d="M9 21V12h6v9" />
      <path d="M3 21h18" />
    </svg>
  );
}
function Users() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 21c.7-3.5 3.5-5.5 6.5-5.5s5.8 2 6.5 5.5" />
      <circle cx="17" cy="9" r="2.8" />
      <path d="M21.5 19.5c-.5-2.5-2.3-4-4.5-4" />
    </svg>
  );
}
function CrescentBook() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-vip-gold" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 5a2 2 0 0 1 2-2h11v18H6a2 2 0 0 1-2-2V5Z" />
      <path d="M17 8.5a3.5 3.5 0 1 0 0 5" strokeLinecap="round" />
    </svg>
  );
}
function PortalIcon({ name }: { name: string }) {
  const cls = "h-5 w-5 mx-auto text-vip-goldSoft group-hover:text-vip-gold transition";
  if (name === "GraduationCap")
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 9l10-4 10 4-10 4L2 9Z" />
        <path d="M6 11v4c2 2 10 2 12 0v-4" />
      </svg>
    );
  if (name === "Users")
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 21c.7-3.5 3.5-5.5 6.5-5.5s5.8 2 6.5 5.5" />
        <circle cx="17" cy="9" r="2.8" />
        <path d="M21.5 19.5c-.5-2.5-2.3-4-4.5-4" />
      </svg>
    );
  if (name === "BookOpen")
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H3V5Z" />
        <path d="M21 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8V5Z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3 4 6v6c0 4.5 3.4 8.6 8 9 4.6-.4 8-4.5 8-9V6l-8-3Z" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
