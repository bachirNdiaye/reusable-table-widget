import { Server } from "./server.model";

export type TableAction = 'open-local-admin' | 'move-server' | 'connect-remote-devices' | 'advanced-debug';

export interface TableActionEvent {
  action: TableAction;
  targetRows: Server[];
}
