import api from '@forge/api';
import { APP_TYPE, logInfo, logError } from './log.service';

export const getMyself = async () => {
    const result = await api.asUser().requestJira('/rest/api/3/myself');

    if (result.status === 200) {
        const data = await result.json();
        logInfo(APP_TYPE.COMMON, `Myself Data: ${JSON.stringify(result)}.`);

        return data;
    } else {
        logError(APP_TYPE.COMMON, `Error getting Myself data from Jira API. Reason: ${JSON.stringify(result)}.`);
        return null;
    } 
}
