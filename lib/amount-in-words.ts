// Amount in words with Indian grouping (thousand, lakh, crore).
// Phase 2: check the wording against the backend's src/core/amountInWords.ts.

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
  "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function belowHundred(n: number): string {
  if (n < 20) return ONES[n];
  return [TENS[Math.trunc(n / 10)], ONES[n % 10]].filter(Boolean).join(" ");
}

function belowThousand(n: number): string {
  const hundreds = Math.trunc(n / 100);
  return [hundreds ? `${ONES[hundreds]} Hundred` : "", belowHundred(n % 100)]
    .filter(Boolean)
    .join(" ");
}

function wholeNumber(n: number): string {
  if (n === 0) return "Zero";
  const crore = Math.trunc(n / 10000000);
  const lakh = Math.trunc(n / 100000) % 100;
  const thousand = Math.trunc(n / 1000) % 100;
  const rest = n % 1000;
  return [
    crore ? `${wholeNumber(crore)} Crore` : "",
    lakh ? `${belowHundred(lakh)} Lakh` : "",
    thousand ? `${belowHundred(thousand)} Thousand` : "",
    belowThousand(rest),
  ]
    .filter(Boolean)
    .join(" ");
}

/** 803300 -> "Rupees Eight Thousand Thirty Three Only" */
export function amountInWords(paise: number): string {
  const rupees = Math.trunc(Math.abs(paise) / 100);
  const fraction = Math.abs(paise) % 100;
  const paiseWords = fraction ? ` and ${belowHundred(fraction)} Paise` : "";
  return `Rupees ${wholeNumber(rupees)}${paiseWords} Only`;
}
