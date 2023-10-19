export interface TractiveLocation {
  time: number;
  time_rcvd: number;
  sensor_used: string;
  pos_status: any;
  latlong: number[];
  speed: number;
  course: number;
  pos_uncertainty: number;
  _id: string;
  _type: string;
  _version: string;
  altitude: number;
  report_id: string;
  nearby_user_id: any;
  power_saving_zone_id: any;
}
