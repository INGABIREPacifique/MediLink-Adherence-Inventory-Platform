// Minimal i18n layer. The proposal (MediLink_Rwanda_Proposal.docx §5) is
// explicit: "Kinyarwanda-first voice and SMS content, with French/English
// as secondary options." Every user-facing string on staff-facing screens
// should route through t() so this isn't retrofitted later.
//
// Scope note: USSD/IVR patient-facing copy is Kinyarwanda-first per the
// proposal; this staff dashboard defaults to English (the pilot ward staff's
// working language) but every screen must still be translatable — hence
// building the layer now, even with a small dictionary.

export type Lang = 'en' | 'rw' | 'fr';

type Dict = Record<string, Record<Lang, string>>;

const dict: Dict = {
  dashboard: { en: 'Dashboard', rw: 'Ikibaho', fr: 'Tableau de bord' },
  stock_tracking: { en: 'Stock Tracking', rw: 'Gukurikirana ibicuruzwa', fr: 'Suivi des stocks' },
  ai_forecasting: { en: 'AI Forecasting', rw: "Ibyifuzo by'ikoranabuhanga", fr: 'Prévisions IA' },
  reports: { en: 'Reports', rw: 'Raporo', fr: 'Rapports' },
  settings: { en: 'Settings', rw: 'Igenamiterere', fr: 'Paramètres' },
  patient_enrollment: { en: 'Patient Enrollment', rw: "Kwandika umurwayi", fr: 'Inscription du patient' },
  shift_handover: { en: 'Shift Handover', rw: 'Impuzu y\u2019icyiciro', fr: 'Passation de service' },
  discharge_summary: { en: 'Discharge Summary', rw: 'Incamake yo gusohoka', fr: 'Résumé de sortie' },
  escalation_inbox: { en: 'Escalation Inbox', rw: 'Ubutumwa bw\u2019ihutirwa', fr: 'Boîte des escalades' },
  press_1_confirm: { en: 'Press 1 to confirm you took your medicine', rw: 'Kanda 1 kwemeza ko wafashe umuti', fr: 'Appuyez sur 1 pour confirmer' },
}

let currentLang: Lang = 'en'

export function setLang(lang: Lang) {
  currentLang = lang
}

export function getLang(): Lang {
  return currentLang
}

export function t(key: keyof typeof dict): string {
  return dict[key]?.[currentLang] ?? key
}
