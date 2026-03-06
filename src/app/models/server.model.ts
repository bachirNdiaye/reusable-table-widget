export interface Server {
  id: string;
  serial: string;
  name: string;
  assetName: string;
  version: string;
  serverType: string;
  license: string;
  hardware: string;
  status: string;
  warningsCount: number;
  lastCommDate: Date;
}
