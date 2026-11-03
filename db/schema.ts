import {sqliteTable,text,index} from 'drizzle-orm/sqlite-core';
export const projects=sqliteTable('projects',{id:text('id').primaryKey(),data:text('data').notNull(),status:text('status').notNull(),updatedAt:text('updated_at').notNull()},t=>[index('idx_projects_status').on(t.status)]);
export const settings=sqliteTable('settings',{key:text('key').primaryKey(),value:text('value').notNull()});
export const bookings=sqliteTable('bookings',{id:text('id').primaryKey(),projectId:text('project_id').notNull(),data:text('data').notNull(),createdAt:text('created_at').notNull()},t=>[index('idx_bookings_project').on(t.projectId)]);
