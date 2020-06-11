import ForgeUI, {
    render,
    useProductContext,
    CustomField,
    CustomFieldView,
    Text,
    Avatar
} from "@forge/ui";

import { logInfo, getPrettyfiedJSON, APP_TYPE, logWarning } from './services/log.service';

const App = () => { 
    // Context data
    const { platformContext: { fieldValue, issueKey } } = useProductContext();
    //const issueKey = context.platformContext.issueKey;
    //const accountId = context.accountId;

    logInfo(APP_TYPE.RENDER_MEMBERS, `Rendering members custom field for Issue: ${issueKey}. Current value: ${getPrettyfiedJSON(useProductContext())}`);

    const members = !fieldValue ? [] : fieldValue.split(',');

    return (
        <CustomFieldView>
            {members.length > 0 
                ? members.map(member => <Avatar accountId={member}></Avatar>)
                : <Text>No members specified</Text>
            }
        </CustomFieldView>
    );
};

export const run = render(
    <CustomField view={<App />} />
);