export type UILanguage = "en" | "hi" | "or";

export interface TranslationDictionary {
  appName: string;
  appSubtitle: string;
  facilityTag: string;
  responsibleNotice: string;
  responsibleNoticeDetail: string;
  safetyRulesBtn: string;

  // Header
  newPatientBtn: string;
  demoTourBtn: string;
  privacyBtn: string;
  lowDataOn: string;
  lowDataOff: string;
  allFacilities: string;
  khordhaHospital: string;
  balipatnaPHC: string;
  rourkelaClinic: string;
  iitCampus: string;
  doctorRole: string;
  nurseRole: string;
  adminRole: string;

  // Queue
  queueTitle: string;
  patientsCount: string;
  avgWait: string;
  searchPlaceholder: string;
  allStatus: string;
  waitingStatus: string;
  inReviewStatus: string;
  verifiedStatus: string;
  escalatedStatus: string;
  noPatients: string;
  tokenLabel: string;
  langLabel: string;
  minutesWait: string;

  // Priorities
  priorityRedTag: string;
  priorityOrangeTag: string;
  priorityYellowTag: string;
  priorityGreenTag: string;
  redSub: string;
  orangeSub: string;
  yellowSub: string;
  greenSub: string;

  // Passport Sections
  tabPassport: string;
  tabLab: string;
  tabAudit: string;
  secComplaint: string;
  speakAudioBtn: string;
  reportedSymptoms: string;
  secTimeline: string;
  secSafety: string;
  noSafetyAlerts: string;
  secLab: string;
  secNeededInfo: string;
  secQuestions: string;
  sendToPatientBtn: string;

  // Actions
  actionControls: string;
  btnChangePriority: string;
  btnEscalate: string;
  btnEscalated: string;
  btnMarkDone: string;
  btnMarkedDone: string;
}

export const translations: Record<UILanguage, TranslationDictionary> = {
  en: {
    appName: "SEHAT",
    appSubtitle: "Rural Health Triage • Human-in-the-Loop Clinical Support",
    facilityTag: "Primary Health Centre (PHC)",
    responsibleNotice: "Important Notice:",
    responsibleNoticeDetail: "This platform is an advisory triage aid for health workers. It does not replace a doctor or prescribe medicines.",
    safetyRulesBtn: "Safety Rules",

    // Header
    newPatientBtn: "+ New Patient",
    demoTourBtn: "Demo Tour",
    privacyBtn: "Privacy",
    lowDataOn: "2G Low Data ON",
    lowDataOff: "Standard Data",
    allFacilities: "All Health Centers",
    khordhaHospital: "Khordha District Hospital",
    balipatnaPHC: "Balipatna Rural PHC",
    rourkelaClinic: "Rourkela Steel Plant Clinic",
    iitCampus: "IIT Campus Health Centre",
    doctorRole: "Doctor (Medical Officer)",
    nurseRole: "Triage Nurse / ASHA Worker",
    adminRole: "Facility Administrator",

    // Queue
    queueTitle: "Live Patient Queue",
    patientsCount: "Patients",
    avgWait: "Avg Wait:",
    searchPlaceholder: "Search token, symptoms, or complaint...",
    allStatus: "All Status",
    waitingStatus: "Waiting in Queue",
    inReviewStatus: "Under Review",
    verifiedStatus: "Doctor Verified",
    escalatedStatus: "Escalated to Emergency",
    noPatients: "No patients found in this category.",
    tokenLabel: "Token",
    langLabel: "Lang",
    minutesWait: "mins wait",

    // Priorities
    priorityRedTag: "RED (Urgent Doctor)",
    priorityOrangeTag: "ORANGE (Within 30m)",
    priorityYellowTag: "YELLOW (Wait Queue)",
    priorityGreenTag: "GREEN (Routine)",
    redSub: "Immediate bedside Medical Officer review indicated",
    orangeSub: "Prompt review needed within 30-60 minutes",
    yellowSub: "Standard outpatient review in normal queue sequence",
    greenSub: "Routine outpatient checkup or mild complaint",

    // Passport Sections
    tabPassport: "Triage Slip",
    tabLab: "Lab Reports",
    tabAudit: "Audit Log",
    secComplaint: "1. Chief Medical Complaint",
    speakAudioBtn: "Listen Audio",
    reportedSymptoms: "Reported Symptoms:",
    secTimeline: "2. Symptom Progression Timeline",
    secSafety: "3. Clinical Safety Signals & Alerts",
    noSafetyAlerts: "No acute safety triggers detected. Standard outpatient protocol applies.",
    secLab: "4. Diagnostic Lab Parameters",
    secNeededInfo: "5. Information Still Needed for Triage",
    secQuestions: "6. Follow-up Questions for Patient",
    sendToPatientBtn: "Send to Patient",

    // Actions
    actionControls: "Clinical Actions:",
    btnChangePriority: "Change Urgency",
    btnEscalate: "🩺 Escalate to Doctor",
    btnEscalated: "Escalated to Doctor",
    btnMarkDone: "✓ Mark Reviewed & Done",
    btnMarkedDone: "✓ Verified by Doctor",
  },

  hi: {
    appName: "सेहत (SEHAT)",
    appSubtitle: "ग्रामीण स्वास्थ्य केंद्र सहायता • आसान एवं सुरक्षित ट्राइएज",
    facilityTag: "प्राथमिक स्वास्थ्य केंद्र (PHC)",
    responsibleNotice: "जरूरी सूचना:",
    responsibleNoticeDetail: "यह ऐप केवल स्वास्थ्य कर्मियों की सहायता के लिए है। यह डॉक्टर या दवा का विकल्प नहीं है।",
    safetyRulesBtn: "नियम व सुरक्षा",

    // Header
    newPatientBtn: "+ नया मरीज (New Patient)",
    demoTourBtn: "डेमो देखें (Demo Tour)",
    privacyBtn: "गोपनीयता (Privacy)",
    lowDataOn: "2G कम डेटा चालू",
    lowDataOff: "सामान्य इंटरनेट",
    allFacilities: "सभी स्वास्थ्य केंद्र (All Centers)",
    khordhaHospital: "खोर्धा जिला अस्पताल (District Hospital)",
    balipatnaPHC: "बालीपटना प्राथमिक केंद्र (Rural PHC)",
    rourkelaClinic: "राउरकेला क्लिनिक (Clinic)",
    iitCampus: "आईआईटी स्वास्थ्य केंद्र (Campus)",
    doctorRole: "डॉक्टर (Medical Officer)",
    nurseRole: "नर्स / आशा दीदी (Health Worker)",
    adminRole: "प्रशासक (Admin)",

    // Queue
    queueTitle: "मरीजों की कतार (Patient Queue)",
    patientsCount: "मरीज",
    avgWait: "औसत समय:",
    searchPlaceholder: "टोकन या लक्षण खोजें...",
    allStatus: "सभी (All Status)",
    waitingStatus: "प्रतीक्षारत (Waiting)",
    inReviewStatus: "जांच जारी (In Review)",
    verifiedStatus: "देखा गया (Verified)",
    escalatedStatus: "रेफर किया गया (Escalated)",
    noPatients: "इस श्रेणी में कोई मरीज नहीं है।",
    tokenLabel: "टोकन",
    langLabel: "भाषा",
    minutesWait: "मिनट इंतजार",

    // Priorities
    priorityRedTag: "लाल (तुरंत डॉक्टर)",
    priorityOrangeTag: "नारंगी (30 मिनट में)",
    priorityYellowTag: "पीला (बारी पर)",
    priorityGreenTag: "हरा (मामूली)",
    redSub: "मरीज की स्थिति गंभीर हो सकती है, बिना देरी डॉक्टर को दिखाएं",
    orangeSub: "लक्षण तेज हैं, 30 मिनट में चिकित्सकीय जांच आवश्यक है",
    yellowSub: "सक्रिय परेशानी है, 1-2 घंटे में डॉक्टर जांच करेंगे",
    greenSub: "मामूली समस्या है, सामान्य क्रम में परामर्श लें",

    // Passport Sections
    tabPassport: "केस पर्ची (Slip)",
    tabLab: "जांच रिपोर्ट (Reports)",
    tabAudit: "सिस्टम लॉग (Audit)",
    secComplaint: "1. मरीज की मुख्य परेशानी",
    speakAudioBtn: "बोलकर सुनें",
    reportedSymptoms: "बताए गए लक्षण:",
    secTimeline: "2. बीमारी कब से है (Timeline)",
    secSafety: "3. सुरक्षा नियम व चेतावनी",
    noSafetyAlerts: "कोई आपातकालीन खतरा नहीं पाया गया। सामान्य कतार में जांच करवाएं।",
    secLab: "4. लैब रिपोर्ट जांच (Lab Metrics)",
    secNeededInfo: "5. अस्पताल को क्या जानना बाकी है?",
    secQuestions: "6. मरीज से पूछने योग्य सवाल",
    sendToPatientBtn: "मरीज को भेजें",

    // Actions
    actionControls: "डॉक्टर/नर्स कार्रवाई:",
    btnChangePriority: "प्राथमिकता बदलें",
    btnEscalate: "🩺 डॉक्टर को बुलाएं (Escalate)",
    btnEscalated: "डॉक्टर को भेजा गया",
    btnMarkDone: "✓ मरीज देख लिया (Mark Done)",
    btnMarkedDone: "✓ जांच पूर्ण (Verified)",
  },

  or: {
    appName: "ସେହତ (SEHAT)",
    appSubtitle: "ଗ୍ରାମୀଣ ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ର ସହାୟତା • ସହଜ ଓ ନିରାପଦ ଟ୍ରାଏଜ୍",
    facilityTag: "ପ୍ରାଥମିକ ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ର (PHC)",
    responsibleNotice: "ଜରୁରୀ ସୂଚନା:",
    responsibleNoticeDetail: "ଏହି ଆପ୍ କେବଳ ସ୍ୱାସ୍ଥ୍ୟକର୍ମୀଙ୍କ ସହାୟତା ପାଇଁ ଉଦ୍ଦିଷ୍ଟ। ଏହା ଡାକ୍ତର କିମ୍ବା ଔଷଧର ବିକଳ୍ପ ନୁହେଁ।",
    safetyRulesBtn: "ନିୟମ ଓ ସୁରକ୍ଷା",

    // Header
    newPatientBtn: "+ ନୂଆ ରୋଗୀ (New Patient)",
    demoTourBtn: "ଡେମୋ ଦେଖନ୍ତୁ (Demo)",
    privacyBtn: "ଗୋପନୀୟତା (Privacy)",
    lowDataOn: "୨G କମ୍ ଡାଟା ଚାଲୁ",
    lowDataOff: "ସାଧାରଣ ଇଣ୍ଟରନେଟ୍",
    allFacilities: "ସମସ୍ତ ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ର",
    khordhaHospital: "ଖୋର୍ଦ୍ଧା ଜିଲ୍ଲା ମୁଖ୍ୟ ଚିକିତ୍ସାଳୟ",
    balipatnaPHC: "ବାଳିପାଟଣା ଗ୍ରାମୀଣ PHC",
    rourkelaClinic: "ରାଉରକେଲା କ୍ଲିନିକ୍",
    iitCampus: "ଆଇଆଇଟି ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ର",
    doctorRole: "ଡାକ୍ତର (Medical Officer)",
    nurseRole: "ନର୍ସ / ଆଶା ଦିଦି (ASHA)",
    adminRole: "ପ୍ରଶାସକ (Admin)",

    // Queue
    queueTitle: "ରୋଗୀଙ୍କ ଧାଡ଼ି (Patient Queue)",
    patientsCount: "ରୋଗୀ",
    avgWait: "ହାରାହାରି ସମୟ:",
    searchPlaceholder: "ଟୋକନ୍ କିମ୍ବା ଲକ୍ଷଣ ଖୋଜନ୍ତୁ...",
    allStatus: "ସମସ୍ତ (All Status)",
    waitingStatus: "ଧାଡ଼ିରେ ଅପେକ୍ଷାରତ",
    inReviewStatus: "ଯାଞ୍ଚ ଚାଲିଛି",
    verifiedStatus: "ଡାକ୍ତର ଦେଖିସାରିଛନ୍ତି",
    escalatedStatus: "ଜରୁରୀ ବିଭାଗକୁ ପଠାଗଲା",
    noPatients: "ଏହି ବିଭାଗରେ କୌଣସି ରୋଗୀ ନାହାନ୍ତି।",
    tokenLabel: "ଟୋକନ୍",
    langLabel: "ଭାଷା",
    minutesWait: "ମିନିଟ୍ ଅପେକ୍ଷା",

    // Priorities
    priorityRedTag: "ଲାଲ (ତୁରନ୍ତ ଡାକ୍ତର)",
    priorityOrangeTag: "କମଳା (୩୦ ମିନିଟ୍ ଭିତରେ)",
    priorityYellowTag: "ହଳଦିଆ (ଧାଡ଼ିରେ)",
    priorityGreenTag: "ସବୁଜ (ସାଧାରଣ)",
    redSub: "ରୋଗୀଙ୍କ ଅବସ୍ଥା ଗୁରୁତର ହୋଇପାରେ, ବିଳମ୍ବ ନକରି ତୁରନ୍ତ ଡାକ୍ତରଙ୍କୁ ଦେଖାନ୍ତୁ",
    orangeSub: "ଲକ୍ଷଣ ତୀବ୍ର ଅଛି, ୩୦ ମିନିଟ୍ ମଧ୍ୟରେ ଡାକ୍ତରୀ ପରୀକ୍ଷା ଆବଶ୍ୟକ",
    yellowSub: "ସକ୍ରିୟ ସମସ୍ୟା ଅଛି, ୧-୨ ଘଣ୍ଟା ମଧ୍ୟରେ ଡାକ୍ତର ଦେଖିବେ",
    greenSub: "ସାଧାରଣ ସମସ୍ୟା, ସାଧାରଣ କ୍ରମରେ ପରାମର୍ଶ ନିଅନ୍ତୁ",

    // Passport Sections
    tabPassport: "ରୋଗୀ ପର୍ଚି (Slip)",
    tabLab: "ଲାବ୍ ରିପୋର୍ଟ (Lab)",
    tabAudit: "ସିଷ୍ଟମ୍ ଲଗ୍ (Audit)",
    secComplaint: "୧. ରୋଗୀର ମୁଖ୍ୟ ସମସ୍ୟା",
    speakAudioBtn: "ଶୁଣନ୍ତୁ (Audio)",
    reportedSymptoms: "କୁହାଯାଇଥିବା ଲକ୍ଷଣ:",
    secTimeline: "୨. ରୋଗ କେବେଠାରୁ ହୋଇଛି (Timeline)",
    secSafety: "୩. ସୁରକ୍ଷା ନିୟମ ଓ ସତର୍କତା",
    noSafetyAlerts: "କୌଣସି ଜରୁରୀକାଳୀନ ବିପଦ ଚିହ୍ନଟ ହୋଇନାହିଁ। ସାଧାରଣ ଧାଡ଼ିରେ ଦେଖାନ୍ତୁ।",
    secLab: "୪. ରକ୍ତ ଓ ଲାବ୍ ପରୀକ୍ଷା (Lab Metrics)",
    secNeededInfo: "୫. ଡାକ୍ତରଖାନାକୁ ଆଉ କଣ ଜାଣିବା ଆବଶ୍ୟକ?",
    secQuestions: "୬. ରୋଗୀଙ୍କୁ ପଚାରିବା ପ୍ରଶ୍ନ",
    sendToPatientBtn: "ରୋଗୀଙ୍କୁ ପଠାନ୍ତୁ",

    // Actions
    actionControls: "ଡାକ୍ତର/ନର୍ସ ପଦକ୍ଷେପ:",
    btnChangePriority: "ଅଗ୍ରାଧିକାର ବଦଳାନ୍ତୁ",
    btnEscalate: "🩺 ଡାକ୍ତରଙ୍କୁ ଡାକନ୍ତୁ (Escalate)",
    btnEscalated: "ଡାକ୍ତରଙ୍କୁ ପଠାଗଲା",
    btnMarkDone: "✓ ରୋଗୀ ଦେଖାସରିଛି (Mark Done)",
    btnMarkedDone: "✓ ଡାକ୍ତରୀ ଯାଞ୍ଚ ସମ୍ପୂର୍ଣ୍ଣ",
  },
};
