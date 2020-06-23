import ForgeUI, { render, IssueGlance, Fragment, Button, Form, TextArea, useProductContext, useState, ModalDialog, Text, ButtonSet } from '@forge/ui';
import moment from 'moment-timezone';

import { logInfo, getPrettyfiedJSON, APP_TYPE, logWarning } from './services/log.service';
import { getUserNotes, addUserNote, updateUserNotes } from './services/notes.service';
import { getTimezone } from './services/common.service';

const App = () => {
  // Modal
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState({});
  const [isModalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState({});
  const [noteErrorValidation, setNoteErrorValidation] = useState(false);

  const noteMaxLength = 30000;

  // Context data
  const context = useProductContext();
  const accountId = context.accountId;
  const issueKey = context.platformContext.issueKey;

  logInfo(APP_TYPE.GLANCE_NOTES, `Account Id: ${accountId} - Issue Key: ${issueKey}`);

  // Read user stored data
  const [storedNotes, setStoredNotes] = useState(async () => await getUserNotes(issueKey, accountId));
  const [timeZone, setTimeZone] = useState(async () => await getTimezone());

  const addOrEditNote = async (formData) => {
    logInfo(APP_TYPE.GLANCE_NOTES, `${(isEdit ? `Editing Note ${noteToEdit.id} ` : 'Creating new Note:')} ${getPrettyfiedJSON(formData)}`);

    if (!validateNote(formData.newNoteField)) {
      return;
    }

    setNoteErrorValidation(false);

    if (!isEdit) {
      const updatedNotes = await addUserNote(issueKey, accountId, formData.newNoteField, storedNotes);

      setStoredNotes(updatedNotes.sort((a, b) => new Date(b.updated) - new Date(a.updated)));
      setModalOpen(false);

      logInfo(APP_TYPE.GLANCE_NOTES, `Note created successfully: ${getPrettyfiedJSON(formData)}`);
    } else {
      // Edit note
      const values = [...storedNotes];
      const updatedNote = values.find(x => x.id === noteToEdit.id);
      updatedNote.note = formData.newNoteField;
      updatedNote.updated = new Date();

      const result = await updateUserNotes(issueKey, accountId, values);

      if (result) {
        setStoredNotes(values);
        setNoteToEdit({});
        setModalOpen(false);
        logInfo(APP_TYPE.GLANCE_NOTES, `Note edited successfully: ${getPrettyfiedJSON(formData)}`);
      } else {
        //TODO: Notify ?
        logInfo(APP_TYPE.GLANCE_NOTES, `Note could not be edited: ${getPrettyfiedJSON(formData)}`);
      }
    }
  }

  const validateNote = (text) => {
    if (text.length > noteMaxLength) {
      logWarning(APP_TYPE.GLANCE_NOTES, `Validation error when creating/editing a note, data exceed ${noteMaxLength} chars.`);
      setNoteErrorValidation(true);
      return false;
    }

    return true;
  }

  const deleteNote = async () => {
    logInfo(APP_TYPE.GLANCE_NOTES, `Delete Note: ${noteToDelete.id}`);

    const notesWithRemoved = storedNotes.filter(x => x.id !== noteToDelete.id);

    const result = await updateUserNotes(issueKey, accountId, notesWithRemoved);

    if (result) {
      setStoredNotes(notesWithRemoved);
      setNoteToDelete({});
      setModalDeleteOpen(false);
    }
    //else 
    // TODO: Show notification ?
  }

  return (
    <Fragment>
      <Button text="Add Note" onClick={() => { setIsEdit(false); setModalOpen(true); }} />

      {/* No notes */}
      {storedNotes && storedNotes.length == 0 && <Text>**You don't have any notes yet**</Text>}

      {/* Show existing notes */}
      {storedNotes && storedNotes.length > 0 && <Text>**You have {storedNotes.length} note{storedNotes.length > 1 ? 's' : ''}**</Text>}
      {storedNotes && storedNotes.length > 0 && storedNotes.map(note => {
        return <Fragment>
          <Text>
            {note.note}
          </Text>
          <Text>_Updated at: {moment(note.updated).tz(timeZone).format('MM/DD/YY HH:mm:ss')}_</Text>
          <ButtonSet>
            <Button text="Edit" onClick={() => { setIsEdit(true); setModalOpen(true); setNoteToEdit(note); }} />
            <Button text="Delete" onClick={() => { setModalDeleteOpen(true); setNoteToDelete(note); }} />
          </ButtonSet>
        </Fragment>
      })}

      {/* Create new note / edit modal */}
      {isModalOpen && (
        <ModalDialog header={isEdit ? "Edit Note" : "Add Note"} onClose={() => setModalOpen(false)}>
          <Form onSubmit={addOrEditNote} submitButtonText={isEdit ? "Edit" : "Add Note"}>
            <TextArea isRequired={true} name="newNoteField" label={isEdit ? "Edit Note" : "New Note"} placeholder="Type your new note ... " defaultValue={isEdit ? noteToEdit.note : ''} />
            {noteErrorValidation && <Text>Note has to be less than {noteMaxLength} chars.</Text>}
          </Form>
        </ModalDialog>
      )}

      {/* Delete modal */}
      {isModalDeleteOpen && (
        <ModalDialog header="Delete Note" onClose={() => setModalDeleteOpen(false)}>
          <Form onSubmit={deleteNote} submitButtonText="Delete">
            <Text>**Are you sure you want to delete the note ?**</Text>
          </Form>
        </ModalDialog>
      )}

    </Fragment>
  );
};

export const run = render(
  <IssueGlance>
    <App />
  </IssueGlance>
);
