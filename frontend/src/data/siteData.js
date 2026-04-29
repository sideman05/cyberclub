import {
  Award,
  Binary,
  BookOpen,
  CalendarDays,
  Code2,
  Cpu,
  Flag,
  Globe2,
  GraduationCap,
  Handshake,
  Layers3,
  LockKeyhole,
  MapPin,
  Megaphone,
  Network,
  RadioTower,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Trophy,
  UsersRound,
  Zap,
} from 'lucide-react';

const createLeaderPortrait = (name, initials, accent = '#38bdf8') => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" role="img" aria-label="${name}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.96" />
          <stop offset="52%" stop-color="#081221" stop-opacity="0.98" />
          <stop offset="100%" stop-color="#020817" stop-opacity="1" />
        </linearGradient>
        <radialGradient id="glow" cx="30%" cy="28%" r="72%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.24" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="600" rx="42" fill="url(#bg)" />
      <circle cx="650" cy="90" r="170" fill="url(#glow)" />
      <circle cx="160" cy="500" r="140" fill="#dfff00" fill-opacity="0.08" />
      <g fill="none" stroke="#ffffff" stroke-opacity="0.11" stroke-width="18">
        <path d="M86 124h228" />
        <path d="M520 476h194" />
        <path d="M118 468h90" />
        <path d="M592 122h122" />
      </g>
      <circle cx="400" cy="286" r="128" fill="#ffffff" fill-opacity="0.07" />
      <circle cx="400" cy="286" r="98" fill="#ffffff" fill-opacity="0.08" />
      <text x="400" y="308" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="110" font-weight="800" fill="#ffffff">${initials}</text>
      <text x="400" y="430" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="700" letter-spacing="6" fill="#f8fafc" fill-opacity="0.72">DIT CYBERCLUB</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const createGalleryPreview = (title, category, accent = '#38bdf8') => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800" role="img" aria-label="${title}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.96" />
          <stop offset="55%" stop-color="#081221" stop-opacity="0.98" />
          <stop offset="100%" stop-color="#020817" stop-opacity="1" />
        </linearGradient>
        <radialGradient id="glow" cx="28%" cy="24%" r="75%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" rx="44" fill="url(#bg)" />
      <circle cx="940" cy="150" r="220" fill="url(#glow)" />
      <circle cx="270" cy="640" r="170" fill="#dfff00" fill-opacity="0.08" />
      <g fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="14">
        <path d="M104 118h262" />
        <path d="M840 678h220" />
        <path d="M128 652h136" />
        <path d="M886 108h146" />
      </g>
      <rect x="124" y="198" width="380" height="270" rx="28" fill="#ffffff" fill-opacity="0.08" />
      <rect x="556" y="158" width="520" height="350" rx="36" fill="#ffffff" fill-opacity="0.06" />
      <circle cx="368" cy="334" r="82" fill="#ffffff" fill-opacity="0.14" />
      <circle cx="816" cy="330" r="118" fill="#ffffff" fill-opacity="0.1" />
      <text x="600" y="598" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="78" font-weight="800" fill="#ffffff">${title}</text>
      <text x="600" y="654" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="26" font-weight="600" letter-spacing="5" fill="#f8fafc" fill-opacity="0.72">${category.toUpperCase()}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const createBlogCover = (title, category, accent = '#38bdf8') => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-label="${title}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.96" />
          <stop offset="48%" stop-color="#091120" stop-opacity="0.98" />
          <stop offset="100%" stop-color="#020817" stop-opacity="1" />
        </linearGradient>
        <radialGradient id="glow" cx="30%" cy="24%" r="78%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>
        <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>
      <rect width="1600" height="900" rx="52" fill="url(#bg)" />
      <circle cx="1320" cy="140" r="260" fill="url(#glow)" />
      <circle cx="250" cy="740" r="220" fill="#dfff00" fill-opacity="0.08" />
      <g opacity="0.42" filter="url(#blur)">
        <circle cx="980" cy="260" r="180" fill="${accent}" fill-opacity="0.18" />
        <circle cx="1160" cy="520" r="220" fill="#38bdf8" fill-opacity="0.16" />
      </g>
      <g fill="none" stroke="#ffffff" stroke-opacity="0.1" stroke-width="16">
        <path d="M120 140h320" />
        <path d="M1140 748h360" />
        <path d="M160 720h200" />
        <path d="M1240 132h180" />
      </g>
      <g fill="#ffffff" fill-opacity="0.08">
        <rect x="122" y="196" width="520" height="360" rx="36" />
        <rect x="700" y="168" width="720" height="430" rx="42" />
      </g>
      <text x="800" y="576" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="86" font-weight="900" fill="#ffffff">${title}</text>
      <text x="800" y="648" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="30" font-weight="700" letter-spacing="7" fill="#f8fafc" fill-opacity="0.78">${category.toUpperCase()}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const createEventPoster = (title, category, accent = '#38bdf8') => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-label="${title}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.96" />
          <stop offset="50%" stop-color="#081221" stop-opacity="0.98" />
          <stop offset="100%" stop-color="#020817" stop-opacity="1" />
        </linearGradient>
        <radialGradient id="glow" cx="26%" cy="22%" r="78%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.2" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" rx="52" fill="url(#bg)" />
      <circle cx="1280" cy="160" r="250" fill="url(#glow)" />
      <circle cx="220" cy="720" r="190" fill="#dfff00" fill-opacity="0.08" />
      <g fill="none" stroke="#ffffff" stroke-opacity="0.1" stroke-width="16">
        <path d="M120 136h360" />
        <path d="M1120 770h360" />
        <path d="M136 710h150" />
        <path d="M1220 112h180" />
      </g>
      <g fill="#ffffff" fill-opacity="0.08">
        <rect x="118" y="188" width="520" height="390" rx="38" />
        <rect x="700" y="146" width="760" height="470" rx="44" />
      </g>
      <circle cx="360" cy="356" r="104" fill="#ffffff" fill-opacity="0.12" />
      <circle cx="1110" cy="344" r="136" fill="#ffffff" fill-opacity="0.1" />
      <text x="800" y="580" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="86" font-weight="900" fill="#ffffff">${title}</text>
      <text x="800" y="652" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="28" font-weight="700" letter-spacing="7" fill="#f8fafc" fill-opacity="0.78">${category.toUpperCase()}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Leaders', path: '/leaders' },
  { label: 'Blog', path: '/blog' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Events', path: '/events' },
  { label: 'Contact', path: '/contact' },
];

export const stats = [
  { value: '100+', label: 'Members', icon: UsersRound },
  { value: '20+', label: 'Workshops', icon: GraduationCap },
  { value: '10+', label: 'Events', icon: CalendarDays },
  { value: '5+', label: 'Projects', icon: Code2 },
];

export const services = [
  {
    title: 'Cybersecurity Training',
    text: 'Hands-on sessions for network security, digital safety, and defensive skills.',
    icon: ShieldCheck,
  },
  {
    title: 'Ethical Hacking Workshops',
    text: 'Learn penetration testing basics, responsible disclosure, and real-world lab practice.',
    icon: TerminalSquare,
  },
  {
    title: 'CTF Competitions',
    text: 'Build practical problem-solving skills through capture-the-flag challenges.',
    icon: Trophy,
  },
  {
    title: 'Tech Talks',
    text: 'Student-led talks covering web security, Linux, networking, privacy, and AI safety.',
    icon: RadioTower,
  },
  {
    title: 'Community Projects',
    text: 'Collaborate on tools, awareness campaigns, and campus security initiatives.',
    icon: Layers3,
  },
];

export const values = [
  { title: 'Ethics First', text: 'We promote responsible security learning and safe digital practices.', icon: ShieldCheck },
  { title: 'Continuous Learning', text: 'We keep improving through labs, research, events, and peer mentorship.', icon: BookOpen },
  { title: 'Teamwork', text: 'We build stronger skills through collaboration and shared knowledge.', icon: Handshake },
  { title: 'Innovation', text: 'We encourage students to create practical solutions to real problems.', icon: Sparkles },
  { title: 'Digital Responsibility', text: 'We help students understand privacy, safety, and ethical technology use.', icon: Globe2 },
];

export const leaders = [
  {
    fullName: 'Amani Joseph',
    position: 'President',
    bio: 'Coordinates the club vision, partnerships, and student cybersecurity initiatives across DIT.',
    initials: 'AJ',
    image: createLeaderPortrait('Amani Joseph', 'AJ', '#38bdf8'),
  },
  {
    fullName: 'Neema William',
    position: 'Vice President',
    bio: 'Supports strategy, member engagement, and leadership operations for club activities.',
    initials: 'NW',
    image: createLeaderPortrait('Neema William', 'NW', '#00d4ff'),
  },
  {
    fullName: 'Brian Michael',
    position: 'General Secretary',
    bio: 'Manages communication, documentation, meeting records, and official club updates.',
    initials: 'BM',
    image: createLeaderPortrait('Brian Michael', 'BM', '#dfff00'),
  },
  {
    fullName: 'Faraja Peter',
    position: 'Technical Lead',
    bio: 'Leads labs, technical workshops, CTF preparation, and practical learning tracks.',
    initials: 'FP',
    image: createLeaderPortrait('Faraja Peter', 'FP', '#2563eb'),
  },
  {
    fullName: 'Glory Daniel',
    position: 'Events Coordinator',
    bio: 'Plans bootcamps, awareness sessions, competitions, and community engagement programs.',
    initials: 'GD',
    image: createLeaderPortrait('Glory Daniel', 'GD', '#8b5cf6'),
  },
  {
    fullName: 'Kelvin Thomas',
    position: 'Media and Communications Lead',
    bio: 'Creates digital campaigns, event coverage, graphics, and online community content.',
    initials: 'KT',
    image: createLeaderPortrait('Kelvin Thomas', 'KT', '#22c55e'),
  },
];

export const blogPosts = [
  {
    id: 'phishing-attacks',
    title: 'Understanding Phishing Attacks',
    category: 'Awareness',
    date: 'Apr 12, 2026',
    text: 'Learn how social engineering tricks users and how to identify suspicious links, messages, and login pages.',
    author: 'Cyber Club DIT Research Team',
    readTime: '6 min read',
    tags: ['Phishing', 'Social Engineering', 'Awareness'],
    content:
      'Phishing remains one of the most successful cyberattack methods because it targets human behavior. Attackers imitate trusted services to trick users into revealing passwords, OTP codes, or sensitive information. To stay safe, always verify sender domains, avoid urgent panic-driven links, and use multi-factor authentication. Students should also practice reporting suspicious emails early so incidents can be contained before spreading.',
    icon: ScanSearch,
    image: createBlogCover('Understanding Phishing Attacks', 'Awareness', '#8b5cf6'),
  },
  {
    id: 'intro-ethical-hacking',
    title: 'Introduction to Ethical Hacking',
    category: 'Ethical Hacking',
    date: 'Apr 06, 2026',
    text: 'A beginner-friendly path into security testing, lab practice, and responsible vulnerability discovery.',
    author: 'Technical Training Desk',
    readTime: '8 min read',
    tags: ['Ethical Hacking', 'Labs', 'Beginners'],
    content:
      'Ethical hacking is the authorized practice of testing systems to discover vulnerabilities before malicious actors do. Beginners should start with legal lab environments, focus on reconnaissance and web security basics, and document findings clearly. Responsible disclosure is critical: vulnerabilities must be reported privately and ethically. Building a strong foundation in networking and Linux greatly improves practical testing skills.',
    icon: TerminalSquare,
    image: createBlogCover('Introduction to Ethical Hacking', 'Ethical Hacking', '#00d4ff'),
  },
  {
    id: 'stay-safe-online',
    title: 'How to Stay Safe Online',
    category: 'Digital Safety',
    date: 'Mar 29, 2026',
    text: 'Simple practices that protect students from account takeover, scams, and unsafe public networks.',
    author: 'Digital Safety Committee',
    readTime: '5 min read',
    tags: ['Digital Safety', 'Privacy', 'Students'],
    content:
      'Daily security habits make a huge difference. Use strong unique passwords, enable MFA, update devices regularly, and avoid sharing sensitive details on public platforms. On campus or public Wi-Fi, avoid logging into critical services unless traffic is encrypted and trusted. Regular backups and cautious app permissions help reduce risk from malware and account compromise.',
    icon: LockKeyhole,
    image: createBlogCover('How to Stay Safe Online', 'Digital Safety', '#22c55e'),
  },
  {
    id: 'basics-web-security',
    title: 'Basics of Web Security',
    category: 'Web Security',
    date: 'Mar 18, 2026',
    text: 'Explore common web risks like XSS, SQL injection, broken access control, and insecure authentication.',
    author: 'Web Security Unit',
    readTime: '9 min read',
    tags: ['Web Security', 'OWASP', 'Defensive Coding'],
    content:
      'Web security starts with understanding common vulnerabilities and secure coding patterns. Input validation, output encoding, and strong access control checks are essential in every application layer. Developers should avoid hardcoded secrets, enforce secure session management, and implement proper authorization on every sensitive endpoint. Consistent testing with security checklists helps reduce exploitable weaknesses.',
    icon: Code2,
    image: createBlogCover('Basics of Web Security', 'Web Security', '#2563eb'),
  },
  {
    id: 'password-best-practices',
    title: 'Password Security Best Practices',
    category: 'Security Basics',
    date: 'Mar 10, 2026',
    text: 'Understand password managers, passphrases, MFA, and safer ways to protect important accounts.',
    author: 'Cyber Awareness Team',
    readTime: '4 min read',
    tags: ['Passwords', 'MFA', 'Account Security'],
    content:
      'The strongest password strategy combines long passphrases, a trusted password manager, and multi-factor authentication. Reusing credentials across services is risky because one breach can expose multiple accounts. Use unique credentials for each platform and prioritize MFA for email, banking, and educational portals. Periodic credential hygiene reviews help identify weak or reused passwords early.',
    icon: Binary,
    image: createBlogCover('Password Security Best Practices', 'Security Basics', '#dfff00'),
  },
  {
    id: 'ctf-getting-started',
    title: 'Getting Started with CTF Challenges',
    category: 'CTF',
    date: 'Mar 02, 2026',
    text: 'A practical guide to categories, tools, mindset, and how new members can begin competing.',
    author: 'CTF Coordination Team',
    readTime: '7 min read',
    tags: ['CTF', 'Practice', 'Problem Solving'],
    content:
      'Capture The Flag challenges train practical cybersecurity skills through hands-on puzzles. New members should begin with web and cryptography basics, then gradually move into reverse engineering and forensics. Keep notes, automate repetitive tasks, and collaborate with teammates to improve speed and depth. Consistent participation builds confidence and prepares students for real-world security problem solving.',
    icon: Flag,
    image: createBlogCover('Getting Started with CTF Challenges', 'CTF', '#8b5cf6'),
  },
];

export const galleryItems = [
  {
    title: 'Cybersecurity Bootcamp',
    category: 'Workshops',
    icon: ShieldCheck,
    tone: 'blue',
    image: createGalleryPreview('Cybersecurity Bootcamp', 'Workshops', '#38bdf8'),
  },
  {
    title: 'Linux Lab Session',
    category: 'Training Sessions',
    icon: TerminalSquare,
    tone: 'cyan',
    image: createGalleryPreview('Linux Lab Session', 'Training Sessions', '#00d4ff'),
  },
  {
    title: 'Capture The Flag',
    category: 'CTF Competitions',
    icon: Trophy,
    tone: 'lime',
    image: createGalleryPreview('Capture The Flag', 'CTF Competitions', '#dfff00'),
  },
  {
    title: 'Digital Safety Campaign',
    category: 'Community Events',
    icon: Megaphone,
    tone: 'blue',
    image: createGalleryPreview('Digital Safety Campaign', 'Community Events', '#2563eb'),
  },
  {
    title: 'Tech Talk Evening',
    category: 'Tech Talks',
    icon: RadioTower,
    tone: 'cyan',
    image: createGalleryPreview('Tech Talk Evening', 'Tech Talks', '#22c55e'),
  },
  {
    title: 'Innovation Sprint',
    category: 'Projects',
    icon: Cpu,
    tone: 'lime',
    image: createGalleryPreview('Innovation Sprint', 'Projects', '#8b5cf6'),
  },
  {
    title: 'Networking Practice',
    category: 'Training Sessions',
    icon: Network,
    tone: 'blue',
    image: createGalleryPreview('Networking Practice', 'Training Sessions', '#0ea5e9'),
  },
  {
    title: 'Campus Awareness Day',
    category: 'Digital Safety Campaigns',
    icon: UsersRound,
    tone: 'cyan',
    image: createGalleryPreview('Campus Awareness Day', 'Digital Safety Campaigns', '#14b8a6'),
  },
];

export const events = [
  {
    id: 'cybersecurity-bootcamp',
    day: '18',
    month: 'May',
    title: 'Cybersecurity Bootcamp',
    location: 'DIT Main Campus',
    time: '09:00 AM',
    text: 'A practical beginner-friendly bootcamp on cybersecurity foundations and safe digital habits.',
    category: 'Bootcamp',
    image: createEventPoster('Cybersecurity Bootcamp', 'Bootcamp', '#38bdf8'),
  },
  {
    id: 'ethical-hacking-workshop',
    day: '25',
    month: 'May',
    title: 'Ethical Hacking Workshop',
    location: 'Computer Lab 3',
    time: '02:00 PM',
    text: 'Hands-on training covering reconnaissance, web security basics, and ethical testing workflows.',
    category: 'Workshop',
    image: createEventPoster('Ethical Hacking Workshop', 'Workshop', '#00d4ff'),
  },
  {
    id: 'ctf-challenge',
    day: '08',
    month: 'Jun',
    title: 'CTF Challenge',
    location: 'Innovation Hub',
    time: '10:00 AM',
    text: 'Team-based challenge for students to practice problem solving, cryptography, web, and forensics.',
    category: 'Competition',
    image: createEventPoster('CTF Challenge', 'Competition', '#dfff00'),
  },
  {
    id: 'digital-safety-awareness-day',
    day: '15',
    month: 'Jun',
    title: 'Digital Safety Awareness Day',
    location: 'DIT Auditorium',
    time: '11:00 AM',
    text: 'Community awareness session about phishing, password safety, privacy, and online scams.',
    category: 'Awareness',
    image: createEventPoster('Digital Safety Awareness Day', 'Awareness', '#2563eb'),
  },
  {
    id: 'web-security-training',
    day: '22',
    month: 'Jun',
    title: 'Web Security Training',
    location: 'Computer Lab 2',
    time: '01:00 PM',
    text: 'Explore common web vulnerabilities and defensive techniques through guided examples.',
    category: 'Training',
    image: createEventPoster('Web Security Training', 'Training', '#8b5cf6'),
  },
  {
    id: 'linux-for-cybersecurity',
    day: '29',
    month: 'Jun',
    title: 'Linux for Cybersecurity Session',
    location: 'DIT ICT Center',
    time: '03:00 PM',
    text: 'Learn essential Linux commands, shell navigation, permissions, and security tooling basics.',
    category: 'Training',
    image: createEventPoster('Linux for Cybersecurity Session', 'Training', '#22c55e'),
  },
];

export const contactDetails = [
  { label: 'Location', value: 'Dar es Salaam Institute of Technology', icon: MapPin },
  { label: 'Email', value: 'cyberclub@dit.ac.tz', icon: Globe2 },
  { label: 'Focus', value: 'Ethical hacking, digital safety, and innovation', icon: Award },
  { label: 'Community', value: 'Open to passionate DIT students', icon: UsersRound },
];

export const socials = ['LinkedIn', 'Instagram', 'X/Twitter', 'GitHub'];

export const terminalLines = [
  '> scanning network...',
  '> vulnerabilities found: 0',
  '> system secured',
  '> Cyber Club DIT active',
  '> building secure future...',
];

export const heroSignals = [
  { label: 'Ethical Hacking', icon: ShieldCheck },
  { label: 'CTF Ready', icon: Trophy },
  { label: 'Secure Labs', icon: LockKeyhole },
  { label: 'Student Led', icon: UsersRound },
];

export const aboutHighlights = [
  { title: 'Practical learning', text: 'Labs, workshops, and challenges designed to make security skills real.', icon: TerminalSquare },
  { title: 'Community growth', text: 'A place for students to learn together, share ideas, and build confidence.', icon: UsersRound },
  { title: 'Responsible innovation', text: 'We combine creativity with ethics to build safe digital solutions.', icon: Zap },
];
