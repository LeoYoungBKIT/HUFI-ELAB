import config from "../configs/app"
import * as API from "../configs/apiHelper";
import { IScheduleType } from '../types/scheduleType';

const { isProd } = config;
const API_ENDPOINT = "https://www.aspsite.somee.com";

export const getSchedules = async () => {
	const url = `${API_ENDPOINT}/api/schedules`;
	const schedules: IScheduleType[] = await API.get<IScheduleType[]>(url);

	let formatedSchedules = schedules.map(x => {
		return {
			...x,
			"DateStudy": Number((Number(x.DateStudy) / (24 * 60 * 60)).toFixed()) * (24 * 60 * 60)
		}
	})

	return formatedSchedules;
}