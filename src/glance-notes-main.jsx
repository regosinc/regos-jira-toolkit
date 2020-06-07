import ForgeUI, { render, IssueGlance, Fragment, Button, Form, TextArea, useProductContext, useState, ModalDialog, Text, ButtonSet } from '@forge/ui';
import moment from 'moment';

import { logInfo, getPrettyfiedJSON, APP_TYPE } from './services/log.service';
import { getUserNotes, addUserNote, updateUserNotes } from './services/notes.service';

const App = () => {
  // Modal
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState({});

  // Context data
  const context = useProductContext();
  const accountId = context.accountId;
  const issueKey = context.platformContext.issueKey;

  logInfo(APP_TYPE.GLANCE_NOTES, `Account Id: ${accountId} - Issue Key: ${issueKey}`);

  // Read user stored data
  const [storedNotes, setStoredNotes] = useState(async () => await getUserNotes(issueKey, accountId));

  const createNewNote = async (formData) => {
    logInfo(APP_TYPE.GLANCE_NOTES, `Creating new Note: ${getPrettyfiedJSON(formData)}`);

    const updatedNotes = await addUserNote(issueKey, accountId, formData.newNoteField, storedNotes);

    setStoredNotes(updatedNotes.sort((a, b) => new Date(b.updated) - new Date(a.updated)));
    setModalOpen(false);
  }

  const editNote = async (formData) => {
    logInfo(APP_TYPE.GLANCE_NOTES, `Editing Note: ${noteToEdit.id}`);

    const values = [...storedNotes];
    const updatedNote = values.find(x => x.id === noteToEdit.id);
    updatedNote.note = formData.newNoteField;
    updatedNote.updated = new Date();
    
    const result = await updateUserNotes(issueKey, accountId, values);

    if (result) {
      setStoredNotes(values);    
      setNoteToEdit({});
      setModalOpen(false);
    } else {
      //TODO: Notify ?
    }
  }

  const deleteNote = async (noteId) => {
    logInfo(APP_TYPE.GLANCE_NOTES, `Delete Note: ${noteId}`);

    const notesWithRemoved = storedNotes.filter(x => x.id !== noteId);

    const result = await updateUserNotes(issueKey, accountId, notesWithRemoved);

    if (result)
      setStoredNotes(notesWithRemoved);
    //else 
    // TODO: Show notification ?
  }

  return (
    <Fragment>
      <Button text="Add Note" onClick={() => { setIsEdit(false); setModalOpen(true); }} />

      {/* No notes */}
      {storedNotes && storedNotes.length == 0 && <Text>**You don't have any note yet**</Text>}
      
      {/* Show existing notes */}
      {storedNotes && storedNotes.length > 0 && <Text>**Notes**</Text>}
      {storedNotes && storedNotes.length > 0 && storedNotes.map(note => {
        return <Fragment>
          <Text>
            {note.note}
          </Text>
          <Text>{moment(note.created).format('MM/DD/YY HH:mm:ss')}</Text>
            <ButtonSet>
              <Button text="Edit" onClick={() => { setIsEdit(true); setModalOpen(true); setNoteToEdit(note); }} />
              <Button text="Delete" onClick={() => deleteNote(note.id)} />
            </ButtonSet>
        </Fragment>
      })}

      {/* Create new note / edit modal */}
      {isModalOpen && (
        <ModalDialog header={isEdit ? "Edit Note" : "Add new Note"} onClose={() => setModalOpen(false)}>
          <Form onSubmit={isEdit ? editNote : createNewNote} submitButtonText={isEdit ? "Edit" : "Add Note"}>
            <TextArea isRequired={true} name="newNoteField" label={isEdit ? "Edit Note" : "New Note"} placeholder="Type your new note ... " defaultValue={isEdit ? noteToEdit.note : ''} />
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
