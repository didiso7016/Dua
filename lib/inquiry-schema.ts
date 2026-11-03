// POST /api/inquiries 的驗證（與 /api/bookings 相同做法：前端產生 UUID 作為冪等鍵＋honeypot 欄位 website）。
import {z} from 'zod';
export const inquirySchema=z.object({
 id:z.string().uuid(),
 type:z.enum(['general','partner']),
 name:z.string().trim().min(1).max(50),
 phone:z.string().trim().regex(/^[0-9+() -]{8,20}$/),
 email:z.union([z.literal(''),z.string().trim().email().max(120)]),
 company:z.string().trim().max(100),
 message:z.string().trim().min(1).max(1000),
 sourcePage:z.string().max(200).refine(v=>v===''||(v.startsWith('/')&&!v.startsWith('//'))),
 consent:z.literal(true),
 website:z.string().max(0),
}).superRefine((v,ctx)=>{if(v.type==='partner'&&!v.company)ctx.addIssue({code:z.ZodIssueCode.custom,path:['company'],message:'合作洽詢請填寫公司名稱'})});
export type InquiryInput=z.infer<typeof inquirySchema>;
