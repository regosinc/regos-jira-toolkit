import api from '@forge/api';
import uuid from 'v4-uuid';
import { to } from 'await-to-js';

import { logInfo, logError, getPrettyfiedJSON, APP_TYPE } from './log.service';

const storedDataKey = 'regosJIRAToolkitTasks';

export const getTasks = async (issueKey) => {    
    logInfo(APP_TYPE.PANEL_TASKS, `Get Tasks for Issue Key: ${issueKey} and Datakey: ${storedDataKey}`);

    const [error, userTasksData] = await to(api.store.onJiraIssue(issueKey).get(`${storedDataKey}`));    

    if (error) {
        logError(APP_TYPE.PANEL_TASKS, `Error loading stored tasks for Issue Key: ${issueKey}. Reason: ${error}`);
        //TODO: Show notification to user ?
        return null;
    }

    // const result = await Promise.all(userTasksData.map(async task => { 
    //     const res = await api.asUser().requestJira(`/rest/api/3/user?accountId=${task.updatedby}`);
    //     const jsonUserData = await res.json();
    //     //task.updatedby_username = userData.json();
    //     logInfo(APP_TYPE.PANEL_TASKS, `User data: ${getPrettyfiedJSON(jsonUserData)}`);
    // }));

    logInfo(APP_TYPE.PANEL_TASKS, `Loaded tasks for Issue Key: ${issueKey}. Data:  ${getPrettyfiedJSON(userTasksData)}`);

    return userTasksData || [];
}

export const addTask = async (issueKey, accountId, description, allTasks) => {    
    const newTask = {
        id: uuid(),
        description,
        finished: false,
        createdby: accountId,
        updatedby: accountId,
        created: new Date(),
        updated: new Date()
    };

    const tasks = allTasks.map(x => x);
    tasks.push(newTask);

    const updatedTasks = await updateTasks(issueKey, tasks);

    if (updatedTasks) {
        return tasks;
    }
    else {
        return allTasks;
    }
}

export const updateTasks = async (issueKey, allTasks) => {
    const [error,] = await to(api.store.onJiraIssue(issueKey).set(`${storedDataKey}`, allTasks));

    if (error) {
        logError(APP_TYPE.PANEL_TASKS, `Error updating tasks for Issue Key: ${issueKey} and Tasks: ${JSON.stringify(allTasks)}. Reason: ${JSON.stringify(error)} - ${error}.`);
        return false;
    }

    logInfo(APP_TYPE.PANEL_TASKS, `Tasks updated successfully for Issue Key: ${issueKey} and Tasks: ${JSON.stringify(allTasks)}.`)
    return true;
}
