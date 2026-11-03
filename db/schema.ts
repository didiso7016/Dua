import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const projects=sqliteTable('projects',{id:text('id').primaryKey(),data:text('data').notNull(),status:text('status').notNull(),updatedAt:text('updated_at').notNull()},t=>[index('idx_projects_status').on(t.status)]);
export const settings=sqliteTable('settings',{key:text('key').primaryKey(),value:text('value').notNull()});
export const bookings=sqliteTable('bookings',{id:text('id').primaryKey(),projectId:text('project_id').notNull(),data:text('data').notNull(),createdAt:text('created_at').notNull()},t=>[index('idx_bookings_project').on(t.projectId)]);
// 洽詢名單（/contact 與彈窗表單）。Sheets 寫入狀態沿用 bookings 的 pending/sent + 60 秒租約模式，改以實體欄位保存。
export const inquiries=sqliteTable('inquiries',{
 id:text('id').primaryKey(),
 type:text('type',{enum:['general','partner']}).notNull(),
 name:text('name').notNull(),
 phone:text('phone').notNull(),
 email:text('email').notNull().default(''),
 company:text('company').notNull().default(''),
 message:text('message').notNull(),
 sourcePage:text('source_page').notNull().default(''),
 consentVersion:text('consent_version').notNull(),
 createdAt:text('created_at').notNull(),
 sheetStatus:text('sheet_status').notNull().default('pending'),
 sheetAttempts:integer('sheet_attempts').notNull().default(0),
 sheetLease:integer('sheet_lease').notNull().default(0),
 sheetAttemptAt:text('sheet_attempt_at'),
},t=>[index('idx_inquiries_created').on(t.createdAt),index('idx_inquiries_type').on(t.type),index('idx_inquiries_sheet').on(t.sheetStatus)]);
