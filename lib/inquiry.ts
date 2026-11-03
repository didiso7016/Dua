// 洽詢表單共用定義（前台表單、後台列表、Google Sheets）。伺服器端驗證在 lib/inquiry-schema.ts。
export type InquiryType='general'|'partner';
export const inquiryTypes:InquiryType[]=['general','partner'];
export const inquiryTypeLabels:Record<InquiryType,string>={general:'一般洽詢',partner:'合作洽詢'};
export const isInquiryType=(v:unknown):v is InquiryType=>v==='general'||v==='partner';

export type InquiryRow={id:string;type:InquiryType;name:string;phone:string;email:string;company:string;message:string;sourcePage:string;consentVersion:string;createdAt:string;sheetStatus:string;sheetAttempts:number;sheetAttemptAt:string|null};
export const inquiryColumns='id,type,name,phone,email,company,message,source_page AS sourcePage,consent_version AS consentVersion,created_at AS createdAt,sheet_status AS sheetStatus,sheet_attempts AS sheetAttempts,sheet_attempt_at AS sheetAttemptAt';
