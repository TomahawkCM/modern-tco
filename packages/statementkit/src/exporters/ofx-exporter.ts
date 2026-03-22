import type { ParsedTransaction } from "../types";

export interface OFXExportOptions {
  currency?: string;
  accountId?: string;
  bankId?: string;
  accountType?: "CHECKING" | "SAVINGS" | "CREDITCARD";
}

function formatOFXDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function xmlEscape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function exportOFX(
  transactions: ParsedTransaction[],
  options: OFXExportOptions = {}
): string {
  const {
    currency = "USD",
    accountId = "0000000000",
    bankId = "000000000",
    accountType = "CHECKING",
  } = options;

  const now = formatOFXDate(new Date());
  const dates = transactions.map((tx) => tx.date.getTime());
  const startDate = dates.length > 0 ? formatOFXDate(new Date(Math.min(...dates))) : now;
  const endDate = dates.length > 0 ? formatOFXDate(new Date(Math.max(...dates))) : now;

  const txnEntries = transactions
    .map((tx, i) => {
      const trnType = tx.transactionType ?? (tx.amount < 0 ? "DEBIT" : "CREDIT");
      const fitid = tx.fitid ?? `${formatOFXDate(tx.date)}${String(i).padStart(4, "0")}`;
      return `<STMTTRN>
<TRNTYPE>${trnType}
<DTPOSTED>${formatOFXDate(tx.date)}
<TRNAMT>${tx.amount}
<FITID>${fitid}
<NAME>${xmlEscape(tx.description)}
</STMTTRN>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?OFX OFXHEADER="200" VERSION="220" SECURITY="NONE" OLDFILEUID="NONE" NEWFILEUID="NONE"?>
<OFX>
<SIGNONMSGSRSV1>
<SONRS>
<STATUS><CODE>0<SEVERITY>INFO</STATUS>
<DTSERVER>${now}
<LANGUAGE>ENG
</SONRS>
</SIGNONMSGSRSV1>
<BANKMSGSRSV1>
<STMTTRNRS>
<STMTRS>
<CURDEF>${currency}
<BANKACCTFROM>
<BANKID>${bankId}
<ACCTID>${accountId}
<ACCTTYPE>${accountType}
</BANKACCTFROM>
<BANKTRANLIST>
<DTSTART>${startDate}
<DTEND>${endDate}
${txnEntries}
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;
}
