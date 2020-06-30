import ForgeUI, { render, Text, IssueAction, ModalDialog, useState, UserPicker, Table, Head, Cell, Row, useProductContext, Form, Button, Avatar, TextField, Fragment } from '@forge/ui';
import api from '@forge/api';
import { to } from 'await-to-js';

import { logInfo, getPrettyfiedJSON, APP_TYPE, logError } from './services/log.service';

const App = () => {
    const [isOpen, setOpen] = useState(true)
    const [isModalDeleteOpen, setModalDeleteOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState({});
    const [defaultMemberValue, setDefaultMemberValue] = useState('');

    if (!isOpen) {
        return null;
    }

    const { platformContext: { issueKey } } = useProductContext();

    logInfo(APP_TYPE.MODAL_MEMBERS, `Opened action for issue: ${issueKey} to manage members.`); // Keyfield: ${customKeyName}`);

    const getApiPropertyMembers = async () => {
        const result = await api.asApp().requestJira(` /rest/api/3/issue/${issueKey}/properties/regosJiraToolKitIssueMembersForgeField`);

        if (result.status === 200) {
            const data = await result.json();
            logInfo(APP_TYPE.MODAL_MEMBERS, `Loaded properties issue: ${issueKey}. Data: ${getPrettyfiedJSON(data)}`);

            return data.value ? data.value.split(',') : [];
        } else {
            logError(APP_TYPE.MODAL_MEMBERS, `Error reading properties issue: ${issueKey}. Data: ${getPrettyfiedJSON(result)}`);
            return [];
        }
    }

    const [currentMembers, setCurrentMembers] = useState(async () => await getApiPropertyMembers());

    logInfo(APP_TYPE.MODAL_MEMBERS, `Loaded members for issue: ${issueKey}. Data: ${currentMembers}`);

    const addMember = async (data) => {
        if (!data.user) return;

        const lastVersionMembers = await getApiPropertyMembers();

        // Check if user is already on the list
        if (lastVersionMembers) {
            logInfo(APP_TYPE.MODAL_MEMBERS, `Trying to add: ${getPrettyfiedJSON(data.user)}. Existing users: ${getPrettyfiedJSON(lastVersionMembers)}`);

            const userIsAlreadyMember = lastVersionMembers.find(x => x === data.user);
            if (userIsAlreadyMember) {
                logInfo(APP_TYPE.MODAL_MEMBERS, `User is already a member for the issue.`);
                return;
            }
        }

        lastVersionMembers.push(data.user);

        const membersStringified = lastVersionMembers.join(',');

        const [error, result] = await to(api.store.onJiraIssue(issueKey).set('regosJiraToolKitIssueMembersForgeField', membersStringified));

        if (error) {
            logError(APP_TYPE.MODAL_MEMBERS, `Error saving members for issue: ${issueKey}. Error: ${getPrettyfiedJSON(error)}`);
            return;
        }

        setDefaultMemberValue('');
        setCurrentMembers(lastVersionMembers);
        logInfo(APP_TYPE.MODAL_MEMBERS, `Submitted new member: ${getPrettyfiedJSON(result)}.`);
    }

    const deleteMember = async () => {
        logInfo(APP_TYPE.MODAL_MEMBERS, `Remove member: ${memberToDelete} from issue: ${issueKey}.`);

        var lastVersionMembers = await getApiPropertyMembers();

        const memberExist = lastVersionMembers.find(x => memberToDelete);

        if (!memberExist) {
            logInfo(APP_TYPE.MODAL_MEMBERS, `Member: ${memberToDelete} was already removed. We don't do nothing.`);
            setCurrentMembers(lastVersionMembers);
        } else {
            lastVersionMembers = lastVersionMembers.filter(member => member !== memberToDelete);
            const membersStringified = lastVersionMembers.join(',');

            const [error, result] = await to(api.store.onJiraIssue(issueKey).set('regosJiraToolKitIssueMembersForgeField', membersStringified));

            if (error) {
                logError(APP_TYPE.MODAL_MEMBERS, `Error saving members for issue: ${issueKey} when deleting. Error: ${getPrettyfiedJSON(error)}`);
                return;
            }

            setCurrentMembers(lastVersionMembers);
            logInfo(APP_TYPE.MODAL_MEMBERS, `Submitted new member: ${getPrettyfiedJSON(result)}.`);
        }

        setMemberToDelete(null);
        setModalDeleteOpen(false);
    }

    return (
        <ModalDialog header="Manage Members" onClose={() => setOpen(false)} closeButtonText="Close" width="large">
            <Form onSubmit={addMember} submitButtonText='Add member'>
                <UserPicker label="User" name="user"></UserPicker>
            </Form>

            {currentMembers && currentMembers.length > 0
                ?
                <Fragment>
                    <Text>**Current Issue Members**</Text>
                    <Table>
                        <Head>
                            <Cell>
                                <Text content="Member" />
                            </Cell>
                            <Cell>
                                <Text content="" />
                            </Cell>
                        </Head>
                        {currentMembers.map(member => (
                            <Row>
                                <Cell>
                                    <Avatar accountId={member}></Avatar>
                                </Cell>
                                <Cell>
                                    <Button text="⨯" onClick={() => { setModalDeleteOpen(true); setMemberToDelete(member); }} />
                                </Cell>
                            </Row>
                        ))}
                    </Table>
                </Fragment>
                : <Text>**The issue doesn't have any member**</Text>
            }

            {/* Delete modal */}
            {
                isModalDeleteOpen && (
                    <ModalDialog header="Remove Member" onClose={() => setModalDeleteOpen(false)}>
                        <Form onSubmit={deleteMember} submitButtonText="Remove">
                            <Text>**Are you sure you want to remove the member ?**</Text>
                            <Avatar accountId={memberToDelete} />
                        </Form>
                    </ModalDialog>
                )
            }

        </ModalDialog>
    );
};

export const run = render(
    <IssueAction>
        <App />
    </IssueAction>
);