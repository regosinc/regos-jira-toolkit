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
    logInfo(APP_TYPE.GLANCE_NOTES, `Data: ${JSON.stringify(userNotesData)}`);

    logInfo(APP_TYPE.GLANCE_NOTES, `Loaded notes for user: ${accountId} and Issue Key: ${issueKey}. Data:  ${getPrettyfiedJSON(userNotesData)}`);
    return userNotesData || [];
}

export const createUserNote = async (issueKey, accountId, note, allNotes) => {
    accountId = replaceInvalidCharsForObjectKey(accountId);

    const newNote = {
        id: uuid(),
        note,
        created: new Date(),
        updated: new Date()        
    };

    const notes = allNotes.map(x => x);
    notes.push(newNote);

    const [error, addedNote] = await to(api.store.onJiraIssue(issueKey).set(`${storedDataKey}${accountId}`, notes));

    if (error) {
        logError(APP_TYPE.GLANCE_NOTES, `Error creating a new note for user: ${accountId}, Issue Key: ${issueKey} and Note: ${getPrettyfiedJSON(newNote)}. Reason: ${error}.`);
        //TODO: Show notification to user ?
        return allNotes;
    }

    logInfo(APP_TYPE.GLANCE_NOTES, `New note created for user: ${accountId}, Issue Key: ${issueKey} and note: ${getPrettyfiedJSON(newNote)}.`)
    return notes;
}

const replaceInvalidCharsForObjectKey = (text) => {
    return text.replace(/[:-]/gi, '_');
}