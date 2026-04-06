interface Provider {
  id: string;
  name: string;
  logo: string | null;
  accredited: boolean;
}

export const providers: Provider[] = [
  { id: "1", name: "FPA Australia", logo: null, accredited: true },
  { id: "2", name: "CFA Institute", logo: null, accredited: true },
  { id: "3", name: "Kaplan Professional", logo: null, accredited: true },
  { id: "4", name: "FINSIA", logo: null, accredited: true },
  { id: "5", name: "SMSF Association", logo: null, accredited: true },
];
