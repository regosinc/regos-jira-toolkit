import api from '@forge/api';
import uuid from 'v4-uuid';
import { to } from 'await-to-js';

import { logInfo, logError, getPrettyfiedJSON, APP_TYPE } from './log.service';

const storedDataKey = 'regosJIRAToolkitNotes_';

export const getUserNotes = async (issueKey, accountId) => {
    accountId = replaceInvalidCharsForObjectKey(accountId);

    logInfo(APP_TYPE.GLANCE_NOTES, `Get User Notes for user: ${accountId}, Issue Key: ${issueKey} and Datakey: ${storedDataKey}${accountId}`);

    const [error, userNotesData] = await to(api.store.onJiraIssue(issueKey).get(`${storedDataKey}${accountId}`));

    if (error) {
        logError(APP_TYPE.GLANCE_NOTES, `Error loading stored notes for user: ${accountId} and Issue Key: ${issueKey}. Reason: ${error}`);
        //TODO: Show notification to user ?
        return null;
    }

    logInfo(APP_TYPE.GLANCE_NOTES, `Loaded notes for user: ${accountId} and Issue Key: ${issueKey}. Data:  ${getPrettyfiedJSON(userNotesData)}`);

    if (userNotesData)
        return userNotesData.sort((a, b) => new Date(b.updated) - new Date(a.updated));

    return userNotesData || [];
}

export const addUserNote = async (issueKey, accountId, note, allNotes) => {
    accountId = replaceInvalidCharsForObjectKey(accountId);

    const newNote = {
        id: uuid(),
        note,
        created: new Date(),
        updated: new Date()
    };

    const notes = allNotes.map(x => x);
    notes.push(newNote);

    const updateNotes = await updateUserNotes(issueKey, accountId, notes);

    if (updateNotes) {
        return notes;
    }
    else {
        return allNotes;
    }
}

export const updateUserNotes = async (issueKey, accountId, allNotes) => {
    accountId = replaceInvalidCharsForObjectKey(accountId);
    
    const [error,] = await to(api.store.onJiraIssue(issueKey).set(`${storedDataKey}${accountId}`, allNotes.sort((a, b) => new Date(b.updated) - new Date(a.updated))));

    if (error) {
        logError(APP_TYPE.GLANCE_NOTES, `Error updating notes for user: ${accountId}, Issue Key: ${issueKey} and Notes: ${JSON.stringify(allNotes)}. Reason: ${JSON.stringify(error)} - ${error}.`);
        return false;
    }

    logInfo(APP_TYPE.GLANCE_NOTES, `Notes updated successfully for user: ${accountId}, Issue Key: ${issueKey} and Notes: ${JSON.stringify(allNotes)}.`)
    return true;
}

const replaceInvalidCharsForObjectKey = (text) => {
    return text.replace(/[:-]/gi, '_');
}